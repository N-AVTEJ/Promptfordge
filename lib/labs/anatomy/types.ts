export type AnatomyComponentType =
  | "role"
  | "task"
  | "context"
  | "examples"
  | "constraints"
  | "output_format";

export interface ComponentConfig {
  type: AnatomyComponentType;
  label: string;
  shortLabel: string;
  description: string;
  missingExplanation: string;
  suggestionTemplate: string;
  badgeClass: string;
  highlightClass: string;
  borderClass: string;
  textClass: string;
  colorHex: string;
}

export const COMPONENT_CONFIGS: Record<AnatomyComponentType, ComponentConfig> = {
  role: {
    type: "role",
    label: "Role & Persona",
    shortLabel: "Role",
    description:
      "Establishes identity, tone, scope of expertise, and communicative demeanor for the model.",
    missingExplanation:
      "No persona or role declared. Adding a role anchors the model's vocabulary and prevents generic answers.",
    suggestionTemplate: "You are a senior technical educator with 10+ years of experience.",
    badgeClass: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    highlightClass: "bg-purple-500/20 hover:bg-purple-500/30 border-b-2 border-purple-400",
    borderClass: "border-purple-500/40",
    textClass: "text-purple-400",
    colorHex: "#a855f7",
  },
  task: {
    type: "task",
    label: "Task & Core Directive",
    shortLabel: "Task",
    description:
      "The primary operational verb and objective the model must perform.",
    missingExplanation:
      "No clear task directive detected. Define explicit verbs (e.g. 'Explain', 'Synthesize', 'Debug').",
    suggestionTemplate: "Explain how loops work step by step with clear rationale.",
    badgeClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    highlightClass: "bg-cyan-500/20 hover:bg-cyan-500/30 border-b-2 border-cyan-400",
    borderClass: "border-cyan-500/40",
    textClass: "text-cyan-400",
    colorHex: "#06b6d4",
  },
  context: {
    type: "context",
    label: "Context & Audience",
    shortLabel: "Context",
    description:
      "Background information, target audience competency level, domain data, and environment state.",
    missingExplanation:
      "No contextual audience or background provided. The model may assume the wrong depth or jargon level.",
    suggestionTemplate: "Target audience is a high school student learning programming for the first time.",
    badgeClass: "bg-sky-500/20 text-sky-300 border-sky-500/40",
    highlightClass: "bg-sky-500/20 hover:bg-sky-500/30 border-b-2 border-sky-400",
    borderClass: "border-sky-500/40",
    textClass: "text-sky-400",
    colorHex: "#38bdf8",
  },
  examples: {
    type: "examples",
    label: "Few-Shot Examples",
    shortLabel: "Examples",
    description:
      "Concrete demonstration input/output pairs that align output style and reduce ambiguity.",
    missingExplanation:
      "Prompt is zero-shot. Adding 1-2 few-shot demonstrations drastically cuts format errors and hallucinations.",
    suggestionTemplate: "Example 1:\nInput: for i in range(2)\nOutput: 0, 1",
    badgeClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    highlightClass: "bg-emerald-500/20 hover:bg-emerald-500/30 border-b-2 border-emerald-400",
    borderClass: "border-emerald-500/40",
    textClass: "text-emerald-400",
    colorHex: "#10b981",
  },
  constraints: {
    type: "constraints",
    label: "Constraints & Guardrails",
    shortLabel: "Constraints",
    description:
      "Boundaries, length limits, forbidden phrases, and negative constraints governing model behavior.",
    missingExplanation:
      "No constraints defined. Without negative rules or limits, the model may drift or hallucinate.",
    suggestionTemplate: "Keep the explanation under 100 words. Never use jargon without defining it.",
    badgeClass: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    highlightClass: "bg-amber-500/20 hover:bg-amber-500/30 border-b-2 border-amber-400",
    borderClass: "border-amber-500/40",
    textClass: "text-amber-400",
    colorHex: "#f59e0b",
  },
  output_format: {
    type: "output_format",
    label: "Output Format & Contract",
    shortLabel: "Output Format",
    description:
      "The exact envelope, structure, schema, or styling requested (e.g. JSON, bullet list, markdown table).",
    missingExplanation:
      "No output format specified. The model is likely to emit conversational filler and unpredictable styling.",
    suggestionTemplate: "Format your output as a concise bulleted summary with code snippets.",
    badgeClass: "bg-rose-500/20 text-rose-300 border-rose-500/40",
    highlightClass: "bg-rose-500/20 hover:bg-rose-500/30 border-b-2 border-rose-400",
    borderClass: "border-rose-500/40",
    textClass: "text-rose-400",
    colorHex: "#f43f5e",
  },
};

export interface DetectedSpan {
  id: string;
  type: AnatomyComponentType;
  startIndex: number;
  endIndex: number;
  text: string;
  confidence: number;
  rationale: string;
}

export interface AnatomyAnalysis {
  prompt: string;
  detectedSpans: DetectedSpan[];
  presentTypes: AnatomyComponentType[];
  missingTypes: AnatomyComponentType[];
  completenessScore: number; // 0 to 100
  source: "rule-based" | "ai-assisted";
}

export interface ComponentDiffScenario {
  id: string;
  title: string;
  componentType: AnatomyComponentType;
  description: string;
  originalText: string;
  modifiedText: string;
  explanationOfImpact: string;
}
