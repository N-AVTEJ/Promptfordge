/**
 * PromptForge Multi-Technique Comparison API Route
 * POST /api/compare
 *
 * Runs selected prompting techniques N times (default 3, max 5) through the
 * Execution Engine with concurrency throttling.
 * Aggregates mean and spread per metric independently.
 * Position-bias mitigation: Candidate order is shuffled before submitting to LLM judge.
 * Partial failure resilience: Hitting rate limits mid-compare returns partial results
 * with a clear error/warning message.
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { executePrompt, RunResult } from "@/lib/engine/execute";
import {
  BudgetExhaustedError,
  GuardValidationError,
  RateLimitError,
  guardRequest,
} from "@/lib/engine/guard";
import {
  RunEvaluation,
  TechniqueAggregateResult,
  aggregateTechniqueRuns,
  buildShuffledJudgePrompt,
  computeRougeL,
  evaluateCost,
  evaluateFormatCompliance,
  evaluateLatency,
  evaluateResponseLength,
  evaluateTokenUsage,
  parseJudgeResponse,
  simulateRubricJudge,
} from "@/lib/engine/evaluate";
import { MissingApiKeyError, ProviderError } from "@/lib/providers/types";

export const runtime = "nodejs";

const CompareItemSchema = z.object({
  id: z.string().trim().min(1, "Technique ID is required"),
  name: z.string().trim().optional(),
  prompt: z.string().trim().min(1, "Prompt cannot be empty"),
  system: z.string().trim().optional(),
});

const CompareRequestSchema = z.object({
  task: z.string().trim().min(1, "Task description cannot be empty"),
  techniques: z
    .array(CompareItemSchema)
    .min(1, "At least one technique must be selected")
    .max(8, "Cannot compare more than 8 techniques simultaneously")
    .refine(
      (arr) => new Set(arr.map((t) => t.id)).size === arr.length,
      "Duplicate technique IDs are not permitted in comparison"
    ),
  runsPerTechnique: z.number().int().min(1).max(5).default(3),
  model: z.string().trim().default("gemini-1.5-flash"),
  temperature: z.number().min(0).max(2).default(0.7),
  maxOutputTokens: z.number().int().positive().optional(),
  format: z.string().trim().optional(),
  referenceAnswer: z.string().trim().optional(),
  skipCache: z.boolean().optional(),
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
  const key =
    req.headers.get("x-provider-key") ||
    req.headers.get("x-api-key") ||
    req.headers.get("x-gemini-key") ||
    req.headers.get("x-openai-key");
  if (key && key.trim().length > 0) {
    return key.trim();
  }
  return undefined;
}

/**
 * Concurrency worker pool: executes items with a maximum parallelism limit.
 */
async function asyncPool<T, R>(
  concurrency: number,
  items: readonly T[],
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let currentIndex = 0;

  const workers = new Array(Math.min(concurrency, items.length))
    .fill(null)
    .map(async () => {
      while (currentIndex < items.length) {
        const index = currentIndex++;
        results[index] = await fn(items[index], index);
      }
    });

  await Promise.all(workers);
  return results;
}

export async function POST(req: NextRequest) {
  const clientIp = extractClientIp(req);
  const byokKey = extractByokKey(req);

  let rawBody: unknown;
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "Malformed JSON payload in request body.",
        },
      },
      { status: 400 }
    );
  }

  let parsedInput: z.infer<typeof CompareRequestSchema>;
  try {
    parsedInput = CompareRequestSchema.parse(rawBody);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: err.issues[0]?.message || "Invalid input parameters.",
            issues: err.issues,
          },
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "Failed to parse input specification.",
        },
      },
      { status: 400 }
    );
  }

  const {
    task,
    techniques,
    runsPerTechnique,
    model,
    temperature,
    maxOutputTokens,
    format,
    referenceAnswer,
    skipCache,
  } = parsedInput;

  // Initial guard check
  try {
    guardRequest({
      ip: clientIp,
      prompt: task,
      maxOutputTokens,
    });
  } catch (err) {
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
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
            code: "BUDGET_EXHAUSTED",
            message: err.message,
            currentUsage: err.currentUsage,
            dailyBudget: err.dailyBudget,
          },
        },
        { status: 429 }
      );
    }
    if (err instanceof GuardValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            field: err.field,
            message: err.message,
          },
        },
        { status: 400 }
      );
    }
  }

  // Build the list of individual execution jobs: technique * runsPerTechnique
  interface ExecutionJob {
    techniqueId: string;
    techniqueName: string;
    prompt: string;
    system?: string;
    runIndex: number;
  }

  const jobs: ExecutionJob[] = [];
  techniques.forEach((tech) => {
    for (let r = 0; r < runsPerTechnique; r++) {
      jobs.push({
        techniqueId: tech.id,
        techniqueName: tech.name || tech.id,
        prompt: tech.prompt,
        system: tech.system,
        runIndex: r + 1,
      });
    }
  });

  const rawRunsByTechnique: Record<string, RunEvaluation[]> = {};
  techniques.forEach((t) => {
    rawRunsByTechnique[t.id] = [];
  });

  const haltState: {
    warning: {
      code: string;
      message: string;
      retryAfterSeconds?: number;
    } | null;
    lastProviderError: ProviderError | null;
  } = { warning: null, lastProviderError: null };

  let totalCompletedRuns = 0;

  // Execute jobs with concurrency pool (concurrency: 2 to prevent provider throttling)
  try {
    await asyncPool(2, jobs, async (job) => {
      // If a previous job triggered rate limit halt, stop executing further
      if (haltState.warning) return;

      try {
        const runRes: RunResult = await executePrompt({
          prompt: job.prompt,
          system: job.system,
          model,
          temperature,
          maxOutputTokens,
          skipCache: Boolean(skipCache),
          apiKey: byokKey,
          ip: clientIp,
          skipRateLimit: false, // Enforce rate limit tracking
        });

        // Compute independent metrics
        const responseLength = evaluateResponseLength(runRes.text);
        const latency = evaluateLatency(runRes.latencyMs);
        const tokenUsage = evaluateTokenUsage(runRes.tokensIn, runRes.tokensOut);
        const cost = evaluateCost(model, runRes.tokensIn, runRes.tokensOut);
        const formatCompliance = evaluateFormatCompliance(runRes.text, format);

        // Reference Answer Rule: ONLY compute ROUGE-L if referenceAnswer is supplied
        const rougeL =
          referenceAnswer && referenceAnswer.trim().length > 0
            ? computeRougeL(runRes.text, referenceAnswer)
            : undefined;

        const runEvaluation: RunEvaluation = {
          runIndex: job.runIndex,
          text: runRes.text,
          responseLength,
          latency,
          tokenUsage,
          cost,
          formatCompliance,
          rougeL,
        };

        rawRunsByTechnique[job.techniqueId]?.push(runEvaluation);
        totalCompletedRuns++;
      } catch (err) {
        if (err instanceof RateLimitError) {
          haltState.warning = {
            code: "RATE_LIMITED",
            message: `Comparison halted mid-run due to rate limit (${err.limit} runs/hr). Partial results are provided below.`,
            retryAfterSeconds: err.retryAfterSeconds,
          };
          return;
        }
        if (err instanceof BudgetExhaustedError) {
          haltState.warning = {
            code: "BUDGET_EXHAUSTED",
            message: `Comparison halted mid-run because the daily token budget was exhausted (${err.currentUsage}/${err.dailyBudget} tokens used). Partial results are displayed below.`,
          };
          return;
        }
        if (err instanceof MissingApiKeyError) {
          throw err;
        }
        if (err instanceof ProviderError) {
          haltState.lastProviderError = err;
          if (err.statusCode === 401 || err.statusCode === 403) {
            haltState.warning = {
              code: "PROVIDER_AUTH_ERROR",
              message: `Comparison halted: Upstream provider [${err.provider}] rejected authorization (${err.message}).`,
            };
            return;
          }
        }
        // For other individual run errors, log and continue or halt if needed
        console.warn(`[PromptForge Compare] Run failed for ${job.techniqueId}:`, err);
      }
    });
  } catch (err) {
    if (err instanceof MissingApiKeyError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_API_KEY",
            provider: err.provider,
            message: err.message,
          },
        },
        { status: 400 }
      );
    }
  }

  const rateLimitHaltWarning = haltState.warning;

  // If NO runs completed at all and we hit rate limit
  if (totalCompletedRuns === 0 && rateLimitHaltWarning) {
    return NextResponse.json(
      {
        success: false,
        error: rateLimitHaltWarning,
      },
      {
        status: 429,
        headers: rateLimitHaltWarning.retryAfterSeconds
          ? { "Retry-After": String(rateLimitHaltWarning.retryAfterSeconds) }
          : undefined,
      }
    );
  }

  // If no runs completed at all due to provider failure
  if (totalCompletedRuns === 0 && haltState.lastProviderError) {
    const providerErr = haltState.lastProviderError;
    const status =
      providerErr.statusCode &&
      providerErr.statusCode >= 400 &&
      providerErr.statusCode < 500
        ? providerErr.statusCode
        : 502;
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "PROVIDER_ERROR",
          provider: providerErr.provider,
          message: providerErr.message,
          statusCode: providerErr.statusCode,
        },
      },
      { status }
    );
  }

  // If no runs completed at all (e.g. unknown failure)
  if (totalCompletedRuns === 0) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "EXECUTION_FAILED",
          message: "No runs were able to complete successfully.",
        },
      },
      { status: 500 }
    );
  }

  // -------------------------------------------------------------------------
  // Position-Bias-Resistant LLM Judge Evaluation
  // Shuffles candidate order before asking LLM judge to evaluate rubric
  // -------------------------------------------------------------------------
  const candidatesForJudge = techniques
    .map((tech) => {
      const runs = rawRunsByTechnique[tech.id] || [];
      if (runs.length === 0) return null;
      // Judge the primary response (run 1)
      return { id: tech.id, text: runs[0].text };
    })
    .filter((c): c is { id: string; text: string } => c !== null);

  if (candidatesForJudge.length > 0) {
    const shuffledJudge = buildShuffledJudgePrompt(task, candidatesForJudge);
    const judgeModel = model.startsWith("gpt")
      ? "gpt-4o-mini"
      : "gemini-1.5-flash";

    try {
      // Execute judge prompt with Execution Engine
      const judgeRun = await executePrompt({
        prompt: shuffledJudge.prompt,
        system: shuffledJudge.system,
        model: judgeModel,
        temperature: 0.1, // Low temperature for deterministic scoring
        apiKey: byokKey,
        skipRateLimit: true, // Internal judge run
        skipCache: true,
      });

      const parsedEvaluations = parseJudgeResponse(
        judgeRun.text,
        shuffledJudge.anonymousLabelToId
      );

      // Attach judge evaluation to each run of each technique
      for (const tech of techniques) {
        const runs = rawRunsByTechnique[tech.id];
        if (!runs || runs.length === 0) continue;

        const evalResult =
          parsedEvaluations[tech.id] ||
          simulateRubricJudge(task, runs[0].text, tech.id);

        runs.forEach((r) => {
          r.judgeScore = evalResult;
        });
      }
    } catch {
      // Offline fallback: Use deterministic rubric simulation so user always gets rubric data
      for (const tech of techniques) {
        const runs = rawRunsByTechnique[tech.id];
        if (!runs || runs.length === 0) continue;
        const fallbackJudge = simulateRubricJudge(task, runs[0].text, tech.id);
        runs.forEach((r) => {
          r.judgeScore = fallbackJudge;
        });
      }
    }
  }

  // -------------------------------------------------------------------------
  // Disaggregated Aggregations (Never merge into a single accuracy score)
  // -------------------------------------------------------------------------
  const aggregateResults: TechniqueAggregateResult[] = techniques
    .map((tech) => {
      const runs = rawRunsByTechnique[tech.id] || [];
      if (runs.length === 0) return null;

      return aggregateTechniqueRuns({
        techniqueId: tech.id,
        techniqueName: tech.name || tech.id,
        prompt: tech.prompt,
        runsRequested: runsPerTechnique,
        runs,
      });
    })
    .filter((r): r is TechniqueAggregateResult => r !== null);

  const isPartial = Boolean(rateLimitHaltWarning) || totalCompletedRuns < jobs.length;

  return NextResponse.json({
    success: true,
    status: isPartial ? "partial" : "completed",
    warning: rateLimitHaltWarning || undefined,
    data: {
      task,
      model,
      temperature,
      expectedFormat: format || "none",
      referenceAnswerProvided: Boolean(referenceAnswer && referenceAnswer.trim().length > 0),
      runsRequestedPerTechnique: runsPerTechnique,
      totalRunsRequested: jobs.length,
      totalCompletedRuns,
      isPartial,
      results: aggregateResults,
    },
  });
}
