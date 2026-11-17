/**
 * PromptForge Landing Page Content & Educational Simulation Data
 * Strictly typed data in /content, derived from modules.ts and video-report.json.
 * No hardcoded runtime counts. Deterministic coordinates and matrices.
 */

import { CURRICULUM_MODULES } from "@/content/modules";
import videoReport from "@/content/video-report.json";

// 1. Derived Curriculum Metrics
export const curriculumStats = {
  totalModules: CURRICULUM_MODULES.length,
  totalVideos: videoReport.totalOk,
  totalLessons: CURRICULUM_MODULES.reduce(
    (acc, m) => acc + (m.lessons ? m.lessons.length : m.lessonCount || 0),
    0
  ),
  totalWatchMinutes: CURRICULUM_MODULES.reduce((acc, m) => {
    const mins = parseInt(m.duration || "0", 10);
    return acc + (isNaN(mins) ? 0 : mins);
  }, 0),
};

// 2. Hero Sentence & Highlighter Segments
export interface HeroSentenceSegment {
  id: string;
  text: string;
  category: "role" | "task" | "context" | "constraint";
  label: string;
  highlighterClass: string;
  badgeClass: string;
}

export const HERO_SENTENCE =
  "Act as a Python teacher. Explain loops to a beginner. Give two examples. Keep it under 100 words.";

export const HERO_SEGMENTS: HeroSentenceSegment[] = [
  {
    id: "role",
    text: "Act as a Python teacher.",
    category: "role",
    label: "Role",
    highlighterClass: "bg-marigold/35 border-b-2 border-marigold",
    badgeClass: "bg-marigold text-navy",
  },
  {
    id: "task",
    text: "Explain loops to a beginner.",
    category: "task",
    label: "Task",
    highlighterClass: "bg-mint/45 border-b-2 border-mint",
    badgeClass: "bg-mint text-navy",
  },
  {
    id: "context",
    text: "Give two examples.",
    category: "context",
    label: "Context",
    highlighterClass: "bg-lilac/45 border-b-2 border-lilac",
    badgeClass: "bg-lilac text-navy",
  },
  {
    id: "constraint",
    text: "Keep it under 100 words.",
    category: "constraint",
    label: "Constraint",
    highlighterClass: "bg-rose/40 border-b-2 border-rose",
    badgeClass: "bg-rose text-navy",
  },
];

// 3. Pinned Scroll Story Data (Educational Simulation)
export interface StoryToken {
  id: number;
  text: string;
  category: "role" | "task" | "context" | "constraint";
  // Position in initial 1D tokenized reading flow (Stage 1 & 2)
  initialIndex: number;
  // 2D Coordinates as percentage of canvas [x: 0-100, y: 0-100] (Stage 3 & 4)
  scatterDesktop: { x: number; y: number };
  scatterMobile: { x: number; y: number };
  // Attention weight from central target "loops" (0.0 to 1.0)
  attentionWeight: number;
  isStrongestAttention?: boolean;
}

export const SIMULATION_BADGE =
  "Educational simulation. Token IDs and weights are illustrative.";

export interface StoryStageMeta {
  stage: number;
  caption: string;
  description: string;
  rangeDesktop: [number, number]; // scroll progress percentage bounds
  rangeMobile: [number, number];
}

export const STORY_STAGES: StoryStageMeta[] = [
  {
    stage: 1,
    caption: "You write the prompt.",
    description:
      "A natural sentence sets the persona, the task, the context, and the boundaries.",
    rangeDesktop: [0, 0.15],
    rangeMobile: [0, 0.15],
  },
  {
    stage: 2,
    caption: "The model cuts it into tokens.",
    description:
      "The input breaks into subword chunks, each assigned an integer ID from a fixed vocabulary.",
    rangeDesktop: [0.15, 0.35],
    rangeMobile: [0.15, 0.35],
  },
  {
    stage: 3,
    caption: "Each token becomes a point that carries meaning.",
    description:
      "High-dimensional embeddings position tokens by concept. Related words cluster together.",
    rangeDesktop: [0.35, 0.6],
    rangeMobile: [0.35, 0.6],
  },
  {
    stage: 4,
    caption: "Attention decides which words matter to each other.",
    description:
      "Self-attention routes weights between tokens. 'Loops' connects most strongly to 'Python'.",
    rangeDesktop: [0.6, 0.85],
    rangeMobile: [0.6, 0.85],
  },
  {
    stage: 5,
    caption: "It writes the answer one token at a time.",
    description:
      "Conditioned on all prior tokens, the model samples the next word until finished.",
    rangeDesktop: [0.85, 1.0],
    rangeMobile: [0.85, 1.0],
  },
];

// Desktop: exactly 12 tokens
export const DESKTOP_TOKENS: StoryToken[] = [
  {
    id: 11956,
    text: "Act",
    category: "role",
    initialIndex: 0,
    scatterDesktop: { x: 16, y: 22 },
    scatterMobile: { x: 15, y: 22 },
    attentionWeight: 0.42,
  },
  {
    id: 439,
    text: "as",
    category: "role",
    initialIndex: 1,
    scatterDesktop: { x: 12, y: 44 },
    scatterMobile: { x: 12, y: 44 },
    attentionWeight: 0.12,
  },
  {
    id: 18781,
    text: "Python",
    category: "role",
    initialIndex: 2,
    scatterDesktop: { x: 40, y: 34 },
    scatterMobile: { x: 38, y: 32 },
    attentionWeight: 0.94,
    isStrongestAttention: true,
  },
  {
    id: 14757,
    text: "teacher",
    category: "role",
    initialIndex: 3,
    scatterDesktop: { x: 32, y: 56 },
    scatterMobile: { x: 28, y: 54 },
    attentionWeight: 0.78,
  },
  {
    id: 34185,
    text: "Explain",
    category: "task",
    initialIndex: 4,
    scatterDesktop: { x: 74, y: 26 },
    scatterMobile: { x: 74, y: 26 },
    attentionWeight: 0.72,
  },
  {
    id: 19445,
    text: "loops",
    category: "task",
    initialIndex: 5,
    scatterDesktop: { x: 50, y: 48 },
    scatterMobile: { x: 50, y: 48 },
    attentionWeight: 1.0, // central target node
  },
  {
    id: 311,
    text: "to",
    category: "task",
    initialIndex: 6,
    scatterDesktop: { x: 68, y: 62 },
    scatterMobile: { x: 68, y: 62 },
    attentionWeight: 0.18,
  },
  {
    id: 23640,
    text: "beginner",
    category: "task",
    initialIndex: 7,
    scatterDesktop: { x: 78, y: 74 },
    scatterMobile: { x: 80, y: 70 },
    attentionWeight: 0.65,
  },
  {
    id: 14777,
    text: "Give",
    category: "context",
    initialIndex: 8,
    scatterDesktop: { x: 86, y: 42 },
    scatterMobile: { x: 86, y: 42 },
    attentionWeight: 0.22,
  },
  {
    id: 1403,
    text: "two",
    category: "context",
    initialIndex: 9,
    scatterDesktop: { x: 82, y: 16 },
    scatterMobile: { x: 82, y: 16 },
    attentionWeight: 0.28,
  },
  {
    id: 4860,
    text: "examples",
    category: "context",
    initialIndex: 10,
    scatterDesktop: { x: 62, y: 84 },
    scatterMobile: { x: 64, y: 84 },
    attentionWeight: 0.54,
  },
  {
    id: 3844,
    text: "words",
    category: "constraint",
    initialIndex: 11,
    scatterDesktop: { x: 20, y: 82 },
    scatterMobile: { x: 20, y: 82 },
    attentionWeight: 0.35,
  },
];

// Mobile: exactly 8 tokens for readability on small screens
export const MOBILE_TOKENS: StoryToken[] = [
  DESKTOP_TOKENS[0], // Act
  DESKTOP_TOKENS[2], // Python
  DESKTOP_TOKENS[3], // teacher
  DESKTOP_TOKENS[4], // Explain
  DESKTOP_TOKENS[5], // loops
  DESKTOP_TOKENS[7], // beginner
  DESKTOP_TOKENS[10], // examples
  DESKTOP_TOKENS[11], // words
];

// Output tokens generated sequentially in Stage 5
export const OUTPUT_TOKENS = [
  "A",
  " loop",
  " runs",
  " code",
  " repeatedly",
  " until",
  " a",
  " condition",
  " is",
  " met.",
  " In",
  " Python,",
  " use",
  " 'for'",
  " or",
  " 'while'.",
];

// 4. Technique Rows (Run it, don't just watch it)
export interface TechniqueRowData {
  id: string;
  name: string;
  explanation: string;
  tokensUsed: number;
  samplePrompt: string;
  maxTokens: number;
}

export const TECHNIQUE_ROWS: TechniqueRowData[] = [
  {
    id: "zero-shot",
    name: "Zero-shot",
    explanation: "Ask directly with no prior demonstrations or sample outputs.",
    tokensUsed: 42,
    samplePrompt: "Explain recursion to an eight year old in simple words.",
    maxTokens: 320,
  },
  {
    id: "one-shot",
    name: "One-shot",
    explanation:
      "Supply a single solved input-output pair to anchor the expected format.",
    tokensUsed: 118,
    samplePrompt:
      "Input: dog -> Output: dogs. Input: child -> Output: children.",
    maxTokens: 320,
  },
  {
    id: "few-shot",
    name: "Few-shot",
    explanation:
      "Show three to five diverse examples to establish reasoning cadence.",
    tokensUsed: 294,
    samplePrompt:
      "Review 1 (Positive), Review 2 (Negative), Review 3 (Neutral). Review 4:",
    maxTokens: 320,
  },
  {
    id: "role",
    name: "Role prompting",
    explanation:
      "Frame domain expertise and perspective before giving instructions.",
    tokensUsed: 68,
    samplePrompt:
      "Act as a principal site reliability engineer doing an incident review.",
    maxTokens: 320,
  },
  {
    id: "constraint",
    name: "Constraint setting",
    explanation:
      "Bound output length, format boundaries, and negative criteria strictly.",
    tokensUsed: 86,
    samplePrompt:
      "Answer in under 40 words. Do not use buzzwords. No bullet points.",
    maxTokens: 320,
  },
  {
    id: "structured",
    name: "Structured output",
    explanation:
      "Enforce exact JSON schema or markdown contracts for machine consumers.",
    tokensUsed: 154,
    samplePrompt:
      "Return valid JSON matching schema { summary: string, confidence: number }.",
    maxTokens: 320,
  },
];
