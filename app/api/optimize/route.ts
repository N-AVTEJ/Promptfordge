/**
 * PromptForge Prompt Optimization & Tracking API Route
 * POST /api/optimize
 *
 * 1. Analyzes weak prompts for missing context, vague verbs, missing constraints, unanchored roles, and no format.
 * 2. Generates up to 3 evidence-backed improved prompt candidates via the Execution Engine.
 * 3. Runs original and improved prompts through the execution pipeline.
 * 4. Evaluates runs with the Phase 6 independent evaluation engine (never combining metrics).
 * 5. Mitigates judge position bias by shuffling candidate responses.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { executePrompt, RunResult } from "@/lib/engine/execute";
import { isKillSwitchActive, getDemoOptimizeResults } from "@/lib/engine/demo-data";
import {
  BudgetExhaustedError,
  GuardValidationError,
  RateLimitError,
  guardRequest,
} from "@/lib/engine/guard";
import {
  evaluateCost,
  evaluateFormatCompliance,
  evaluateLatency,
  evaluateResponseLength,
  evaluateTokenUsage,
  JudgeEvaluation,
  RunEvaluation,
  buildShuffledJudgePrompt,
  parseJudgeResponse,
  simulateRubricJudge,
} from "@/lib/engine/evaluate";
import {
  analyzeWeakPrompt,
  generatePromptImprovements,
  simulateOptimizedRun,
  ImprovedPromptVersion,
} from "@/lib/engine/optimize";
import { MissingApiKeyError, ProviderError } from "@/lib/providers/types";

export const runtime = "nodejs";

const OptimizeRequestSchema = z.object({
  prompt: z.string().trim().min(1, "Prompt cannot be empty"),
  context: z.string().trim().optional(),
  model: z.string().trim().default("gemini-1.5-flash"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxOutputTokens: z.number().int().positive().optional(),
  simulate: z.boolean().optional(),
});

function cleanIpString(rawIp: string): string {
  let trimmed = rawIp.trim();
  if (trimmed.startsWith("::ffff:")) {
    trimmed = trimmed.slice(7);
  }
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(trimmed)) {
    return trimmed.split(":")[0];
  }
  const bracketMatch = /^\[([a-fA-F0-9:]+)\](?::\d+)?$/.exec(trimmed);
  if (bracketMatch && bracketMatch[1]) {
    return bracketMatch[1];
  }
  return trimmed;
}

function extractClientIp(req: NextRequest): string {
  const reqIp = (req as unknown as { ip?: string }).ip;
  if (reqIp && reqIp.trim().length > 0) {
    return cleanIpString(reqIp);
  }
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return cleanIpString(firstIp);
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return cleanIpString(realIp);
  return "127.0.0.1";
}

function extractByokKey(req: NextRequest): string | undefined {
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice(7).trim();
    if (token.length > 0) return token;
  }
  const custom = req.headers.get("x-api-key");
  if (custom && custom.trim().length > 0) {
    return custom.trim();
  }
  return undefined;
}

export interface MetricDelta {
  original: number;
  improved: number;
  delta: number;
  explanation: string;
}

export interface OptimizedCandidateResponse extends ImprovedPromptVersion {
  run: RunEvaluation;
  judge?: JudgeEvaluation;
  metricsComparison: {
    relevance: MetricDelta;
    clarity: MetricDelta;
    correctness: MetricDelta;
    constraintFollowing: MetricDelta;
    latencyMs: MetricDelta;
    totalTokens: MetricDelta;
    costUsd: MetricDelta;
    words: MetricDelta;
  };
}

export async function POST(req: NextRequest) {
  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MALFORMED_JSON",
          message: "Request body must be valid JSON.",
        },
      },
      { status: 400 }
    );
  }

  const parseResult = OptimizeRequestSchema.safeParse(rawBody);
  if (!parseResult.success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: parseResult.error.issues[0]?.message || "Invalid request.",
          details: parseResult.error.issues,
        },
      },
      { status: 400 }
    );
  }

  const { prompt, context, model, temperature, maxOutputTokens, simulate } =
    parseResult.data;
  const ip = extractClientIp(req);
  const byokKey = extractByokKey(req);

  // Global Kill Switch Check: return cached demo optimization data immediately
  if (isKillSwitchActive()) {
    const demo = getDemoOptimizeResults(prompt, model);
    return NextResponse.json({
      ...demo,
      killSwitch: true,
    });
  }

  // 1. Guardrail validation
  try {
    guardRequest({
      ip,
      prompt,
      maxOutputTokens,
    });
  } catch (err) {
    if (err instanceof GuardValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "GUARD_PAYLOAD_LIMIT", message: err.message },
        },
        { status: 400 }
      );
    }
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: err.message,
            retryAfterSeconds: err.retryAfterSeconds,
          },
        },
        {
          status: 429,
          headers: { "Retry-After": String(err.retryAfterSeconds) },
        }
      );
    }
    if (err instanceof BudgetExhaustedError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DAILY_BUDGET_EXHAUSTED",
            message: err.message,
            currentUsage: err.currentUsage,
            dailyBudget: err.dailyBudget,
          },
        },
        { status: 429 }
      );
    }
  }

  // 2. Weak prompt analysis
  const promptAnalysis = analyzeWeakPrompt(prompt);

  // 3. Generate candidate improvements (up to 3)
  const candidateImprovements = generatePromptImprovements(
    prompt,
    promptAnalysis.diagnoses,
    context
  );

  // 4. Execute original prompt and improved versions
  // Helper to run single prompt with fallback to deterministic simulation
  async function runCandidate(
    candidatePrompt: string,
    variant: "original" | "structured" | "constrained" | "format_engineered"
  ): Promise<{ runResult: RunResult; isSimulated: boolean }> {
    if (simulate) {
      const sim = simulateOptimizedRun(candidatePrompt, variant);
      return {
        runResult: {
          text: sim.text,
          tokensIn: sim.tokensIn,
          tokensOut: sim.tokensOut,
          totalTokens: sim.tokensIn + sim.tokensOut,
          latencyMs: sim.latencyMs,
          costEstimateUsd: sim.tokensIn * 0.000000075 + sim.tokensOut * 0.0000003,
          cached: false,
          model,
          provider: "simulated-engine",
          finishReason: "STOP",
          timestamp: Date.now(),
        },
        isSimulated: true,
      };
    }

    try {
      const result = await executePrompt({
        prompt: candidatePrompt,
        model,
        temperature,
        maxOutputTokens,
        apiKey: byokKey,
        ip,
        skipRateLimit: true, // Batch sub-run
      });
      return { runResult: result, isSimulated: false };
    } catch (err) {
      // If live execution failed due to missing API key or network, fallback to simulation
      if (err instanceof MissingApiKeyError || err instanceof ProviderError) {
        const sim = simulateOptimizedRun(candidatePrompt, variant);
        return {
          runResult: {
            text: sim.text,
            tokensIn: sim.tokensIn,
            tokensOut: sim.tokensOut,
            totalTokens: sim.tokensIn + sim.tokensOut,
            latencyMs: sim.latencyMs,
            costEstimateUsd: sim.tokensIn * 0.000000075 + sim.tokensOut * 0.0000003,
            cached: false,
            model,
            provider: "simulated-engine",
            finishReason: "STOP",
            timestamp: Date.now(),
          },
          isSimulated: true,
        };
      }
      throw err;
    }
  }

  // Execute original
  const originalExec = await runCandidate(prompt, "original");
  const originalRunEval: RunEvaluation = {
    runIndex: 0,
    text: originalExec.runResult.text,
    responseLength: evaluateResponseLength(originalExec.runResult.text),
    latency: evaluateLatency(originalExec.runResult.latencyMs),
    tokenUsage: evaluateTokenUsage(
      originalExec.runResult.tokensIn,
      originalExec.runResult.tokensOut
    ),
    cost: evaluateCost(
      model,
      originalExec.runResult.tokensIn,
      originalExec.runResult.tokensOut
    ),
    formatCompliance: evaluateFormatCompliance(
      originalExec.runResult.text,
      "freeform"
    ),
  };

  // Execute all 3 improvements
  const executedCandidates: Array<{
    candidate: ImprovedPromptVersion;
    runEval: RunEvaluation;
    isSimulated: boolean;
  }> = [];

  for (let i = 0; i < candidateImprovements.length; i++) {
    const cand = candidateImprovements[i];
    const exec = await runCandidate(cand.prompt, cand.strategy);
    const expectedFormat =
      cand.strategy === "format_engineered" ? "markdown" : "freeform";

    const runEval: RunEvaluation = {
      runIndex: i + 1,
      text: exec.runResult.text,
      responseLength: evaluateResponseLength(exec.runResult.text),
      latency: evaluateLatency(exec.runResult.latencyMs),
      tokenUsage: evaluateTokenUsage(
        exec.runResult.tokensIn,
        exec.runResult.tokensOut
      ),
      cost: evaluateCost(
        model,
        exec.runResult.tokensIn,
        exec.runResult.tokensOut
      ),
      formatCompliance: evaluateFormatCompliance(
        exec.runResult.text,
        expectedFormat
      ),
    };

    executedCandidates.push({
      candidate: cand,
      runEval,
      isSimulated: exec.isSimulated,
    });
  }

  // -------------------------------------------------------------------------
  // Position-Bias-Resistant LLM Judge Evaluation
  // Shuffles candidate order before asking LLM judge to evaluate rubric
  // -------------------------------------------------------------------------
  const candidatesForJudge = [
    { id: "original", text: originalRunEval.text },
    ...executedCandidates.map((c) => ({
      id: c.candidate.id,
      text: c.runEval.text,
    })),
  ];

  const shuffledJudge = buildShuffledJudgePrompt(prompt, candidatesForJudge);
  let judgeEvaluations: Record<string, JudgeEvaluation> = {};

  const hasLiveKey =
    !isKillSwitchActive() &&
    Boolean(byokKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY);

  if (hasLiveKey && !simulate) {
    try {
      const judgeRun = await executePrompt({
        prompt: shuffledJudge.prompt,
        system: shuffledJudge.system,
        model: "gemini-1.5-flash",
        temperature: 0.1,
        apiKey: byokKey,
        skipRateLimit: true,
      });
      judgeEvaluations = parseJudgeResponse(
        judgeRun.text,
        shuffledJudge.anonymousLabelToId
      );
    } catch {
      // Fallback to simulated judge rubric if live judge call fails
      judgeEvaluations = {};
    }
  }

  // Ensure all candidates have a valid judge evaluation
  for (const cand of candidatesForJudge) {
    if (!judgeEvaluations[cand.id]) {
      judgeEvaluations[cand.id] = simulateRubricJudge(
        prompt,
        cand.text,
        cand.id
      );
    }
  }

  const originalJudge = judgeEvaluations["original"];

  // Helper to build metric delta with independent explanation string
  function buildDelta(
    name: string,
    origVal: number,
    impVal: number,
    unit: string,
    higherIsBetter: boolean
  ): MetricDelta {
    const delta = Math.round((impVal - origVal) * 1000) / 1000;
    let explanation: string;

    if (delta === 0) {
      explanation = `Identical ${name} (${impVal}${unit}) across both versions.`;
    } else if ((delta > 0 && higherIsBetter) || (delta < 0 && !higherIsBetter)) {
      explanation = `Improved ${name}: shifted by ${delta > 0 ? `+${delta}` : delta}${unit} from ${origVal}${unit} to ${impVal}${unit}.`;
    } else {
      explanation = `Trade-off observed: ${name} shifted by ${delta > 0 ? `+${delta}` : delta}${unit} (${origVal}${unit} → ${impVal}${unit}).`;
    }

    return {
      original: origVal,
      improved: impVal,
      delta,
      explanation,
    };
  }

  // -------------------------------------------------------------------------
  // Build Final Response Payload with Per-Metric Comparisons
  // Core Tenet: Never show one combined score. Show each metric independently.
  // -------------------------------------------------------------------------
  const finalImprovements: OptimizedCandidateResponse[] = executedCandidates.map(
    ({ candidate, runEval }) => {
      const candJudge = judgeEvaluations[candidate.id];

      const metricsComparison = {
        relevance: buildDelta(
          "Relevance",
          originalJudge.relevance.score,
          candJudge.relevance.score,
          "/5",
          true
        ),
        clarity: buildDelta(
          "Clarity",
          originalJudge.clarity.score,
          candJudge.clarity.score,
          "/5",
          true
        ),
        correctness: buildDelta(
          "Correctness",
          originalJudge.correctness.score,
          candJudge.correctness.score,
          "/5",
          true
        ),
        constraintFollowing: buildDelta(
          "Constraint Following",
          originalJudge.constraintFollowing.score,
          candJudge.constraintFollowing.score,
          "/5",
          true
        ),
        latencyMs: buildDelta(
          "Latency",
          originalRunEval.latency.latencyMs,
          runEval.latency.latencyMs,
          "ms",
          false
        ),
        totalTokens: buildDelta(
          "Token Usage",
          originalRunEval.tokenUsage.totalTokens,
          runEval.tokenUsage.totalTokens,
          " tokens",
          false
        ),
        costUsd: buildDelta(
          "Estimated Cost",
          originalRunEval.cost.costUsd,
          runEval.cost.costUsd,
          " USD",
          false
        ),
        words: buildDelta(
          "Word Count",
          originalRunEval.responseLength.words,
          runEval.responseLength.words,
          " words",
          true
        ),
      };

      return {
        ...candidate,
        run: runEval,
        judge: candJudge,
        metricsComparison,
      };
    }
  );

  return NextResponse.json({
    success: true,
    original: {
      prompt,
      analysis: promptAnalysis,
      run: originalRunEval,
      judge: originalJudge,
    },
    improvements: finalImprovements,
  });
}
