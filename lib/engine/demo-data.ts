/**
 * PromptForge Centralized Cached Demo Data & Kill Switch Engine
 *
 * Implements:
 * 1. Global Kill Switch (`PROMPTFORGE_KILL_SWITCH=true` / `NEXT_PUBLIC_DEMO_MODE=true`):
 *    Completely disables live AI upstream calls, protecting budgets and credentials.
 * 2. Cached Demo Mode:
 *    When API is unavailable, unconfigured, or budget is exhausted, labs fall back
 *    to pre-recorded sample results clearly labeled "Demo data".
 */

import type { RunResult } from "./execute";
import type { TechniqueAggregateResult } from "./evaluate";

let testKillSwitchOverride: boolean | null = null;

/**
 * Checks if the global kill switch or demo mode is actively enforcing cached offline execution.
 */
export function isKillSwitchActive(): boolean {
  if (testKillSwitchOverride !== null) {
    return testKillSwitchOverride;
  }
  return (
    process.env.PROMPTFORGE_KILL_SWITCH === "true" ||
    process.env.NEXT_PUBLIC_DEMO_MODE === "true"
  );
}

/**
 * Test helper for simulating kill switch toggle in automated test suites.
 */
export function setTestKillSwitch(active: boolean | null): void {
  testKillSwitchOverride = active;
}

export interface DemoRunResult extends RunResult {
  demoData: true;
  demoNotice: string;
}

/**
 * Pre-recorded responses for single prompt execution in playground or academy labs.
 */
export function getDemoRunResult(prompt: string, model = "gemini-1.5-flash"): DemoRunResult {
  const lower = prompt.toLowerCase();

  let text = "";
  if (lower.includes("sheep") || lower.includes("farmer")) {
    text = `### Step-by-Step Chain-of-Thought Reasoning:

1. **Analyze the problem statement**:
   - The farmer starts with 17 sheep.
   - The prompt states: *"All but 9 run away."*

2. **Semantic interpretation**:
   - The phrase *"All but [N]"* denotes an exclusion set where exactly [N] remain behind.
   - The sheep that ran away = Total - 9 = 17 - 9 = 8 sheep.

3. **Conclusion**:
   - The number of sheep remaining with the farmer is exactly **9 sheep**.`;
  } else if (lower.includes("typescript") || lower.includes("eval") || lower.includes("processitems")) {
    text = `### Principal Security & Performance Audit

**1. Critical Security Vulnerability: Arbitrary Code Execution (\`eval\`)**
- \`eval(item)\` interprets untrusted user strings directly within the JavaScript runtime context.
- **Risk**: Remote Code Execution (RCE) and Cross-Site Scripting (XSS).
- **Remediation**: Replace \`eval()\` with a deterministic parser (e.g. \`JSON.parse()\` with zod validation schema).

\`\`\`typescript
import { z } from "zod";

const ItemSchema = z.object({
  id: z.string(),
  value: z.number(),
});

export function processItems(items: string[]): Array<z.infer<typeof ItemSchema>> {
  return items.map((raw) => ItemSchema.parse(JSON.parse(raw)));
}
\`\`\`

**2. Memory & Performance**:
- Replaced runtime dynamic compiler overhead with zero-eval parsing.`;
  } else if (lower.includes("sentiment") || lower.includes("structured") || lower.includes("extract")) {
    text = `\`\`\`json
{
  "entities": [
    { "name": "Model Latency", "category": "Performance", "status": "Improved" },
    { "name": "Custom Adapters Documentation", "category": "Documentation", "status": "Missing" }
  ],
  "sentiment": "Positive (Engineering velocity) / Constructive (Documentation gap)",
  "urgency": "Medium",
  "action_items": [
    "Draft end-to-end integration guide for custom model adapters",
    "Publish latency benchmark telemetry from Phase 3 release"
  ]
}
\`\`\``;
  } else {
    text = `### PromptForge Synthesized Response

This response demonstrates role-delimited prompt engineering principles:
- **Clarity**: Direct, unambiguous resolution of the instruction.
- **Modularity**: Structured markdown sections for rapid human parsing.
- **Safety**: Guardrails adhered to with zero hallucinated API secrets.

*(Serving cached educational simulation data. Live AI execution was not invoked).*`;
  }

  const tokensIn = Math.max(12, Math.round(prompt.length / 4));
  const tokensOut = Math.max(40, Math.round(text.length / 4));

  return {
    text,
    tokensIn,
    tokensOut,
    totalTokens: tokensIn + tokensOut,
    latencyMs: 142,
    costEstimateUsd: 0.000035,
    cached: true,
    model: `${model} (Demo Data)`,
    provider: "PromptForge Demo Sandbox",
    finishReason: "STOP",
    timestamp: Date.now(),
    demoData: true,
    demoNotice:
      "Demo data: Live AI calls are disabled or daily budget reached. Serving pre-recorded deterministic sandbox results.",
  };
}

/**
 * Pre-recorded multi-technique comparison data for /labs/compare.
 * Invariant: Few-Shot format compliance (100%) strictly beats Zero-Shot (33%)
 * to guarantee reproducible verification of the format challenge.
 */
export function getDemoCompareResults(
  task: string,
  model = "gemini-1.5-flash"
): {
  results: TechniqueAggregateResult[];
  demoData: true;
  demoNotice: string;
} {
  const createMetricSpread = (
    values: number[],
    unit: string,
    desc: string
  ) => {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const stdDev =
      Math.sqrt(
        values.map((x) => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) /
          values.length
      );
    return {
      values,
      mean: Math.round(mean * 100) / 100,
      min,
      max,
      range: Math.round(range * 100) / 100,
      stdDev: Math.round(stdDev * 100) / 100,
      explanation: `${desc} on ${model} (Mean: ${mean.toFixed(2)}${unit}, range: ${range.toFixed(2)}${unit}).`,
    };
  };

  const zeroShotResult: TechniqueAggregateResult = {
    techniqueId: "zero-shot",
    techniqueName: "Zero-Shot Prompting",
    prompt: task,
    runsCompleted: 3,
    runsRequested: 3,
    rawRuns: [],
    latencySpread: createMetricSpread([310, 290, 325], "ms", "Latency"),
    outputTokensSpread: createMetricSpread([120, 145, 110], " tokens", "Output Tokens"),
    inputTokensSpread: createMetricSpread([45, 45, 45], " tokens", "Input Tokens"),
    costSpread: createMetricSpread([0.00004, 0.00005, 0.00004], "$", "Cost"),
    responseLengthCharsSpread: createMetricSpread([520, 610, 480], " chars", "Length"),
    responseLengthWordsSpread: createMetricSpread([85, 95, 78], " words", "Word Count"),
    // Invariant: Zero-shot fails format compliance on 2 out of 3 runs (e.g. wraps in prose)
    formatComplianceSpread: createMetricSpread([0, 1, 0], "", "Format Compliance (0 to 1)"),
    judgeRelevanceSpread: createMetricSpread([3, 4, 3], "/5", "Relevance"),
    judgeCorrectnessSpread: createMetricSpread([3, 4, 3], "/5", "Correctness"),
    judgeClaritySpread: createMetricSpread([3, 4, 3], "/5", "Clarity"),
    judgeConstraintFollowingSpread: createMetricSpread([2, 3, 2], "/5", "Constraint Following"),
    sampleOutput: `Here is the analysis you requested:\n\n{\n  "status": "partial",\n  "note": "Output included informal conversational prefix."\n}`,
  };

  const fewShotResult: TechniqueAggregateResult = {
    techniqueId: "few-shot",
    techniqueName: "Few-Shot In-Context Prompting",
    prompt: `Example 1:\nInput: Extract keys\nOutput: {"keys": ["a", "b"]}\n\nTask:\n${task}`,
    runsCompleted: 3,
    runsRequested: 3,
    rawRuns: [],
    latencySpread: createMetricSpread([340, 330, 355], "ms", "Latency"),
    outputTokensSpread: createMetricSpread([95, 98, 92], " tokens", "Output Tokens"),
    inputTokensSpread: createMetricSpread([110, 110, 110], " tokens", "Input Tokens"),
    costSpread: createMetricSpread([0.00006, 0.00006, 0.00006], "$", "Cost"),
    responseLengthCharsSpread: createMetricSpread([390, 405, 385], " chars", "Length"),
    responseLengthWordsSpread: createMetricSpread([55, 58, 52], " words", "Word Count"),
    // Invariant: Few-shot achieves perfect 1.0 (100%) format compliance across all runs
    formatComplianceSpread: createMetricSpread([1, 1, 1], "", "Format Compliance (0 to 1)"),
    judgeRelevanceSpread: createMetricSpread([5, 5, 5], "/5", "Relevance"),
    judgeCorrectnessSpread: createMetricSpread([5, 5, 5], "/5", "Correctness"),
    judgeClaritySpread: createMetricSpread([5, 5, 4], "/5", "Clarity"),
    judgeConstraintFollowingSpread: createMetricSpread([5, 5, 5], "/5", "Constraint Following"),
    sampleOutput: `{\n  "status": "success",\n  "format": "strict_json",\n  "compliance": 1.0\n}`,
  };

  return {
    results: [zeroShotResult, fewShotResult],
    demoData: true,
    demoNotice:
      "Demo data: Comparison results populated from pre-recorded benchmark runs. Live AI calls disabled.",
  };
}
