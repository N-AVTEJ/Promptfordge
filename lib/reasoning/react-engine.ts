/**
 * ReAct (Reasoning + Acting) Execution Engine
 * Module 4: Chain-of-Thought & Visual Reasoning Strategies
 *
 * Implements alternating Thought (Summary) -> Action -> Observation loop
 * using a sandboxed mock tool suite (safe calculator, knowledge lookup, text telemetry).
 */

import { ReactScenario } from "./types";

export const REACT_EDUCATIONAL_DISCLOSURE =
  "Educational simulation / Thought summaries: Summarized externalized rationale, not private internal reasoning.";

/**
 * Sandboxed safe arithmetic evaluator.
 * Evaluates math expressions without using eval() or Function().
 * Supports binary operators (+, -, *, /, %, ^), unary signs (+, -),
 * parentheses, and verified safe math functions (sqrt, abs, round, floor, ceil).
 */
export function safeCalculate(expression: string): { result: number; error?: string } {
  // Strip whitespace
  const sanitized = expression.replace(/\s+/g, "");

  const SAFE_FUNCS = ["sqrt", "abs", "round", "floor", "ceil"] as const;

  // Only allow numbers, decimals, parentheses, +, -, *, /, %, ^, and alpha characters for safe functions
  if (!/^[\d+\-*/%^().a-zA-Z]+$/.test(sanitized)) {
    return {
      result: 0,
      error: `Invalid expression characters. Only arithmetic operators and safe functions allowed: ${expression}`,
    };
  }

  try {
    // Tokenize
    const tokens: (string | number)[] = [];
    let i = 0;
    while (i < sanitized.length) {
      const ch = sanitized[i];

      if (/[a-zA-Z]/.test(ch)) {
        let fnName = "";
        while (i < sanitized.length && /[a-zA-Z]/.test(sanitized[i])) {
          fnName += sanitized[i];
          i++;
        }
        const lowerFn = fnName.toLowerCase();
        if (!SAFE_FUNCS.includes(lowerFn as (typeof SAFE_FUNCS)[number])) {
          return {
            result: 0,
            error: `Forbidden function or identifier: ${fnName}`,
          };
        }
        tokens.push(lowerFn);
      } else if (ch === "+" || ch === "-") {
        const isUnary =
          tokens.length === 0 ||
          (typeof tokens[tokens.length - 1] === "string" &&
            tokens[tokens.length - 1] !== ")");

        if (isUnary) {
          if (ch === "+") {
            // Unary plus: no-op
            i++;
            continue;
          }
          // Unary minus
          i++;
          if (i < sanitized.length && /[\d.]/.test(sanitized[i])) {
            let numStr = "-";
            while (i < sanitized.length && /[\d.]/.test(sanitized[i])) {
              numStr += sanitized[i];
              i++;
            }
            tokens.push(parseFloat(numStr));
          } else {
            // Unary minus preceding a parenthesis or function: -(expr) -> (-1) * (expr)
            tokens.push(-1);
            tokens.push("*");
          }
        } else {
          tokens.push(ch);
          i++;
        }
      } else if ("*/%^()".includes(ch)) {
        tokens.push(ch);
        i++;
      } else if (/[\d.]/.test(ch)) {
        let numStr = "";
        while (i < sanitized.length && /[\d.]/.test(sanitized[i])) {
          numStr += sanitized[i];
          i++;
        }
        tokens.push(parseFloat(numStr));
      } else {
        i++;
      }
    }

    // Shunting-yard algorithm for safe expression parsing
    const outputQueue: (number | string)[] = [];
    const opStack: string[] = [];
    const precedence: Record<string, number> = {
      "+": 1,
      "-": 1,
      "*": 2,
      "/": 2,
      "%": 2,
      "^": 3,
      sqrt: 4,
      abs: 4,
      round: 4,
      floor: 4,
      ceil: 4,
    };

    for (const token of tokens) {
      if (typeof token === "number") {
        outputQueue.push(token);
      } else if (
        typeof token === "string" &&
        SAFE_FUNCS.includes(token as (typeof SAFE_FUNCS)[number])
      ) {
        opStack.push(token);
      } else if (token in precedence) {
        while (
          opStack.length > 0 &&
          opStack[opStack.length - 1] !== "(" &&
          precedence[opStack[opStack.length - 1]] >= precedence[token]
        ) {
          outputQueue.push(opStack.pop()!);
        }
        opStack.push(token);
      } else if (token === "(") {
        opStack.push(token);
      } else if (token === ")") {
        while (opStack.length > 0 && opStack[opStack.length - 1] !== "(") {
          outputQueue.push(opStack.pop()!);
        }
        if (opStack[opStack.length - 1] === "(") {
          opStack.pop();
        }
        if (
          opStack.length > 0 &&
          SAFE_FUNCS.includes(
            opStack[opStack.length - 1] as (typeof SAFE_FUNCS)[number]
          )
        ) {
          outputQueue.push(opStack.pop()!);
        }
      }
    }

    while (opStack.length > 0) {
      outputQueue.push(opStack.pop()!);
    }

    // Evaluate RPN
    const evalStack: number[] = [];
    for (const item of outputQueue) {
      if (typeof item === "number") {
        evalStack.push(item);
      } else if (
        typeof item === "string" &&
        SAFE_FUNCS.includes(item as (typeof SAFE_FUNCS)[number])
      ) {
        const val = evalStack.pop() ?? 0;
        switch (item) {
          case "sqrt":
            if (val < 0) throw new Error("Cannot take square root of negative number");
            evalStack.push(Math.sqrt(val));
            break;
          case "abs":
            evalStack.push(Math.abs(val));
            break;
          case "round":
            evalStack.push(Math.round(val));
            break;
          case "floor":
            evalStack.push(Math.floor(val));
            break;
          case "ceil":
            evalStack.push(Math.ceil(val));
            break;
        }
      } else {
        const b = evalStack.pop() ?? 0;
        const a = evalStack.pop() ?? 0;
        switch (item) {
          case "+":
            evalStack.push(a + b);
            break;
          case "-":
            evalStack.push(a - b);
            break;
          case "*":
            evalStack.push(a * b);
            break;
          case "/":
            if (b === 0) throw new Error("Division by zero");
            evalStack.push(a / b);
            break;
          case "%":
            evalStack.push(a % b);
            break;
          case "^":
            evalStack.push(Math.pow(a, b));
            break;
        }
      }
    }

    const finalVal = evalStack[0] ?? 0;
    return { result: Number(finalVal.toFixed(6)) };
  } catch (err: unknown) {
    return {
      result: 0,
      error: err instanceof Error ? err.message : "Arithmetic parse error",
    };
  }
}

/**
 * Knowledge Base lookup entries
 */
const KNOWLEDGE_BASE: Record<string, string> = {
  "egress discount":
    "Cloud Egress Tiering: Tier 1 (0-10 TB/mo) = $0.080/GB. Tier 2 (10-50 TB/mo) = $0.050/GB. Tier 3 (50+ TB/mo) = $0.030/GB.",
  "cloud egress":
    "Cloud Egress Tiering: Tier 1 (0-10 TB/mo) = $0.080/GB. Tier 2 (10-50 TB/mo) = $0.050/GB. Tier 3 (50+ TB/mo) = $0.030/GB.",
  "gemini context":
    "Gemini 1.5 Flash: 1,000,000 token context window. Gemini 1.5 Pro: 2,000,000 token context window.",
  "token conversion":
    "English text rule of thumb: 1 token ≈ 4 characters or 0.75 words. 1,000 words ≈ 1,333 tokens.",
  "argon2id":
    "OWASP recommendation for Argon2id: memory m=65536 KiB (64 MiB), iterations t=3, parallelism p=4 threads.",
  "tls latency":
    "TLS 1.3 handshake: 1-RTT (~20-40ms overland, ~100-140ms transoceanic). 0-RTT session resumption saves 1 RTT on repeat connections.",
  "rate limit":
    "Standard sliding window algorithm: token bucket or Redis GCRA ensures zero burst beyond capacity limit.",
};

/**
 * Searches the sandboxed knowledge base.
 */
export function lookupKnowledge(query: string): string {
  const q = query.toLowerCase().trim();
  for (const [key, val] of Object.entries(KNOWLEDGE_BASE)) {
    if (q.includes(key) || key.includes(q)) {
      return val;
    }
  }

  // Fallback fuzzy token search
  const queryTokens = q.split(/\s+/);
  for (const [key, val] of Object.entries(KNOWLEDGE_BASE)) {
    for (const t of queryTokens) {
      if (t.length > 3 && key.includes(t)) {
        return val;
      }
    }
  }

  return `No exact match found in knowledge base for "${query}". Available topics: cloud egress, gemini context, token conversion, argon2id, tls latency, rate limit.`;
}

/**
 * Built-in ReAct Scenarios
 */
export const REACT_SCENARIOS: ReactScenario[] = [
  {
    id: "cloud-egress",
    title: "Cloud Egress Annual Cost Calculation",
    task: "Calculate the total annual expenditure for an enterprise transferring 25 TB of outbound egress per month under cloud tier pricing.",
    expectedFinalAnswer:
      "At 25 TB/month, the enterprise falls into Tier 2 ($0.050/GB). 25 TB = 25,600 GB. Monthly cost = $1,280. Annual expenditure = $15,360.",
    steps: [
      {
        stepNumber: 1,
        type: "thought",
        title: "Step 1: Thought (Summary)",
        content:
          "To compute annual cloud egress cost, I must first look up the pricing tiers to determine the rate per GB for 25 TB/month.",
        educationalNote: "Externalized rationale summary; identifies missing data before action.",
        timestamp: 100,
      },
      {
        stepNumber: 2,
        type: "action",
        title: "Step 2: Action [lookup]",
        content: "lookup('cloud egress')",
        toolName: "lookup",
        toolInput: "cloud egress",
        educationalNote: "Model queries external API / knowledge base for factual data.",
        timestamp: 250,
      },
      {
        stepNumber: 3,
        type: "observation",
        title: "Step 3: Observation",
        content:
          "Cloud Egress Tiering: Tier 1 (0-10 TB/mo) = $0.080/GB. Tier 2 (10-50 TB/mo) = $0.050/GB. Tier 3 (50+ TB/mo) = $0.030/GB.",
        toolOutput:
          "Cloud Egress Tiering: Tier 1 (0-10 TB/mo) = $0.080/GB. Tier 2 (10-50 TB/mo) = $0.050/GB. Tier 3 (50+ TB/mo) = $0.030/GB.",
        educationalNote: "Environment returns ground-truth tool result into context.",
        timestamp: 320,
      },
      {
        stepNumber: 4,
        type: "thought",
        title: "Step 4: Thought (Summary)",
        content:
          "25 TB/month falls into Tier 2 ($0.050/GB). Now convert 25 TB to GB (25 * 1024), multiply by $0.050, and multiply by 12 months for annual cost.",
        educationalNote: "Model plans calculation using verified parameters.",
        timestamp: 450,
      },
      {
        stepNumber: 5,
        type: "action",
        title: "Step 5: Action [calculator]",
        content: "calculator('25 * 1024 * 0.05 * 12')",
        toolName: "calculator",
        toolInput: "25 * 1024 * 0.05 * 12",
        educationalNote: "Delegates arithmetic to a deterministic calculator tool.",
        timestamp: 550,
      },
      {
        stepNumber: 6,
        type: "observation",
        title: "Step 6: Observation",
        content: "15360",
        toolOutput: "15360",
        educationalNote: "Calculator outputs exact verified number.",
        timestamp: 610,
      },
      {
        stepNumber: 7,
        type: "thought",
        title: "Step 7: Thought (Summary)",
        content:
          "The calculated result is 15360. I have all facts verified by tool execution and can synthesize the final response.",
        educationalNote: "Synthesizes final answer with verified confidence.",
        timestamp: 700,
      },
      {
        stepNumber: 8,
        type: "finish",
        title: "Step 8: Final Answer",
        content:
          "At 25 TB per month, the workload qualifies for Tier 2 ($0.050 per GB). Transferring 25 TB = 25,600 GB costs $1,280/month. The total annual egress expenditure is exactly $15,360.",
        educationalNote: "Terminal response delivered to the user.",
        timestamp: 750,
      },
    ],
  },
  {
    id: "argon2id-sizing",
    title: "Argon2id Memory Sizing & SRE Sizing",
    task: "How much server RAM is required to support 250 concurrent password verifications using OWASP-recommended Argon2id parameters?",
    expectedFinalAnswer:
      "OWASP specifies 64 MiB (65,536 KiB) per Argon2id verification. 250 concurrent verifications require 250 * 64 MiB = 16,000 MiB ≈ 15.625 GiB of dedicated RAM.",
    steps: [
      {
        stepNumber: 1,
        type: "thought",
        title: "Step 1: Thought (Summary)",
        content:
          "I need to verify the standard OWASP recommended memory parameter (m) for Argon2id before sizing the server.",
        educationalNote: "Queries security standard database.",
        timestamp: 100,
      },
      {
        stepNumber: 2,
        type: "action",
        title: "Step 2: Action [lookup]",
        content: "lookup('argon2id')",
        toolName: "lookup",
        toolInput: "argon2id",
        educationalNote: "Fetches official memory recommendations.",
        timestamp: 210,
      },
      {
        stepNumber: 3,
        type: "observation",
        title: "Step 3: Observation",
        content:
          "OWASP recommendation for Argon2id: memory m=65536 KiB (64 MiB), iterations t=3, parallelism p=4 threads.",
        toolOutput:
          "OWASP recommendation for Argon2id: memory m=65536 KiB (64 MiB), iterations t=3, parallelism p=4 threads.",
        educationalNote: "Parameter confirmed: 64 MiB per concurrent hash.",
        timestamp: 290,
      },
      {
        stepNumber: 4,
        type: "thought",
        title: "Step 4: Thought (Summary)",
        content:
          "Each verification allocates 64 MiB. For 250 concurrent verifications: 250 * 64 MiB. Then convert to GiB (divide by 1024).",
        educationalNote: "Plans unit conversion calculation.",
        timestamp: 380,
      },
      {
        stepNumber: 5,
        type: "action",
        title: "Step 5: Action [calculator]",
        content: "calculator('(250 * 64) / 1024')",
        toolName: "calculator",
        toolInput: "(250 * 64) / 1024",
        educationalNote: "Computes total gigabytes.",
        timestamp: 460,
      },
      {
        stepNumber: 6,
        type: "observation",
        title: "Step 6: Observation",
        content: "15.625",
        toolOutput: "15.625",
        educationalNote: "Exact result verified: 15.625 GiB.",
        timestamp: 510,
      },
      {
        stepNumber: 7,
        type: "finish",
        title: "Step 7: Final Answer",
        content:
          "OWASP mandates 64 MiB (65,536 KiB) per Argon2id execution. Supporting 250 concurrent verifications requires 16,000 MiB (exactly 15.625 GiB) of peak unswappable physical RAM.",
        educationalNote: "Terminal response delivered with exact units.",
        timestamp: 600,
      },
    ],
  },
];

/**
 * Executes a single tool call dynamically.
 */
export function executeMockTool(
  toolName: string,
  input: string
): { output: string; error?: string } {
  switch (toolName.toLowerCase().trim()) {
    case "calculator": {
      const { result, error } = safeCalculate(input);
      if (error) return { output: `Calculator Error: ${error}`, error };
      return { output: String(result) };
    }
    case "lookup": {
      const res = lookupKnowledge(input);
      return { output: res };
    }
    default:
      return {
        output: `Unknown tool: ${toolName}. Available tools: calculator, lookup`,
        error: "UNKNOWN_TOOL",
      };
  }
}
