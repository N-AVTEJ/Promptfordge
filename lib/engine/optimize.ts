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

  if (lower.includes("recursion") || lower.includes("algorithm") || lower.includes("code") || lower.includes("data structure")) {
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
      const lineText = (line.newText || line.text || "").toLowerCase();
      // Match with changes
      for (const change of changes) {
        if (
          (change.type === "addition" && lineText.includes("persona") && change.description.includes("persona")) ||
          (change.type === "addition" && lineText.includes("audience") && change.description.includes("audience")) ||
          (change.type === "constraint" && (lineText.includes("constraint") || lineText.includes("negative") || lineText.includes("limit"))) ||
          (change.type === "format" && (lineText.includes("matrix") || lineText.includes("section") || lineText.includes("table") || lineText.includes("|")))
        ) {
          line.reason = change.reason;
          break;
        }
      }

      if (!line.reason && changes.length > 0) {
        line.reason = changes[0].reason;
      }
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

  if (variant === "original") {
    // Deliberately weak, rambling, conversational output
    const weakText = [
      `Sure! Here is some general information about ${meta.topic}.`,
      "",
      `Dogs are wonderful animals and have been human companions for thousands of years. They are known as man's best friend. There are many different breeds of dogs, ranging from tiny Chihuahuas to huge Great Danes. They like going for walks and eating food.`,
      "",
      `In conclusion, having a dog is a big responsibility, but it can also be very rewarding and fun for the whole family! I hope this helps you learn more about dogs!`,
    ].join("\n");

    return {
      text: weakText,
      latencyMs: 380,
      tokensIn: Math.max(10, Math.round(prompt.length / 4)),
      tokensOut: 110,
    };
  }

  if (variant === "structured") {
    const structuredText = [
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

    return {
      text: structuredText,
      latencyMs: 540,
      tokensIn: Math.max(60, Math.round(prompt.length / 4)),
      tokensOut: 285,
    };
  }

  if (variant === "constrained") {
    const constrainedText = [
      `- **Canine Developmental Imprinting**: The behavioral foundation solidifies during the 3-to-14-week socialization window. Proper exposure to environmental stimuli permanently reduces adult fear reactivity.`,
      `- **Nutritional Bioavailability**: Macro-nutrient profiles must mirror life stage and kinetic energy expenditure. Caloric mismanagement remains the leading contributor to early canine degenerative joint disease.`,
      `- **Operant Behavioral Reinforcement**: Positive reinforcement protocols establish reliable cognitive compliance without stress escalation. Punitive corrections reliably induce avoidance behaviors and elevated baseline cortisol.`,
      `- **Preventative Veterinary Protocol**: Annual diagnostic screening, titer verification, and dental prophylaxis extend healthy lifespan by an estimated 2.4 years. Consistent preventative care drastically mitigates emergency clinical interventions.`,
    ].join("\n");

    return {
      text: constrainedText,
      latencyMs: 410,
      tokensIn: Math.max(70, Math.round(prompt.length / 4)),
      tokensOut: 165,
    };
  }

  // format_engineered
  const formattedText = [
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

  return {
    text: formattedText,
    latencyMs: 510,
    tokensIn: Math.max(80, Math.round(prompt.length / 4)),
    tokensOut: 240,
  };
}
