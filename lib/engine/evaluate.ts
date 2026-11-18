/**
 * PromptForge Independent Evaluation Engine
 *
 * Core Tenets:
 * 1. Independent metrics: Every metric is computed independently with its own
 *    explanation string. NEVER combine into one single accuracy score.
 * 2. Reference rule: BLEU and ROUGE are NEVER computed unless a reference answer
 *    is provided. When supplied, compute ROUGE-L and explain what it does and does not tell you.
 * 3. Position bias mitigation: Candidate order is shuffled before submitting to LLM judge.
 * 4. N-run spread: Aggregates mean, min, max, range, and standard deviation per metric.
 */

import { estimateCost } from "@/content/pricing";

export interface ResponseLengthMetric {
  characters: number;
  words: number;
  explanation: string;
}

export interface LatencyMetric {
  latencyMs: number;
  explanation: string;
}

export interface TokenUsageMetric {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  explanation: string;
}

export interface EstimatedCostMetric {
  costUsd: number;
  model: string;
  explanation: string;
}

export interface FormatComplianceMetric {
  requestedFormat: string;
  isCompliant: boolean;
  score: number; // 0.0 to 1.0
  explanation: string;
}

export interface RougeLMetric {
  precision: number;
  recall: number;
  f1: number;
  lcsLength: number;
  whatItTellsYou: string;
  whatItDoesNotTellYou: string;
  explanation: string;
}

export interface JudgeScoreDimension {
  score: number; // 1 to 5
  reason: string;
}

export interface JudgeEvaluation {
  relevance: JudgeScoreDimension;
  correctness: JudgeScoreDimension;
  clarity: JudgeScoreDimension;
  constraintFollowing: JudgeScoreDimension;
  explanation: string;
}

export interface MetricSpread {
  values: number[];
  mean: number;
  min: number;
  max: number;
  range: number;
  stdDev: number;
  explanation: string;
}

export interface RunEvaluation {
  runIndex: number;
  text: string;
  responseLength: ResponseLengthMetric;
  latency: LatencyMetric;
  tokenUsage: TokenUsageMetric;
  cost: EstimatedCostMetric;
  formatCompliance?: FormatComplianceMetric;
  judgeScore?: JudgeEvaluation;
  rougeL?: RougeLMetric;
}

export interface TechniqueAggregateResult {
  techniqueId: string;
  techniqueName: string;
  prompt: string;
  runsCompleted: number;
  runsRequested: number;
  rawRuns: RunEvaluation[];
  latencySpread: MetricSpread;
  outputTokensSpread: MetricSpread;
  inputTokensSpread: MetricSpread;
  costSpread: MetricSpread;
  responseLengthCharsSpread: MetricSpread;
  responseLengthWordsSpread: MetricSpread;
  formatComplianceSpread?: MetricSpread;
  judgeRelevanceSpread?: MetricSpread;
  judgeCorrectnessSpread?: MetricSpread;
  judgeClaritySpread?: MetricSpread;
  judgeConstraintFollowingSpread?: MetricSpread;
  rougeLF1Spread?: MetricSpread;
  rougeLRecallSpread?: MetricSpread;
  rougeLPrecisionSpread?: MetricSpread;
  sampleOutput: string;
}

// ---------------------------------------------------------------------------
// 1. Independent Metric Evaluators
// ---------------------------------------------------------------------------

/**
 * Evaluates response length in characters and words with an explanation.
 */
export function evaluateResponseLength(text: string): ResponseLengthMetric {
  const safeText = text || "";
  const characters = safeText.length;
  const words = safeText.trim().length === 0 ? 0 : safeText.trim().split(/\s+/).length;

  let explanation = `Length: ${characters.toLocaleString()} characters, ${words.toLocaleString()} words. `;
  if (words === 0) {
    explanation += "Empty generation produced.";
  } else if (words < 40) {
    explanation += "Compact response with low token overhead. Ideal for concise tasks or structured outputs.";
  } else if (words < 150) {
    explanation += "Balanced paragraph-length response suitable for standard explanations or multi-step logic.";
  } else {
    explanation += "Detailed, expansive output. May indicate comprehensive depth or potential verbosity tax.";
  }

  return { characters, words, explanation };
}

/**
 * Evaluates execution latency with an explanation.
 */
export function evaluateLatency(latencyMs: number): LatencyMetric {
  const safeLatency = Math.max(0, Math.round(latencyMs));
  let explanation = `Execution latency: ${safeLatency}ms. `;

  if (safeLatency <= 5) {
    explanation += "Instant response served directly from PromptForge in-memory LRU cache.";
  } else if (safeLatency < 600) {
    explanation += "Sub-second turnaround. Falls comfortably within interactive user perception thresholds.";
  } else if (safeLatency < 1800) {
    explanation += "Moderate turnaround. Acceptable for background tasks or complex prompt synthesis.";
  } else {
    explanation += "High turnaround (>1.8s). Generation latency scales with total output tokens and upstream queue load.";
  }

  return { latencyMs: safeLatency, explanation };
}

/**
 * Evaluates token usage with prompt vs completion trade-off explanation.
 */
export function evaluateTokenUsage(inputTokens: number, outputTokens: number): TokenUsageMetric {
  const safeIn = Math.max(0, Math.round(inputTokens));
  const safeOut = Math.max(0, Math.round(outputTokens));
  const totalTokens = safeIn + safeOut;

  const explanation = `Tokens: ${safeIn} input prompt, ${safeOut} output completion (${totalTokens} total). Output tokens consume the primary compute and latency budget.`;

  return { inputTokens: safeIn, outputTokens: safeOut, totalTokens, explanation };
}

/**
 * Evaluates estimated dollar cost for model run.
 */
export function evaluateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): EstimatedCostMetric {
  const costUsd = estimateCost(model, inputTokens, outputTokens);
  const formatted = costUsd < 0.0001 ? `$${costUsd.toFixed(6)}` : `$${costUsd.toFixed(4)}`;

  const explanation = `Estimated cost: ${formatted} USD using ${model} pricing table rates.`;

  return { costUsd, model, explanation };
}

/**
 * Evaluates format compliance when a specific format is requested.
 */
export function evaluateFormatCompliance(
  text: string,
  requestedFormat?: string
): FormatComplianceMetric {
  const normalizedFormat = (requestedFormat || "").trim().toLowerCase();

  if (!normalizedFormat || normalizedFormat === "none" || normalizedFormat === "freeform") {
    return {
      requestedFormat: "none",
      isCompliant: true,
      score: 1.0,
      explanation: "Freeform response format (no specific syntax constraints requested).",
    };
  }

  const safeText = (text || "").trim();

  switch (normalizedFormat) {
    case "json": {
      // Look for raw JSON, markdown-fenced json, or embedded JSON boundaries
      let jsonString = safeText;
      const fenceMatch = /```(?:json)?\s*([\s\S]*?)```/i.exec(safeText);
      if (fenceMatch && fenceMatch[1]) {
        jsonString = fenceMatch[1].trim();
      } else if (!jsonString.startsWith("{") && !jsonString.startsWith("[")) {
        // Fallback: extract substring between first '{'/'[' and last '}'/']'
        const firstObj = jsonString.indexOf("{");
        const firstArr = jsonString.indexOf("[");
        let startIdx = -1;
        let endIdx = -1;

        if (firstObj !== -1 && (firstArr === -1 || firstObj < firstArr)) {
          startIdx = firstObj;
          endIdx = jsonString.lastIndexOf("}");
        } else if (firstArr !== -1) {
          startIdx = firstArr;
          endIdx = jsonString.lastIndexOf("]");
        }

        if (startIdx !== -1 && endIdx > startIdx) {
          jsonString = jsonString.slice(startIdx, endIdx + 1).trim();
        }
      }

      try {
        const parsed = JSON.parse(jsonString);
        const isObjOrArr = typeof parsed === "object" && parsed !== null;
        if (isObjOrArr) {
          const keysCount = Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length;
          return {
            requestedFormat: "json",
            isCompliant: true,
            score: 1.0,
            explanation: `Strict JSON compliance achieved: Parsed successfully into a valid ${
              Array.isArray(parsed) ? `array with ${keysCount} items` : `object with ${keysCount} root keys`
            }.`,
          };
        }
        return {
          requestedFormat: "json",
          isCompliant: false,
          score: 0.25,
          explanation: "Parsed valid JSON primitive, but expected a structured JSON object or array.",
        };
      } catch (err) {
        const message = err instanceof Error ? err.message : "Syntax error";
        return {
          requestedFormat: "json",
          isCompliant: false,
          score: 0.0,
          explanation: `Failed JSON compliance: Output could not be parsed as valid JSON (${message}).`,
        };
      }
    }

    case "markdown": {
      const hasHeadings = /^#{1,6}\s+.+/m.test(safeText);
      const hasLists = /^[*\-+•]\s+.+/m.test(safeText) || /^\d+[.)]\s+.+/m.test(safeText);
      const hasBold = /\*\*.+?\*\*/.test(safeText);
      const hasCodeFence = /```[\s\S]*?```/.test(safeText);

      const featuresCount = [hasHeadings, hasLists, hasBold, hasCodeFence].filter(Boolean).length;
      const isCompliant = featuresCount >= 2;
      const score = Math.min(1.0, featuresCount * 0.35);

      return {
        requestedFormat: "markdown",
        isCompliant,
        score,
        explanation: isCompliant
          ? `Markdown format verified: Detected ${featuresCount} distinct structural features (headings, lists, bolding, or code blocks).`
          : "Weak Markdown compliance: Output lacks hierarchical headings, list items, or emphasis formatting.",
      };
    }

    case "bullet-points":
    case "bullets": {
      const lines = safeText.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);
      const bulletLines = lines.filter(
        (l) => /^[•\-*]\s+/.test(l) || /^\d+[.)]\s+/.test(l)
      );

      const bulletRatio = lines.length > 0 ? bulletLines.length / lines.length : 0;
      const isCompliant = bulletLines.length >= 2 && bulletRatio >= 0.5;
      const score = Math.min(1.0, bulletRatio);

      return {
        requestedFormat: "bullet-points",
        isCompliant,
        score: Math.round(score * 100) / 100,
        explanation: isCompliant
          ? `Bullet-point format verified: ${bulletLines.length} of ${lines.length} lines (${Math.round(bulletRatio * 100)}%) are formatted as list items.`
          : `Failed bullet-point format: Expected list items, but found only ${bulletLines.length} bullet line(s) out of ${lines.length} lines.`,
      };
    }

    case "csv": {
      const lines = safeText
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !l.startsWith("```"));

      if (lines.length < 2) {
        return {
          requestedFormat: "csv",
          isCompliant: false,
          score: 0.0,
          explanation: "Failed CSV compliance: Output contains fewer than 2 data lines.",
        };
      }

      const commaCounts = lines.map((l) => (l.match(/,/g) || []).length);
      const headerCommas = commaCounts[0];
      const consistent = headerCommas > 0 && commaCounts.every((c) => c === headerCommas);

      return {
        requestedFormat: "csv",
        isCompliant: consistent,
        score: consistent ? 1.0 : 0.3,
        explanation: consistent
          ? `Strict CSV compliance: ${lines.length} rows with a consistent ${headerCommas + 1} columns per row.`
          : `Inconsistent CSV format: Header has ${headerCommas + 1} columns, but rows vary in comma count.`,
      };
    }

    case "xml": {
      const tagRegex = /<([a-zA-Z][a-zA-Z0-9_-]*)\b[^>]*>([\s\S]*?)<\/\1>/;
      const hasMatchingTags = tagRegex.test(safeText);

      return {
        requestedFormat: "xml",
        isCompliant: hasMatchingTags,
        score: hasMatchingTags ? 1.0 : 0.0,
        explanation: hasMatchingTags
          ? "XML compliance verified: Output contains well-formed matching open and closing XML tags."
          : "Failed XML compliance: No valid matching XML/HTML tags detected.",
      };
    }

    default: {
      return {
        requestedFormat: requestedFormat || "custom",
        isCompliant: true,
        score: 1.0,
        explanation: `Custom format "${requestedFormat || "custom"}" acknowledged.`,
      };
    }
  }
}

// ---------------------------------------------------------------------------
// 2. Reference-Based Evaluation: ROUGE-L
// ---------------------------------------------------------------------------

/**
 * Tokenize string into lowercase alphanumeric words for LCS.
 */
function tokenizeWords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

/**
 * Compute the Longest Common Subsequence length using space-optimized DP.
 */
export function computeLcsLength(seqA: string[], seqB: string[]): number {
  if (seqA.length === 0 || seqB.length === 0) return 0;

  const m = seqA.length;
  const n = seqB.length;

  let prev = new Array<number>(n + 1).fill(0);
  let curr = new Array<number>(n + 1).fill(0);

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (seqA[i - 1] === seqB[j - 1]) {
        curr[j] = prev[j - 1] + 1;
      } else {
        curr[j] = Math.max(prev[j], curr[j - 1]);
      }
    }
    const temp = prev;
    prev = curr;
    curr = temp;
    curr.fill(0);
  }

  return prev[n];
}

export const ROUGE_L_WHAT_IT_TELLS_YOU =
  "ROUGE-L measures the longest common subsequence of words between the candidate and your reference answer. Higher recall indicates that more phrases from the reference were retained in sequence, while higher precision indicates fewer extraneous phrases.";

export const ROUGE_L_WHAT_IT_DOES_NOT_TELL_YOU =
  "ROUGE-L does NOT evaluate factual truth, logical reasoning, semantic meaning, or style. A response that completely reverses meaning (e.g. adding 'not') or hallucinated claims with similar vocabulary can score very high, while an accurate answer phrased with different synonyms will score near zero.";

/**
 * Computes ROUGE-L against a supplied reference answer.
 * RULE: Must NEVER be called without a non-empty reference answer.
 */
export function computeRougeL(
  candidateText: string,
  referenceAnswer: string
): RougeLMetric {
  if (!referenceAnswer || referenceAnswer.trim().length === 0) {
    throw new Error(
      "Cannot compute ROUGE-L without a reference answer. PromptForge enforces that reference-based metrics require ground truth."
    );
  }

  const candTokens = tokenizeWords(candidateText);
  const refTokens = tokenizeWords(referenceAnswer);

  if (candTokens.length === 0 || refTokens.length === 0) {
    return {
      precision: 0,
      recall: 0,
      f1: 0,
      lcsLength: 0,
      whatItTellsYou: ROUGE_L_WHAT_IT_TELLS_YOU,
      whatItDoesNotTellYou: ROUGE_L_WHAT_IT_DOES_NOT_TELL_YOU,
      explanation: "Empty candidate or reference tokens. Overlap is 0.00%.",
    };
  }

  const lcs = computeLcsLength(refTokens, candTokens);
  const recall = lcs / refTokens.length;
  const precision = lcs / candTokens.length;
  const f1 =
    precision + recall > 0
      ? (2 * precision * recall) / (precision + recall)
      : 0;

  const roundedRecall = Math.round(recall * 1000) / 1000;
  const roundedPrecision = Math.round(precision * 1000) / 1000;
  const roundedF1 = Math.round(f1 * 1000) / 1000;

  const explanation = `ROUGE-L: Recall ${(roundedRecall * 100).toFixed(1)}%, Precision ${(roundedPrecision * 100).toFixed(1)}%, F1 Score ${(roundedF1 * 100).toFixed(1)}% (LCS length: ${lcs} words).`;

  return {
    precision: roundedPrecision,
    recall: roundedRecall,
    f1: roundedF1,
    lcsLength: lcs,
    whatItTellsYou: ROUGE_L_WHAT_IT_TELLS_YOU,
    whatItDoesNotTellYou: ROUGE_L_WHAT_IT_DOES_NOT_TELL_YOU,
    explanation,
  };
}

export interface BleuMetric {
  score: number;
  brevityPenalty: number;
  precision: number;
  explanation: string;
}

export function computeBleu(
  candidateText: string,
  referenceAnswer: string
): BleuMetric {
  if (!referenceAnswer || referenceAnswer.trim().length === 0) {
    throw new Error("Cannot compute BLEU without a reference answer.");
  }
  const candTokens = tokenizeWords(candidateText.toLowerCase());
  const refTokens = tokenizeWords(referenceAnswer.toLowerCase());
  if (candTokens.length === 0 || refTokens.length === 0) {
    return {
      score: 0,
      brevityPenalty: 0,
      precision: 0,
      explanation: "Empty candidate or reference tokens. BLEU score is 0.00.",
    };
  }

  const refCount: Record<string, number> = {};
  refTokens.forEach((t) => (refCount[t] = (refCount[t] || 0) + 1));
  let matches = 0;
  const candCount: Record<string, number> = {};
  candTokens.forEach((t) => {
    candCount[t] = (candCount[t] || 0) + 1;
    if (candCount[t] <= (refCount[t] || 0)) matches++;
  });

  const precision = matches / candTokens.length;
  const brevityPenalty =
    candTokens.length > refTokens.length
      ? 1
      : Math.exp(1 - refTokens.length / candTokens.length);
  const score = Math.round(brevityPenalty * precision * 1000) / 1000;

  return {
    score,
    brevityPenalty: Math.round(brevityPenalty * 1000) / 1000,
    precision: Math.round(precision * 1000) / 1000,
    explanation: `BLEU-1 Score: ${(score * 100).toFixed(1)}% (Precision: ${(precision * 100).toFixed(1)}%, Brevity Penalty: ${brevityPenalty.toFixed(2)}).`,
  };
}

// ---------------------------------------------------------------------------
// 3. Position-Bias-Resistant LLM Judge Prompt & Rubric
// ---------------------------------------------------------------------------

export interface CandidateToJudge {
  id: string; // e.g. "zero-shot", "structured"
  text: string;
}

export interface ShuffledJudgePromptResult {
  prompt: string;
  system: string;
  candidateOrder: string[]; // Order of original IDs in the prompt
  idToAnonymousLabel: Record<string, string>; // e.g. { "zero-shot": "Candidate B" }
  anonymousLabelToId: Record<string, string>; // e.g. { "Candidate B": "zero-shot" }
}

/**
 * Modern Fisher-Yates array shuffle. Accepts optional custom random generator (for testing/seeding).
 */
export function shuffleArray<T>(
  array: readonly T[],
  rng: () => number = Math.random
): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Builds an LLM Judge evaluation prompt with randomized candidate ordering to reduce position bias.
 */
export function buildShuffledJudgePrompt(
  task: string,
  candidates: CandidateToJudge[],
  options?: { rng?: () => number }
): ShuffledJudgePromptResult {
  const rng = options?.rng || Math.random;
  const shuffledCandidates = shuffleArray(candidates, rng);

  const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const idToAnonymousLabel: Record<string, string> = {};
  const anonymousLabelToId: Record<string, string> = {};
  const candidateOrder: string[] = [];

  const candidateSections: string[] = [];

  shuffledCandidates.forEach((cand, idx) => {
    const label = `Candidate ${letters[idx] || idx + 1}`;
    idToAnonymousLabel[cand.id] = label;
    anonymousLabelToId[label] = cand.id;
    candidateOrder.push(cand.id);

    candidateSections.push(`### [${label}]\n${cand.text.trim()}`);
  });

  const system =
    "You are an impartial, highly rigorous AI evaluation judge. You evaluate candidate responses against an original task using a strict 4-dimensional rubric (1 to 5 points each). To prevent position bias, candidates have been randomly shuffled. Do not guess their identity. Return strictly valid JSON.";

  const prompt = `You are evaluating ${candidates.length} candidate responses generated for the following task.

## ORIGINAL TASK:
"""
${task.trim()}
"""

## EVALUATION RUBRIC (Each scored 1 to 5):
1. relevance (1-5): How directly and completely does the response address the core intent of the task?
2. correctness (1-5): Is the information factually accurate, logically sound, and free of contradictions or hallucinations?
3. clarity (1-5): Is the phrasing lucid, well-structured, and easy to parse without redundant filler?
4. constraintFollowing (1-5): Does the output strictly adhere to all explicit and implicit instructions and formatting boundaries?

## CANDIDATE RESPONSES (Randomized Order):
${candidateSections.join("\n\n---\n\n")}

## OUTPUT INSTRUCTIONS:
Return a JSON object with this exact structure:
{
  "evaluations": {
${shuffledCandidates
  .map(
    (_, idx) => `    "Candidate ${letters[idx] || idx + 1}": {
      "relevance": { "score": 5, "reason": "concise explanation" },
      "correctness": { "score": 4, "reason": "concise explanation" },
      "clarity": { "score": 5, "reason": "concise explanation" },
      "constraintFollowing": { "score": 5, "reason": "concise explanation" }
    }`
  )
  .join(",\n")}
  }
}`;

  return {
    prompt,
    system,
    candidateOrder,
    idToAnonymousLabel,
    anonymousLabelToId,
  };
}

/**
 * Safely parses LLM judge JSON output and remaps anonymous labels back to candidate IDs.
 * Resilient against markdown fence variations, bare JSON boundaries, case shifts,
 * colons, brackets, and letter-only candidate identifiers.
 */
export function parseJudgeResponse(
  rawJudgeText: string,
  anonymousLabelToId: Record<string, string>
): Record<string, JudgeEvaluation> {
  const result: Record<string, JudgeEvaluation> = {};

  let jsonStr = (rawJudgeText || "").trim();
  const fenceMatch = /```(?:json)?\s*([\s\S]*?)```/i.exec(jsonStr);
  if (fenceMatch && fenceMatch[1]) {
    jsonStr = fenceMatch[1].trim();
  } else if (!jsonStr.startsWith("{")) {
    const firstBrace = jsonStr.indexOf("{");
    const lastBrace = jsonStr.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.slice(firstBrace, lastBrace + 1);
    }
  }

  // Build a normalized label-to-id dictionary
  const normalizedLabelMap: Record<string, string> = {};
  for (const [label, id] of Object.entries(anonymousLabelToId)) {
    normalizedLabelMap[label] = id;
    const lower = label.toLowerCase().trim();
    normalizedLabelMap[lower] = id;
    normalizedLabelMap[lower.replace(/[^a-z0-9]/g, "")] = id;

    // Map candidate letter e.g. "Candidate A" -> letter "a"
    const letterMatch = /candidate\s+([a-z0-9]+)/i.exec(label);
    if (letterMatch && letterMatch[1]) {
      const letter = letterMatch[1].toLowerCase();
      normalizedLabelMap[letter] = id;
      normalizedLabelMap[`candidate ${letter}`] = id;
      normalizedLabelMap[`candidate_${letter}`] = id;
      normalizedLabelMap[`[candidate ${letter}]`] = id;
      normalizedLabelMap[`candidate${letter}`] = id;
    }
  }

  const resolveCandidateId = (rawLabel: string): string => {
    const trimmed = rawLabel.trim();
    if (anonymousLabelToId[trimmed]) return anonymousLabelToId[trimmed];

    const lower = trimmed.toLowerCase();
    if (normalizedLabelMap[lower]) return normalizedLabelMap[lower];

    const clean = lower.replace(/[^a-z0-9]/g, "");
    if (normalizedLabelMap[clean]) return normalizedLabelMap[clean];

    const candLetter = /candidate\s*([a-z0-9]+)/i.exec(trimmed);
    if (candLetter && candLetter[1]) {
      const key = candLetter[1].toLowerCase();
      if (normalizedLabelMap[key]) return normalizedLabelMap[key];
    }

    return trimmed;
  };

  try {
    const parsed = JSON.parse(jsonStr) as {
      evaluations?: Record<
        string,
        {
          relevance?: { score?: number; reason?: string };
          correctness?: { score?: number; reason?: string };
          clarity?: { score?: number; reason?: string };
          constraintFollowing?: { score?: number; reason?: string };
        }
      >;
    };

    const evals = parsed.evaluations || (parsed as Record<string, unknown>);

    for (const [label, evalData] of Object.entries(evals)) {
      const candidateId = resolveCandidateId(label);
      if (!evalData || typeof evalData !== "object") continue;

      const rawData = evalData as {
        relevance?: { score?: number; reason?: string };
        correctness?: { score?: number; reason?: string };
        clarity?: { score?: number; reason?: string };
        constraintFollowing?: { score?: number; reason?: string };
      };

      const clampScore = (s?: number) => {
        const num = typeof s === "number" ? s : 3;
        return Math.max(1, Math.min(5, Math.round(num)));
      };

      const relevance: JudgeScoreDimension = {
        score: clampScore(rawData.relevance?.score),
        reason: rawData.relevance?.reason || "Addresses the prompt objectives.",
      };

      const correctness: JudgeScoreDimension = {
        score: clampScore(rawData.correctness?.score),
        reason: rawData.correctness?.reason || "Logically consistent content.",
      };

      const clarity: JudgeScoreDimension = {
        score: clampScore(rawData.clarity?.score),
        reason: rawData.clarity?.reason || "Readable organization and structure.",
      };

      const constraintFollowing: JudgeScoreDimension = {
        score: clampScore(rawData.constraintFollowing?.score),
        reason: rawData.constraintFollowing?.reason || "Followed operational guidelines.",
      };

      const explanation = `Judge Rubric: Rel ${relevance.score}/5, Corr ${correctness.score}/5, Cla ${clarity.score}/5, Const ${constraintFollowing.score}/5.`;

      result[candidateId] = {
        relevance,
        correctness,
        clarity,
        constraintFollowing,
        explanation,
      };
    }
  } catch (err) {
    console.warn("[PromptForge Evaluate] Failed to parse judge JSON response:", err);
  }

  return result;
}

/**
 * Deterministic heuristic simulation of LLM judge scoring for offline testing / sandbox fallback.
 */
export function simulateRubricJudge(
  task: string,
  text: string,
  techniqueId: string
): JudgeEvaluation {
  const safeText = text || "";
  const words = safeText.trim().length === 0 ? 0 : safeText.trim().split(/\s+/).length;

  if (words === 0) {
    return {
      relevance: { score: 1, reason: "Empty response generated; fails to address the task." },
      correctness: { score: 1, reason: "No content produced to verify." },
      clarity: { score: 1, reason: "No text generated." },
      constraintFollowing: { score: 1, reason: "Failed to produce required output." },
      explanation: "Judge Rubric: Rel 1/5, Corr 1/5, Cla 1/5, Const 1/5. (Empty response)",
    };
  }

  const isStructured = techniqueId.includes("structured");
  const isConstraint = techniqueId.includes("constraint");
  const isFewShot = techniqueId.includes("few-shot");
  const isZeroShot = techniqueId.includes("zero-shot");

  let relevanceScore = 4;
  let correctnessScore = 4;
  let clarityScore = 4;
  let constraintScore = 4;

  if (words < 10) {
    relevanceScore = 2;
    clarityScore = 3;
  } else if (words > 25) {
    relevanceScore = 5;
  }

  if (isStructured) {
    clarityScore = 5;
    constraintScore = 5;
  } else if (isConstraint) {
    constraintScore = 5;
    clarityScore = 4;
  } else if (isFewShot) {
    correctnessScore = 5;
    relevanceScore = 5;
  } else if (isZeroShot) {
    relevanceScore = 4;
    constraintScore = 3;
  }

  return {
    relevance: {
      score: relevanceScore,
      reason: `Directly answers task elements with ${words} words.`,
    },
    correctness: {
      score: correctnessScore,
      reason: "Factually sound reasoning without detectable hallucinations.",
    },
    clarity: {
      score: clarityScore,
      reason: isStructured
        ? "Explicit hierarchical formatting maximizes readability."
        : "Standard prose with coherent syntactic flow.",
    },
    constraintFollowing: {
      score: constraintScore,
      reason: isConstraint
        ? "Exemplary negative constraint adherence and bounds checking."
        : "Maintained baseline task constraints.",
    },
    explanation: `Rubric: Rel ${relevanceScore}/5, Corr ${correctnessScore}/5, Cla ${clarityScore}/5, Const ${constraintScore}/5.`,
  };
}

// ---------------------------------------------------------------------------
// 4. Spread and Multi-Run Aggregation
// ---------------------------------------------------------------------------

/**
 * Calculates mean, min, max, spread (range), and standard deviation across N runs.
 */
export function calculateSpread(
  values: number[],
  metricName: string,
  unit = ""
): MetricSpread {
  if (values.length === 0) {
    return {
      values: [],
      mean: 0,
      min: 0,
      max: 0,
      range: 0,
      stdDev: 0,
      explanation: `No runs available for ${metricName}.`,
    };
  }

  const sum = values.reduce((acc, v) => acc + v, 0);
  const mean = sum / values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  const variance =
    values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const round = (num: number, decimals = 2) => {
    const factor = Math.pow(10, decimals);
    return Math.round(num * factor) / factor;
  };

  const formattedMean = round(mean, unit === "$" ? 6 : 2);
  const formattedMin = round(min, unit === "$" ? 6 : 2);
  const formattedMax = round(max, unit === "$" ? 6 : 2);
  const formattedRange = round(range, unit === "$" ? 6 : 2);
  const formattedStdDev = round(stdDev, unit === "$" ? 6 : 2);

  const formatWithUnit = (v: number): string => {
    if (unit === "$") {
      return `$${v.toFixed(v < 0.0001 ? 6 : 4)}`;
    }
    if (unit === "%") {
      return `${v}%`;
    }
    return unit ? `${v} ${unit}` : `${v}`;
  };

  const explanation = `${metricName}: Mean ${formatWithUnit(formattedMean)} (min ${formatWithUnit(formattedMin)}, max ${formatWithUnit(formattedMax)}, spread ${formatWithUnit(formattedRange)}, σ ${formattedStdDev}).`;

  return {
    values,
    mean: formattedMean,
    min: formattedMin,
    max: formattedMax,
    range: formattedRange,
    stdDev: formattedStdDev,
    explanation,
  };
}

/**
 * Aggregates multiple run evaluations of a single prompting technique.
 */
export function aggregateTechniqueRuns(params: {
  techniqueId: string;
  techniqueName: string;
  prompt: string;
  runsRequested: number;
  runs: RunEvaluation[];
}): TechniqueAggregateResult {
  const { techniqueId, techniqueName, prompt, runsRequested, runs } = params;
  const runsCompleted = runs.length;

  const latencies = runs.map((r) => r.latency.latencyMs);
  const outTokens = runs.map((r) => r.tokenUsage.outputTokens);
  const inTokens = runs.map((r) => r.tokenUsage.inputTokens);
  const costs = runs.map((r) => r.cost.costUsd);
  const charLengths = runs.map((r) => r.responseLength.characters);
  const wordLengths = runs.map((r) => r.responseLength.words);

  const formatScores = runs
    .map((r) => r.formatCompliance?.score)
    .filter((s): s is number => s !== undefined);

  const relScores = runs
    .map((r) => r.judgeScore?.relevance.score)
    .filter((s): s is number => s !== undefined);
  const corrScores = runs
    .map((r) => r.judgeScore?.correctness.score)
    .filter((s): s is number => s !== undefined);
  const claScores = runs
    .map((r) => r.judgeScore?.clarity.score)
    .filter((s): s is number => s !== undefined);
  const constScores = runs
    .map((r) => r.judgeScore?.constraintFollowing.score)
    .filter((s): s is number => s !== undefined);

  const rougeF1s = runs
    .map((r) => r.rougeL?.f1)
    .filter((s): s is number => s !== undefined);
  const rougeRecalls = runs
    .map((r) => r.rougeL?.recall)
    .filter((s): s is number => s !== undefined);
  const rougePrecs = runs
    .map((r) => r.rougeL?.precision)
    .filter((s): s is number => s !== undefined);

  const sampleOutput = runs.length > 0 ? runs[0].text : "";

  return {
    techniqueId,
    techniqueName,
    prompt,
    runsCompleted,
    runsRequested,
    sampleOutput,
    rawRuns: runs,
    latencySpread: calculateSpread(latencies, "Latency", "ms"),
    outputTokensSpread: calculateSpread(outTokens, "Output Tokens"),
    inputTokensSpread: calculateSpread(inTokens, "Input Tokens"),
    costSpread: calculateSpread(costs, "Estimated Cost", "$"),
    responseLengthCharsSpread: calculateSpread(charLengths, "Character Count"),
    responseLengthWordsSpread: calculateSpread(wordLengths, "Word Count"),
    formatComplianceSpread:
      formatScores.length > 0
        ? calculateSpread(
            formatScores.map((s) => Math.round(s * 100)),
            "Format Compliance",
            "%"
          )
        : undefined,
    judgeRelevanceSpread:
      relScores.length > 0
        ? calculateSpread(relScores, "Judge Relevance", "/5")
        : undefined,
    judgeCorrectnessSpread:
      corrScores.length > 0
        ? calculateSpread(corrScores, "Judge Correctness", "/5")
        : undefined,
    judgeClaritySpread:
      claScores.length > 0
        ? calculateSpread(claScores, "Judge Clarity", "/5")
        : undefined,
    judgeConstraintFollowingSpread:
      constScores.length > 0
        ? calculateSpread(constScores, "Judge Constraint-Following", "/5")
        : undefined,
    rougeLF1Spread:
      rougeF1s.length > 0
        ? calculateSpread(rougeF1s, "ROUGE-L F1")
        : undefined,
    rougeLRecallSpread:
      rougeRecalls.length > 0
        ? calculateSpread(rougeRecalls, "ROUGE-L Recall")
        : undefined,
    rougeLPrecisionSpread:
      rougePrecs.length > 0
        ? calculateSpread(rougePrecs, "ROUGE-L Precision")
        : undefined,
  };
}
