export type SimulatorStage =
  | "input"
  | "tokenization"
  | "embeddings"
  | "positional"
  | "attention"
  | "generation";

export interface StageDefinition {
  id: SimulatorStage;
  number: number;
  title: string;
  shortTitle: string;
  subtitle: string;
  badgeLabel: string;
  description: string;
  keyFormula?: string;
}

export const STAGES: StageDefinition[] = [
  {
    id: "input",
    number: 1,
    title: "Raw Input String & Byte Stream",
    shortTitle: "1. Input",
    subtitle: "UTF-8 characters entering the tokenizer buffer",
    badgeLabel: "Stage 01 · Byte Stream",
    description:
      "Text enters the model as an unstructured sequence of Unicode characters and raw UTF-8 bytes before any intelligence occurs.",
  },
  {
    id: "tokenization",
    number: 2,
    title: "Byte-Pair Encoding (BPE) Tokenization",
    shortTitle: "2. Tokens",
    subtitle: "Subword chunking mapped to integer vocabulary IDs",
    badgeLabel: "Stage 02 · Tokenization",
    description:
      "A deterministic tokenizer vocabulary merges frequent byte pairs into discrete token IDs. Real in-browser BPE engine.",
    keyFormula: "Text \\to [t_1, t_2, ..., t_n] \\in V^n",
  },
  {
    id: "embeddings",
    number: 3,
    title: "Token Vector Embeddings",
    shortTitle: "3. Embeddings",
    subtitle: "Projecting discrete integers into continuous dense space",
    badgeLabel: "Stage 03 · Dense Vector Space",
    description:
      "Each discrete token ID looks up a dense learned vector representation in $\\mathbb{R}^{d_{\\text{model}}}$ capturing semantic concepts.",
    keyFormula: "\\mathbf{e}_i = \\mathbf{W}_e[t_i] \\in \\mathbb{R}^d",
  },
  {
    id: "positional",
    number: 4,
    title: "Positional Encoding (RoPE / Sinusoids)",
    shortTitle: "4. Position",
    subtitle: "Injecting sequence order into permutation-invariant attention",
    badgeLabel: "Stage 04 · Positional Encoding",
    description:
      "Because self-attention is naturally permutation-invariant, positional signals (sinusoidal frequencies or rotary angles) are combined with token vectors.",
    keyFormula: "\\mathbf{x}_i = \\mathbf{e}_i + \\mathbf{p}_i \\quad \\text{or} \\quad \\mathbf{R}_\\Theta(i)\\mathbf{x}_i",
  },
  {
    id: "attention",
    number: 5,
    title: "Multi-Head Self-Attention Matrix",
    shortTitle: "5. Attention",
    subtitle: "Dynamic semantic routing across all tokens via Q, K, V",
    badgeLabel: "Stage 05 · Self-Attention",
    description:
      "Tokens query each other across representation subspaces. Attention weights define how much context each token gathers from other tokens.",
    keyFormula: "\\text{Attention}(\\mathbf{Q}, \\mathbf{K}, \\mathbf{V}) = \\text{softmax}\\left(\\frac{\\mathbf{Q}\\mathbf{K}^T}{\\sqrt{d_k}}\\right)\\mathbf{V}",
  },
  {
    id: "generation",
    number: 6,
    title: "Autoregressive Next-Token Sampling",
    shortTitle: "6. Generation",
    subtitle: "Logits, temperature-scaled softmax, and iterative output emission",
    badgeLabel: "Stage 06 · Next-Token Generation",
    description:
      "The final transformer hidden state is projected to vocabulary logits. Softmax with temperature yields probabilities from which the next token is sampled.",
    keyFormula: "P(t_{n+1} = w | t_{1:n}) = \\frac{\\exp(z_w / T)}{\\sum_j \\exp(z_j / T)}",
  },
];

export interface ProcessedToken {
  id: number;
  text: string;
  cleanText: string;
  index: number;
  byteLength: number;
  charStart: number;
  charEnd: number;
  colorClass: string;
  hexColor: string;
}

export interface TokenEmbedding {
  token: ProcessedToken;
  dimensions: number[]; // First N dimensions for visualization (e.g. 16 values between -1.0 and 1.0)
  norm: number;
  cluster: "syntax" | "semantic-core" | "entity" | "modifier" | "punctuation";
}

export interface PositionalInfo {
  token: ProcessedToken;
  positionIndex: number;
  sineValues: number[];
  cosineValues: number[];
  combinedVector: number[];
}

export interface AttentionHead {
  id: string;
  name: string;
  description: string;
  weights: number[][]; // [queryIndex][keyIndex]
}

export interface TokenCandidate {
  token: string;
  id: number;
  logit: number;
  probability: number;
  rank: number;
}

export interface GenerationStep {
  stepIndex: number;
  promptTokens: ProcessedToken[];
  topCandidates: TokenCandidate[];
  selectedToken: TokenCandidate;
  temperature: number;
  textSoFar: string;
}

export interface SimulatorState {
  stage: SimulatorStage;
  stageNumber: number;
  inputText: string;
  tokens: ProcessedToken[];
  embeddings: TokenEmbedding[];
  positional: PositionalInfo[];
  attentionHeads: AttentionHead[];
  activeHeadIndex: number;
  selectedQueryTokenIndex: number | null;
  generationSteps: GenerationStep[];
  currentGenStepIndex: number;
  isPlaying: boolean;
  playbackSpeed: number; // 0.5, 1, 2, 4
}

export interface TokenizerComparison {
  name: string;
  id: "cl100k_base" | "o200k_base" | "r50k_base";
  description: string;
  modelEra: string;
  tokenCount: number;
  tokens: string[];
  compressionRatio: number; // chars per token
  estimatedCostPer1M: number; // USD per 1M input tokens
  tokenExpansionPercent: number; // relative to cl100k_base
}
