/**
 * PromptForge Prompt Optimization & Diagnosis Engine
 *
 * Diagnoses weaknesses in prompts:
 * 1. Missing Context & Target Audience
 * 2. Vague Operational Verbs
 * 3. Absence of Negative or Operational Constraints
 * 4. Missing Output Structure or Schema
 * 5. Unanchored Expert Persona
 *
 * Generates up to 3 evidence-backed improved versions and annotates
 * line-by-line diffs with pedagogical rationale.
 */

import { computeLineDiff, DiffResult } from "./diff";

export type DiagnosisCategory =
  | "missing_context"
  | "vague_verbs"
  | "no_constraints"
  | "no_format"
  | "unanchored_role";

export type DiagnosisSeverity = "critical" | "warning" | "info";

export interface DiagnosisItem {
  id: string;
  category: DiagnosisCategory;
  severity: DiagnosisSeverity;
  title: string;
  description: string;
  suggestion: string;
  detectedTriggers?: string[];
}

export interface PromptAnalysis {
  prompt: string;
  wordCount: number;
  charCount: number;
  diagnoses: DiagnosisItem[];
  score: number; // 0 to 100 quality indicator
  qualityTier: "weak" | "moderate" | "strong" | "production-grade";
}

export interface PromptChange {
  id: string;
  type: "addition" | "modification" | "constraint" | "format";
  description: string;
  reason: string;
  lineNumber?: number;
}

export interface ImprovedPromptVersion {
  id: string;
  strategy: "structured" | "constrained" | "format_engineered";
  title: string;
  description: string;
  prompt: string;
  changes: PromptChange[];
  diff: DiffResult;
  diagnosesAddressed: string[]; // DiagnosisItem['id']
}

// ---------------------------------------------------------------------------
// 1. Weak Prompt Diagnosis Engine
// ---------------------------------------------------------------------------

const VAGUE_VERBS = [
  "write",
  "make",
  "explain",
  "do",
  "help",
  "talk about",
  "give me",
  "tell me",
  "create",
  "generate",
  "look into",
  "discuss",
  "show me",
  "work on",
  "say something",
];

export const PRECISE_ACTION_VERBS = [
  "synthesize",
  "analyze",
  "categorize",
  "audit",
  "diagnose",
  "itemize",
  "tabulate",
  "extract",
  "formulate",
  "debug",
  "contrast",
  "deconstruct",
  "evaluate",
];

/**
 * Diagnoses weaknesses in a raw user prompt.
 * Guarantee: A deliberately vague prompt like "write about dogs" produces >= 3 diagnoses.
 */
export function analyzeWeakPrompt(rawPrompt: string): PromptAnalysis {
  const prompt = (rawPrompt || "").trim();
  const words = prompt.length === 0 ? [] : prompt.split(/\s+/);
  const wordCount = words.length;
  const charCount = prompt.length;

  const diagnoses: DiagnosisItem[] = [];

  // 1. VAGUE VERBS DIAGNOSIS
  const lowerPrompt = prompt.toLowerCase();
  const matchedVerbs: string[] = [];

  for (const verb of VAGUE_VERBS) {
    const regex = new RegExp(`\\b${verb}\\b`, "i");
    if (regex.test(lowerPrompt)) {
      matchedVerbs.push(verb);
    }
  }

  // Also check if prompt starts directly with a vague verb
  const startsWithVagueVerb = VAGUE_VERBS.some((v) =>
    lowerPrompt.startsWith(v)
  );

  if (matchedVerbs.length > 0 || startsWithVagueVerb) {
    diagnoses.push({
      id: "diag-vague-verbs",
      category: "vague_verbs",
      severity: "critical",
      title: "Vague Operational Directives",
      description: `The prompt relies on ambiguous action verb(s) (${matchedVerbs.slice(0, 3).map((v) => `"${v}"`).join(", ") || "open-ended commands"}) without defining the specific analytical operations, depth, or deliverables expected.`,
      suggestion:
        "Replace generic verbs with high-leverage directives such as 'Synthesize a comparative breakdown', 'Itemize with clinical evidence', or 'Contrast behavioral traits'.",
      detectedTriggers: matchedVerbs.slice(0, 4),
    });
  }

  // 2. MISSING CONTEXT & TARGET AUDIENCE DIAGNOSIS
  const contextMarkers = [
    "context",
    "audience",
    "scenario",
    "background",
    "target reader",
    "for users",
    "situation",
    "use case",
    "purpose",
    "objective",
  ];
  const hasContextMarker = contextMarkers.some((m) =>
    lowerPrompt.includes(m)
  );

  // Short prompts (< 25 words) without context markers clearly lack situational framing
  if (!hasContextMarker || wordCount < 20) {
    diagnoses.push({
      id: "diag-missing-context",
      category: "missing_context",
      severity: "critical",
      title: "Missing Context & Target Audience",
      description:
        "No target audience, domain scope, or background context is provided. The model must guess whether this is for beginners, practitioners, academic researchers, or children.",
      suggestion:
        "Specify the target reader, domain background, and operational scenario (e.g. 'For prospective first-time dog owners evaluating adoption...').",
    });
  }

  // 3. NO CONSTRAINTS DIAGNOSIS
  const negativeConstraintMarkers = [
    "do not",
    "don't",
    "never",
    "avoid",
    "without",
    "exclude",
    "must not",
    "no filler",
    "refrain from",
    "prohibit",
  ];
  const lengthConstraintMarkers = [
    "limit to",
    "maximum",
    "max words",
    "words or fewer",
    "sentences",
    "under ",
    "at most",
    "keep under",
    "concise",
  ];

  const hasNegativeConstraint = negativeConstraintMarkers.some((m) =>
    lowerPrompt.includes(m)
  );
  const hasLengthConstraint = lengthConstraintMarkers.some((m) =>
    lowerPrompt.includes(m)
  );

  if (!hasNegativeConstraint && !hasLengthConstraint) {
    diagnoses.push({
      id: "diag-no-constraints",
      category: "no_constraints",
      severity: "warning",
      title: "Absence of Operational & Negative Constraints",
      description:
        "Lacks negative boundaries and length bounds. Without constraints, language models default to conversational preamble, generic filler, and unrestrained output length.",
      suggestion:
        "Add explicit negative constraints ('Avoid introductory conversational filler', 'Do not repeat generic facts') and a strict word/sentence boundary.",
    });
  }

  // 4. NO FORMAT SPECIFICATION DIAGNOSIS
  const formatMarkers = [
    "format",
    "markdown",
    "json",
    "table",
    "bullet",
    "schema",
    "headers",
    "sections",
    "xml",
    "csv",
    "checklist",
    "numbered list",
    "yaml",
  ];
  const hasFormatMarker = formatMarkers.some((m) => lowerPrompt.includes(m));

  if (!hasFormatMarker) {
    diagnoses.push({
      id: "diag-no-format",
      category: "no_format",
      severity: "warning",
      title: "Unspecified Output Structure & Format",
      description:
        "No output formatting or architectural schema is specified. The model will produce arbitrary prose paragraphs, making the result difficult to scan or parse.",
      suggestion:
        "Mandate a concrete format: Markdown headers (### Overview, ### Key Traits), bulleted checklists, or structured JSON.",
    });
  }

  // 5. UNANCHORED ROLE / PERSONA DIAGNOSIS
  const roleMarkers = [
    "you are",
    "act as",
    "role:",
    "persona:",
    "as a",
    "as an",
  ];
  const hasRoleMarker = roleMarkers.some((m) => lowerPrompt.includes(m));

  if (!hasRoleMarker) {
    diagnoses.push({
      id: "diag-unanchored-role",
      category: "unanchored_role",
      severity: "info",
      title: "Unanchored Expert Persona",
      description:
        "No expert persona or domain role is assigned. Establishing a role primes the model's specialized vocabulary and logical perspective.",
      suggestion:
        "Anchor the prompt with an expert role (e.g. 'You are an experienced veterinary behavioral specialist and animal nutritionist.').",
    });
  }

  // Calculate heuristic quality score (0 to 100)
  // Deduct based on severity of diagnoses
  let score = 100;
  for (const diag of diagnoses) {
    if (diag.severity === "critical") score -= 25;
    else if (diag.severity === "warning") score -= 15;
    else score -= 10;
  }
  score = Math.max(10, Math.min(100, score));

  let qualityTier: PromptAnalysis["qualityTier"] = "weak";
  if (score >= 80) qualityTier = "production-grade";
  else if (score >= 60) qualityTier = "strong";
  else if (score >= 40) qualityTier = "moderate";

  return {
    prompt,
    wordCount,
    charCount,
    diagnoses,
    score,
    qualityTier,
  };
}

// ---------------------------------------------------------------------------
// 2. Prompt Improvement Generator
// ---------------------------------------------------------------------------

interface TopicExtraction {
  topic: string;
  expertRole: string;
  targetAudience: string;
}

/**
 * Extracts topic keywords and infers relevant persona and context.
 */
function extractTopicMetadata(prompt: string): TopicExtraction {
  const clean = prompt
    .replace(/^(write|make|explain|talk about|give me|tell me|generate|create)\s*(a|an|about|on)?\s*/i, "")
    .trim();

  const lower = clean.toLowerCase();

  if (lower.includes("dog") || lower.includes("pet") || lower.includes("canine") || lower.includes("puppy")) {
    return {
      topic: "canine care, behavioral traits, and responsible ownership",
      expertRole: "Veterinary Behavioral Specialist and Canine Nutritionist",
      targetAudience: "prospective and first-time dog owners preparing for adoption",
    };
  }

  if (lower.includes("recursion") || lower.includes("algorithm") || lower.includes("call stack") || lower.includes("data structure")) {
    return {
      topic: "recursive algorithms, call stack frames, and termination base cases",
      expertRole: "Staff Computer Science Educator and Systems Architect",
      targetAudience: "software engineering apprentices mastering memory models",
    };
  }

  if (lower.includes("email") || lower.includes("marketing") || lower.includes("copy") || lower.includes("sales")) {
    return {
      topic: "high-conversion B2B messaging and value proposition delivery",
      expertRole: "Principal Direct-Response Copywriter & Communications Director",
      targetAudience: "executive decision makers and technical leads",
    };
  }

  if (
    lower.includes("auth") ||
    lower.includes("middleware") ||
    lower.includes("jwt") ||
    lower.includes("token") ||
    lower.includes("nextjs") ||
    lower.includes("backend") ||
    lower.includes("api route")
  ) {
    return {
      topic: "production Next.js authentication middleware with session validation and security headers",
      expertRole: "Principal Cloud Systems & Security Architect",
      targetAudience: "senior TypeScript engineers building production web applications",
    };
  }

  // General fallback
  const fallbackTopic = clean.length > 0 ? clean : "the specified domain";
  return {
    topic: fallbackTopic,
    expertRole: "Senior Domain Specialist & Technical Consultant",
    targetAudience: "technical practitioners seeking rigorous, actionable insights",
  };
}

/**
 * Generates up to 3 improved prompt versions for a weak prompt.
 */
export function generatePromptImprovements(
  originalPrompt: string,
  diagnoses: DiagnosisItem[],
  customContext?: string
): ImprovedPromptVersion[] {
  const meta = extractTopicMetadata(originalPrompt);
  const userAudience = customContext?.trim() || meta.targetAudience;

  // -------------------------------------------------------------------------
  // Version 1: Structured & Contextualized
  // Focus: Persona + Context + Structured Hierarchy + Explicit Sections
  // -------------------------------------------------------------------------
  const v1Prompt = [
    `You are an authoritative ${meta.expertRole}.`,
    "",
    `### Context & Target Audience:`,
    `This guide is engineered for ${userAudience}.`,
    `Address foundational concepts without talking down, while avoiding unnecessary jargon.`,
    "",
    `### Core Directive:`,
    `Provide a comprehensive, evidence-grounded synthesis on ${meta.topic}.`,
    "",
    `### Required Sections:`,
    `1. **Executive Overview**: Define core principles and significance in 2 concise paragraphs.`,
    `2. **Key Architectural Pillars**: Itemize 3 to 4 critical dimensions with real-world examples.`,
    `3. **Common Pitfalls & Mitigations**: List 3 frequent misunderstandings and how to prevent them.`,
    `4. **Actionable Checklist**: Step-by-step verification points for immediate execution.`,
  ].join("\n");

  const v1Changes: PromptChange[] = [
    {
      id: "v1-change-1",
      type: "addition",
      description: `Anchored prompt with authoritative persona (${meta.expertRole}).`,
      reason: "Priming an expert persona activates domain-specific reasoning and precise vocabulary.",
      lineNumber: 1,
    },
    {
      id: "v1-change-2",
      type: "addition",
      description: `Specified target audience and reading level (${userAudience}).`,
      reason: "Eliminates ambiguity so the model matches vocabulary and depth to reader needs.",
      lineNumber: 4,
    },
    {
      id: "v1-change-3",
      type: "modification",
      description: `Replaced vague verbs with 'evidence-grounded synthesis'.`,
      reason: "Directs the model to synthesize verified insights rather than generating generic prose.",
      lineNumber: 8,
    },
    {
      id: "v1-change-4",
      type: "format",
      description: "Mandated 4-part hierarchical Markdown structure with clear sections.",
      reason: "Hierarchical sections prevent model wandering and produce easily scannable output.",
      lineNumber: 11,
    },
  ];

  const v1Diff = computeLineDiff(originalPrompt, v1Prompt);
  attachReasonsToDiff(v1Diff, v1Changes);

  // -------------------------------------------------------------------------
  // Version 2: Constraint-Driven & Scoped
  // Focus: Negative Constraints + Strict Length Cap + Anti-Hallucination
  // -------------------------------------------------------------------------
  const v2Prompt = [
    `You are a concise ${meta.expertRole}.`,
    "",
    `### Task:`,
    `Analyze and categorize the essential components of ${meta.topic} for ${userAudience}.`,
    "",
    `### Strict Operational Constraints:`,
    `- **Negative Constraint**: Do NOT include conversational filler, pleasantries (e.g. "Sure!", "Here is..."), or concluding summaries.`,
    `- **Length Constraint**: Keep the entire response strictly between 180 and 260 words.`,
    `- **Density**: Present each key point as an unembellished bullet with 1 bold lead-in phrase followed by 2 factual sentences.`,
    `- **Verification**: Only state empirical facts; do not speculate or include unsubstantiated claims.`,
  ].join("\n");

  const v2Changes: PromptChange[] = [
    {
      id: "v2-change-1",
      type: "addition",
      description: `Added expert persona with concise disposition.`,
      reason: "Establishes a crisp tone baseline.",
      lineNumber: 1,
    },
    {
      id: "v2-change-2",
      type: "constraint",
      description: "Added strict negative constraint forbidding conversational filler.",
      reason: "Cuts out 20-40 useless preamble tokens and avoids sycophantic chat behavior.",
      lineNumber: 7,
    },
    {
      id: "v2-change-3",
      type: "constraint",
      description: "Enforced strict word length cap (180 to 260 words).",
      reason: "Binds compute latency and token cost while forcing high-information density.",
      lineNumber: 8,
    },
    {
      id: "v2-change-4",
      type: "format",
      description: "Defined single bold lead-in bullet rule with 2-sentence cap.",
      reason: "Ensures uniform visual scanning and prevents runaway paragraphs.",
      lineNumber: 9,
    },
  ];

  const v2Diff = computeLineDiff(originalPrompt, v2Prompt);
  attachReasonsToDiff(v2Diff, v2Changes);

  // -------------------------------------------------------------------------
  // Version 3: Specification & Format-Engineered
  // Focus: Tabular Comparison + Markdown Schema + Key Metrics
  // -------------------------------------------------------------------------
  const v3Prompt = [
    `### Role: ${meta.expertRole}`,
    `### Objective: Systematic breakdown of ${meta.topic} for ${userAudience}.`,
    "",
    `### Output Format Requirements:`,
    `Deliver your response following this exact Markdown specification:`,
    "",
    `#### 1. Core Definition (1 paragraph, max 60 words)`,
    `[Crisp, formal definition with zero preamble]`,
    "",
    `#### 2. Comparative Matrix`,
    `| Dimension | Best Practices | Common Anti-Pattern | Impact / Trade-off |`,
    `| :--- | :--- | :--- | :--- |`,
    `| [Dimension 1] | [Actionable practice] | [Flawed approach] | [Direct outcome] |`,
    `| [Dimension 2] | [Actionable practice] | [Flawed approach] | [Direct outcome] |`,
    `| [Dimension 3] | [Actionable practice] | [Flawed approach] | [Direct outcome] |`,
    "",
    `#### 3. Critical Failure Mode & Solution`,
    `- **Single Highest-Risk Pitfall**: [Describe mechanism]`,
    `- **Guaranteed Countermeasure**: [Concrete protocol]`,
  ].join("\n");

  const v3Changes: PromptChange[] = [
    {
      id: "v3-change-1",
      type: "addition",
      description: "Formally tagged Role and Objective headers.",
      reason: "Provides unambiguous boundary delimiters that anchor model attention.",
      lineNumber: 1,
    },
    {
      id: "v3-change-2",
      type: "format",
      description: "Mandated 4-column Comparative Matrix table.",
      reason: "Tabular comparisons force parallel evaluation and eliminate conversational fluff.",
      lineNumber: 10,
    },
    {
      id: "v3-change-3",
      type: "constraint",
      description: "Capped core definition to a strict 60 words.",
      reason: "Forces an elevator-pitch summary without room for repetition.",
      lineNumber: 7,
    },
    {
      id: "v3-change-4",
      type: "modification",
      description: "Focused closing on highest-risk failure mode and countermeasure.",
      reason: "High pedagogical ROI: learners remember failure prevention better than generic advice.",
      lineNumber: 18,
    },
  ];

  const v3Diff = computeLineDiff(originalPrompt, v3Prompt);
  attachReasonsToDiff(v3Diff, v3Changes);

  return [
    {
      id: "opt-structured",
      strategy: "structured",
      title: "Structured & Contextualized",
      description:
        "Establishes an authoritative persona, defines target audience context, and structures output into 4 clear hierarchical sections.",
      prompt: v1Prompt,
      changes: v1Changes,
      diff: v1Diff,
      diagnosesAddressed: [
        "diag-vague-verbs",
        "diag-missing-context",
        "diag-no-format",
        "diag-unanchored-role",
      ],
    },
    {
      id: "opt-constrained",
      strategy: "constrained",
      title: "Constraint-Driven & Scoped",
      description:
        "Applies strict negative constraints, anti-filler guardrails, and explicit word boundaries to produce high-density output.",
      prompt: v2Prompt,
      changes: v2Changes,
      diff: v2Diff,
      diagnosesAddressed: [
        "diag-vague-verbs",
        "diag-no-constraints",
        "diag-missing-context",
        "diag-unanchored-role",
      ],
    },
    {
      id: "opt-formatted",
      strategy: "format_engineered",
      title: "Specification & Format-Engineered",
      description:
        "Forces a rigid Markdown schema with comparative tabular matrix, strict paragraph caps, and critical failure mode isolation.",
      prompt: v3Prompt,
      changes: v3Changes,
      diff: v3Diff,
      diagnosesAddressed: [
        "diag-vague-verbs",
        "diag-no-format",
        "diag-no-constraints",
        "diag-missing-context",
      ],
    },
  ];
}

/**
 * Attaches pedagogical reasons to corresponding diff lines where applicable.
 */
function attachReasonsToDiff(diff: DiffResult, changes: PromptChange[]): void {
  for (const line of diff.lines) {
    if (line.type === "added" || line.type === "modified") {
      const rawText = (line.newText || line.text || "").trim();
      // Never assign reasons to empty/whitespace lines
      if (rawText.length === 0) {
        line.reason = undefined;
        continue;
      }

      const lineText = rawText.toLowerCase();

      // Find matching change based on semantic content
      let matchedReason: string | undefined;

      for (const change of changes) {
        const desc = change.description.toLowerCase();

        // 1. Role / Persona
        if (
          (desc.includes("persona") || desc.includes("role")) &&
          (lineText.includes("you are") || lineText.includes("### role") || lineText.includes("specialist") || lineText.includes("architect") || lineText.includes("authoritative"))
        ) {
          matchedReason = change.reason;
          break;
        }

        // 2. Audience / Context
        if (
          (desc.includes("audience") || desc.includes("context") || desc.includes("objective")) &&
          (lineText.includes("audience") || lineText.includes("context") || lineText.includes("engineered for") || lineText.includes("### objective") || lineText.includes("target"))
        ) {
          matchedReason = change.reason;
          break;
        }

        // 3. Directive / Verbs
        if (
          (desc.includes("verb") || desc.includes("directive") || desc.includes("task") || desc.includes("synthesis")) &&
          (lineText.includes("directive") || lineText.includes("synthesis") || lineText.includes("### task:") || lineText.includes("analyze and categorize"))
        ) {
          matchedReason = change.reason;
          break;
        }

        // 4. Constraints (Negative, Length, Density)
        if (
          change.type === "constraint" &&
          (lineText.includes("constraint") || lineText.includes("negative") || lineText.includes("length") || lineText.includes("words") || lineText.includes("density") || lineText.includes("verification") || lineText.includes("max 60"))
        ) {
          matchedReason = change.reason;
          break;
        }

        // 5. Matrix / Tables
        if (
          (desc.includes("matrix") || desc.includes("table")) &&
          (lineText.includes("matrix") || lineText.includes("|"))
        ) {
          matchedReason = change.reason;
          break;
        }

        // 6. Format / Structure
        if (
          change.type === "format" &&
          (lineText.includes("section") || lineText.includes("overview") || lineText.includes("pillars") || lineText.includes("checklist") || lineText.includes("specification") || lineText.includes("####") || lineText.startsWith("1.") || lineText.startsWith("2.") || lineText.startsWith("3.") || lineText.startsWith("4."))
        ) {
          matchedReason = change.reason;
          break;
        }

        // 7. Failure mode & Solution
        if (
          (desc.includes("failure") || desc.includes("pitfall") || desc.includes("countermeasure")) &&
          (lineText.includes("failure") || lineText.includes("pitfall") || lineText.includes("countermeasure"))
        ) {
          matchedReason = change.reason;
          break;
        }
      }

      line.reason = matchedReason;
    }
  }
}

// ---------------------------------------------------------------------------
// 3. High-Quality Simulated Execution (Offline & Sandbox Fallback)
// ---------------------------------------------------------------------------

/**
 * Generates realistic responses for original vs improved prompts when execution engine
 * runs without live API keys, ensuring deterministic testability and offline fidelity.
 */
export function simulateOptimizedRun(
  prompt: string,
  variant: "original" | "structured" | "constrained" | "format_engineered"
): { text: string; latencyMs: number; tokensIn: number; tokensOut: number } {
  const meta = extractTopicMetadata(prompt);
  const lower = prompt.toLowerCase();

  const isRecursion = lower.includes("recursion") || lower.includes("algorithm") || lower.includes("call stack") || lower.includes("data structure");
  const isSales = lower.includes("email") || lower.includes("marketing") || lower.includes("sales") || lower.includes("copy");
  const isAuth = lower.includes("auth") || lower.includes("middleware") || lower.includes("jwt") || lower.includes("token") || lower.includes("nextjs") || lower.includes("backend");
  const isCanine = lower.includes("dog") || lower.includes("pet") || lower.includes("canine") || lower.includes("puppy");

  if (variant === "original") {
    let weakText: string;
    if (isRecursion) {
      weakText = [
        `Sure! Here is some general information about recursion.`,
        "",
        `Recursion is when a function calls itself. It can be tricky to understand. You need a base case so it doesn't run forever and crash your computer with a stack overflow error. Many algorithms like quicksort and tree traversals use recursion.`,
        "",
        `In conclusion, recursion is powerful once you get used to it! Let me know if you need code examples!`,
      ].join("\n");
    } else if (isSales) {
      weakText = [
        `Hey there! Hope you are having a wonderful week!`,
        "",
        `I am writing to tell you about our amazing new AI platform. It helps engineering teams move faster and do a lot more work in less time. We have great features like automations and intuitive dashboards. Would love to show you a demo sometime next week if you have 15 minutes!`,
        "",
        `Best regards,\nSales Team`,
      ].join("\n");
    } else if (isAuth) {
      weakText = [
        `Here is some info on making auth middleware for Next.js.`,
        "",
        `You create a middleware.ts file in your root and check the cookies on the request. If the user doesn't have a token, you redirect them to the /login page using NextResponse.redirect. You can also verify JWTs using a library.`,
        "",
        `Hope this helps you set up auth! Let me know if you have errors!`,
      ].join("\n");
    } else if (isCanine) {
      weakText = [
        `Sure! Here is some general information about dogs.`,
        "",
        `Dogs are wonderful animals and have been human companions for thousands of years. They are known as man's best friend. There are many different breeds of dogs, ranging from tiny Chihuahuas to huge Great Danes. They like going for walks and eating food.`,
        "",
        `In conclusion, having a dog is a big responsibility, but it can also be very rewarding and fun for the whole family! I hope this helps you learn more about dogs!`,
      ].join("\n");
    } else {
      weakText = [
        `Sure! Here is some general overview of ${meta.topic}.`,
        "",
        `This is a broad and multifaceted topic with various applications in practice. Many people find it useful to study the fundamentals first before moving into advanced techniques. It involves multiple components and considerations depending on your situation.`,
        "",
        `In summary, understanding ${meta.topic} requires practice and dedication. I hope this brief overview provides a helpful starting point!`,
      ].join("\n");
    }

    return {
      text: weakText,
      latencyMs: 380,
      tokensIn: Math.max(10, Math.round(prompt.length / 4)),
      tokensOut: 110,
    };
  }

  if (variant === "structured") {
    let structuredText: string;
    if (isRecursion) {
      structuredText = [
        `### Executive Overview`,
        `Recursion is a foundational algorithmic paradigm where a computation decomposes into self-similar sub-problems solved by invoking the same procedure on strictly smaller input domains. Understanding call stack frame allocation and invariant base cases is essential for production software engineers.`,
        "",
        `### Key Architectural Pillars`,
        `1. **Base Case & Invariant Proof**: Every recursive procedure requires an explicit non-recursive termination branch. The invariant must guarantee monotonic convergence toward the base condition.`,
        `2. **Stack Frame Lifecycle**: Each invocation pushes a discrete activation record containing local registers, arguments, and return pointers, contributing O(N) auxiliary space unless tail-call optimized.`,
        `3. **Divide-and-Conquer Recurrence**: Master Theorem paradigms (T(N) = aT(N/b) + f(N)) model optimal recursive branching across merge sort and binary search trees.`,
        "",
        `### Common Pitfalls & Mitigations`,
        `- **Stack Overflow Exceeded**: Unbounded recursion on deep data sets; mitigate by converting to iterative loops with explicit heap-allocated stacks.`,
        `- **Redundant Sub-problem Overlap**: Exponential O(2^N) recalculation; mitigate by introducing memoization tables or dynamic programming tabulations.`,
        "",
        `### Actionable Checklist`,
        `- [ ] Formally verify base case fires for degenerate inputs (0, empty, null).`,
        `- [ ] Profile call stack depth limit against maximum runtime input size.`,
      ].join("\n");
    } else if (isSales) {
      structuredText = [
        `### Executive Overview`,
        `High-conversion B2B direct response messaging replaces generic feature promotion with hyper-targeted business impact. This framework isolates executive pain points, proves ROI with empirical metrics, and reduces action friction.`,
        "",
        `### Key Architectural Pillars`,
        `1. **Pattern-Interrupt Subject Line**: Specific, curiosity-driven, and devoid of spam triggers (e.g. "Question on [Team's] CI latency").`,
        `2. **Observation-Led Problem Framing**: Cite observable public engineering friction rather than presumptuous generic pitch language.`,
        `3. **Quantified Value Assertion**: Demonstrate concrete metric improvement (e.g. "reduces PR review turnaround from 18 hours to 42 minutes").`,
        `4. **Low-Friction Call-to-Action**: Propose an asynchronous question or interest check rather than demanding an immediate 30-minute calendar block.`,
        "",
        `### Common Pitfalls & Mitigations`,
        `- **Self-Referential Narcissism**: Leading with "We built X..."; mitigate by leading strictly with prospect challenges.`,
        `- **Overloaded Value Propositions**: Listing 10 features; mitigate by narrowing focus to one measurable high-pain bottleneck.`,
        "",
        `### Actionable Checklist`,
        `- [ ] Keep total word count strictly between 85 and 125 words.`,
        `- [ ] Ensure CTA asks for interest verification rather than calendar scheduling.`,
      ].join("\n");
    } else if (isAuth) {
      structuredText = [
        `### Executive Overview`,
        `Edge-runtime authentication middleware in Next.js serves as the perimeter security gatekeeper. Operating in the V8 Edge environment, it validates cryptographically signed session tokens before requests reach server components or downstream API routes.`,
        "",
        `### Key Architectural Pillars`,
        `1. **Sub-Millisecond Cryptographic Verification**: Use Web Crypto APIs (jose / SubtleCrypto) rather than heavy Node.js crypto modules to verify JWT signatures in < 1ms.`,
        `2. **Zero-Trust Route Matcher Configuration**: Explicitly isolate protected route trees (/dashboard/*, /api/private/*) while bypassing static assets (_next/static, public).`,
        `3. **Session Revocation & Sliding Expiry**: Inspect distributed low-latency cache (Redis/KV) for revoked JTI identifiers to prevent replay attacks.`,
        `4. **Security Header Injection**: Uniformly inject Content-Security-Policy, Strict-Transport-Security, and X-Frame-Options headers.`,
        "",
        `### Common Pitfalls & Mitigations`,
        `- **Edge-Incompatible Node Dependencies**: Calling native fs or crypto; mitigate by strictly adhering to Web Standard API primitives.`,
        `- **Open Redirect Vulnerabilities**: Blindly trusting redirect query parameters; mitigate by sanitizing against an internal route whitelist.`,
        "",
        `### Actionable Checklist`,
        `- [ ] Ensure JWT verification executes with non-blocking async WebCrypto.`,
        `- [ ] Enforce strict SameSite=Lax and Secure attributes on all session cookies.`,
      ].join("\n");
    } else if (isCanine) {
      structuredText = [
        `### Executive Overview`,
        `Domestic canines (*Canis lupus familiaris*) represent one of humanity's earliest and most successful symbioses. Understanding their behavioral ecology, dietary requirements, and cognitive socialization protocols is foundational for prospective guardians preparing for long-term stewardship.`,
        "",
        `### Key Architectural Pillars`,
        `1. **Developmental Socialization**: The critical imprint window occurs between 3 and 14 weeks of age. Controlled exposure to varied acoustic, tactile, and social stimuli prevents fear-based reactivity in adulthood.`,
        `2. **Nutritional Energetics**: Caloric and macro-nutrient balance must calibrate to breed size, life stage, and metabolic expenditure. Working breeds require protein-dense formulations, while companion breeds require caloric moderation to prevent joint strain.`,
        `3. **Operant Conditioning & Reinforcement**: Positive reinforcement models yield durable stimulus-response loops while preserving guardian-canine trust and reducing cortisol elevation.`,
        "",
        `### Common Pitfalls & Mitigations`,
        `- **Anthropomorphic Misattribution**: Assuming defiance when a dog fails to comply; mitigate by reviewing antecedent cues and environmental distractors.`,
        `- **Inconsistent Boundaries**: Differing household rules confuse operant training; mitigate with a unified cue protocol.`,
        "",
        `### Actionable Checklist`,
        `- [ ] Establish a veterinary primary care schedule and preventative baseline.`,
        `- [ ] Schedule structured 20-minute daily decompression walks with sensory enrichment.`,
      ].join("\n");
    } else {
      structuredText = [
        `### Executive Overview`,
        `A rigorous, evidence-grounded synthesis on ${meta.topic}. This architectural blueprint outlines core principles, operational requirements, and empirical verification methods tailored for ${meta.targetAudience}.`,
        "",
        `### Key Architectural Pillars`,
        `1. **Foundational Principles**: Deconstructs the core mechanisms of ${meta.topic} into first-principles components.`,
        `2. **Operational Framework**: Establishes predictable protocols that eliminate variance and optimize outcome reliability.`,
        `3. **Systemic Trade-off Analysis**: Weighs compute, latency, and cognitive overhead against execution fidelity.`,
        "",
        `### Common Pitfalls & Mitigations`,
        `- **Unbounded Scope Drift**: Lacking explicit domain boundaries; mitigate by maintaining strict operational constraints.`,
        `- **Premature Optimization**: Focusing on micro-efficiencies before architectural correctness is established.`,
        "",
        `### Actionable Checklist`,
        `- [ ] Verify baseline assumptions against documented domain empirical benchmarks.`,
        `- [ ] Implement continuous verification telemetry to detect drift.`,
      ].join("\n");
    }

    return {
      text: structuredText,
      latencyMs: 540,
      tokensIn: Math.max(60, Math.round(prompt.length / 4)),
      tokensOut: 285,
    };
  }

  if (variant === "constrained") {
    let constrainedText: string;
    if (isRecursion) {
      constrainedText = [
        `- **Call Stack Frame Lifecycle**: Each invocation allocates an isolated activation record on the runtime stack; unbounded recursion without monotonic step reduction causes fatal call stack overflows.`,
        `- **Base Case Invariant**: A formally verified terminal condition must execute prior to recursive dispatch, ensuring deterministic termination in finite steps.`,
        `- **Memory Complexity Bound**: Auxiliary stack space scales strictly as O(depth); deeply nested structures require tail-call elimination or heap-backed iterative conversion.`,
        `- **Memoization Pruning**: Dynamic programming caches eliminate exponential O(2^N) subtree re-evaluations, condensing complexity to linear O(N).`,
      ].join("\n");
    } else if (isSales) {
      constrainedText = [
        `- **Observation-Led Opener**: Reference a specific, verifiable technical bottleneck in the recipient's public stack rather than generic flattery.`,
        `- **Quantified Business Outcome**: State exactly one validated metric delta (e.g. 35% CI cycle reduction) without buzzwords or corporate jargon.`,
        `- **Frictionless Next Step**: Propose a 1-sentence binary interest check rather than presumptively demanding a 30-minute calendar block.`,
        `- **Zero Filler Mandate**: Exclude conversational greetings, pleasantries ("Hope this finds you well"), and generic company retrospectives.`,
      ].join("\n");
    } else if (isAuth) {
      constrainedText = [
        `- **Sub-Millisecond Edge Verification**: Validate cryptographically signed session tokens using Web Crypto SubtleCrypto before routing downstream.`,
        `- **Path Exclusion Boundaries**: Strictly bypass public static assets (_next/static, /favicon.ico) while enforcing authorization on all data endpoints.`,
        `- **Session Revocation Guard**: Query an ultra-low latency distributed key-value store to verify JWT JTI validity and prevent replay attacks.`,
        `- **Strict Header Injection**: Mutate response headers to enforce Content-Security-Policy, HSTS, and X-Content-Type-Options on every edge execution.`,
      ].join("\n");
    } else if (isCanine) {
      constrainedText = [
        `- **Canine Developmental Imprinting**: The behavioral foundation solidifies during the 3-to-14-week socialization window. Proper exposure to environmental stimuli permanently reduces adult fear reactivity.`,
        `- **Nutritional Bioavailability**: Macro-nutrient profiles must mirror life stage and kinetic energy expenditure. Caloric mismanagement remains the leading contributor to early canine degenerative joint disease.`,
        `- **Operant Behavioral Reinforcement**: Positive reinforcement protocols establish reliable cognitive compliance without stress escalation. Punitive corrections reliably induce avoidance behaviors and elevated baseline cortisol.`,
        `- **Preventative Veterinary Protocol**: Annual diagnostic screening, titer verification, and dental prophylaxis extend healthy lifespan by an estimated 2.4 years. Consistent preventative care drastically mitigates emergency clinical interventions.`,
      ].join("\n");
    } else {
      constrainedText = [
        `- **First-Principles Decomposition**: Analyze ${meta.topic} strictly through core operational mechanics without introductory filler.`,
        `- **Empirical Boundary Control**: Enforce deterministic constraints that prevent hallucination and maintain high signal-to-noise ratio.`,
        `- **Measurable Outcome Invariants**: Deliver validated findings that can be directly verified against benchmark test suites.`,
        `- **Density Optimization**: Present actionable insights in compact, unembellished statements bounded strictly within defined limits.`,
      ].join("\n");
    }

    return {
      text: constrainedText,
      latencyMs: 410,
      tokensIn: Math.max(70, Math.round(prompt.length / 4)),
      tokensOut: 165,
    };
  }

  // format_engineered
  let formattedText: string;
  if (isRecursion) {
    formattedText = [
      `#### 1. Core Definition`,
      `Recursion is a computational paradigm where an algorithm resolves a problem by executing self-similar instances of itself, governed by a monotonic termination invariant and bounded stack allocation.`,
      "",
      `#### 2. Comparative Matrix`,
      `| Dimension | Best Practices | Common Anti-Pattern | Impact / Trade-off |`,
      `| :--- | :--- | :--- | :--- |`,
      `| **Termination** | Monotonically convergent base case | Missing edge boundary check | Infinite call loop and stack overflow |`,
      `| **Auxiliary Memory** | Tail-call optimization or iterative rewrite | Unbounded stack allocation | High stack pressure vs zero heap overhead |`,
      `| **Sub-problem Overlap** | Memoized cache / DP table | Naive exponential re-branching | O(N) linear time vs O(2^N) exponential lock |`,
      "",
      `#### 3. Critical Failure Mode & Solution`,
      `- **Single Highest-Risk Pitfall**: Call stack exhaustion on deep tree traversal due to unconstrained recursion depth.`,
      `- **Guaranteed Countermeasure**: Convert to iterative traversal utilizing an explicit heap-allocated array stack.`,
    ].join("\n");
  } else if (isSales) {
    formattedText = [
      `#### 1. Core Definition`,
      `B2B direct outbound messaging is a targeted communication protocol engineered to spark high-signal technical conversations by addressing acute operational bottlenecks with empirical ROI.`,
      "",
      `#### 2. Comparative Matrix`,
      `| Dimension | Best Practices | Common Anti-Pattern | Impact / Trade-off |`,
      `| :--- | :--- | :--- | :--- |`,
      `| **Subject Line** | 3-4 word lowercase curiosity hook | Generic marketing hype ("10x your dev velocity") | 68% open rate vs immediate spam categorization |`,
      `| **Value Proof** | Specific metric delta from similar stack | Vague feature laundry lists | Concrete credibility vs perceived sales noise |`,
      `| **Call-to-Action** | Low-friction binary interest inquiry | Aggressive calendar link demand | 22% reply rate vs prospect friction and bounce |`,
      "",
      `#### 3. Critical Failure Mode & Solution`,
      `- **Single Highest-Risk Pitfall**: Generic multi-paragraph blast emails that demonstrate zero prior reconnaissance.`,
      `- **Guaranteed Countermeasure**: Lead with an audit of the recipient's public stack and propose a 1-sentence hypothesis.`,
    ].join("\n");
  } else if (isAuth) {
    formattedText = [
      `#### 1. Core Definition`,
      `Next.js edge middleware authentication is a distributed, zero-trust gatekeeping architecture executing at the CDN edge to authenticate and authorize requests before entering the application runtime.`,
      "",
      `#### 2. Comparative Matrix`,
      `| Dimension | Best Practices | Common Anti-Pattern | Impact / Trade-off |`,
      `| :--- | :--- | :--- | :--- |`,
      `| **Cryptography** | WebCrypto SubtleCrypto / jose | Heavy Node.js native crypto imports | Sub-millisecond latency vs Edge runtime boot crash |`,
      `| **Route Isolation** | Strict matcher config excluding static files | Running middleware on every bundle asset | 2ms latency vs massive unneeded compute bills |`,
      `| **Revocation** | Fast KV / Redis lookup for blacklisted JTI | Relying strictly on stateless expiry | Immediate session kill vs 15-minute replay window |`,
      "",
      `#### 3. Critical Failure Mode & Solution`,
      `- **Single Highest-Risk Pitfall**: Open redirect vulnerability when handling post-login redirection parameters.`,
      `- **Guaranteed Countermeasure**: Validate redirect target against a strict internal pathname whitelist regex.`,
    ].join("\n");
  } else if (isCanine) {
    formattedText = [
      `#### 1. Core Definition`,
      `Canine stewardship encompasses the biological, neurological, and behavioral management of domestic dogs, demanding structured developmental conditioning, preventative medical protocols, and environmental enrichment.`,
      "",
      `#### 2. Comparative Matrix`,
      `| Dimension | Best Practices | Common Anti-Pattern | Impact / Trade-off |`,
      `| :--- | :--- | :--- | :--- |`,
      `| **Behavioral Training** | Positive operant conditioning with variable reinforcement | Aversive physical corrections and intimidation | High compliance with trust vs elevated fear reactivity |`,
      `| **Nutritional Regimen** | Weighed, life-stage specific caloric allocations | Free-choice ad-libitum bowl feeding | Optimal metabolic health vs chronic obesity and joint strain |`,
      `| **Environmental Enrichment** | Olfactory decompression walks and puzzle feeders | Purely physical exhaustion running | Neurological fulfillment vs chronic hyper-arousal |`,
      "",
      `#### 3. Critical Failure Mode & Solution`,
      `- **Single Highest-Risk Pitfall**: Chronic under-socialization during the first 16 weeks, generating irreversible stranger and conspecific fear aggression.`,
      `- **Guaranteed Countermeasure**: Daily micro-exposures paired with high-value reinforcement beneath the dog's reactive threshold.`,
    ].join("\n");
  } else {
    formattedText = [
      `#### 1. Core Definition`,
      `${meta.topic} is a multidimensional subject requiring rigorous methodological grounding, disciplined execution boundaries, and continuous empirical validation.`,
      "",
      `#### 2. Comparative Matrix`,
      `| Dimension | Best Practices | Common Anti-Pattern | Impact / Trade-off |`,
      `| :--- | :--- | :--- | :--- |`,
      `| **Architectural Design** | Modular first-principles separation of concerns | Monolithic, tightly-coupled implementations | High maintainability vs structural fragility |`,
      `| **Quality Assurance** | Automated invariant verification suites | Ad-hoc manual verification checks | High repeatability vs undetected regressions |`,
      `| **Performance Bounds** | Strict resource budgeting and profiling | Unconstrained resource utilization | Predictable latency vs unbounded memory consumption |`,
      "",
      `#### 3. Critical Failure Mode & Solution`,
      `- **Single Highest-Risk Pitfall**: Operating without quantitative benchmarks and explicit boundary constraints.`,
      `- **Guaranteed Countermeasure**: Establish independent verification telemetry with verifiable automated pass/fail criteria.`,
    ].join("\n");
  }

  return {
    text: formattedText,
    latencyMs: 510,
    tokensIn: Math.max(80, Math.round(prompt.length / 4)),
    tokensOut: 240,
  };
}
