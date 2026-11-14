import {
  AttentionHead,
  GenerationStep,
  PositionalInfo,
  ProcessedToken,
  SimulatorState,
  TokenCandidate,
  TokenEmbedding,
} from "./types";
import { tokenizeInputText } from "./tokenizer";

/**
 * Deterministic PRNG: Mulberry32
 * Ensures identical mathematical values and visual states for the same seed.
 */
export function createMulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic hash of string to 32-bit integer
 */
export function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Generates simulated continuous embedding vectors (16 dimensions)
 */
export function generateEmbeddings(
  tokens: ProcessedToken[],
  seed = 42
): TokenEmbedding[] {
  const rng = createMulberry32(seed);

  return tokens.map((token) => {
    // Generate 16 vector dimensions between -1.0 and +1.0
    const dims: number[] = [];
    let sumSq = 0;

    for (let d = 0; d < 16; d++) {
      // Modulate with token ID for semantic consistency
      const raw = (rng() * 2 - 1) * 0.8 + (Math.sin(token.id * (d + 1)) * 0.2);
      const val = Number(Math.max(-1, Math.min(1, raw)).toFixed(3));
      dims.push(val);
      sumSq += val * val;
    }

    const norm = Number(Math.sqrt(sumSq).toFixed(3));

    // Determine pseudo-cluster
    let cluster: TokenEmbedding["cluster"] = "semantic-core";
    const clean = token.cleanText.trim().toLowerCase();
    if (/^[.,!?;:'"()\[\]{}]$/.test(clean)) {
      cluster = "punctuation";
    } else if (
      ["the", "is", "a", "an", "and", "in", "to", "for", "with", "of"].includes(
        clean
      )
    ) {
      cluster = "syntax";
    } else if (
      ["python", "gpt", "model", "token", "vector", "code", "schema"].includes(
        clean
      )
    ) {
      cluster = "entity";
    } else if (
      ["very", "clearly", "expert", "concise", "deterministic"].includes(clean)
    ) {
      cluster = "modifier";
    }

    return {
      token,
      dimensions: dims,
      norm,
      cluster,
    };
  });
}

/**
 * Computes sinusoidal positional encoding vectors and combined representations.
 */
export function generatePositionalInfo(
  tokens: ProcessedToken[],
  embeddings: TokenEmbedding[],
  dModel = 16
): PositionalInfo[] {
  return tokens.map((token, pos) => {
    const sines: number[] = [];
    const cosines: number[] = [];
    const combined: number[] = [];
    const tokenEmb = embeddings[pos]?.dimensions || new Array(dModel).fill(0);

    for (let i = 0; i < dModel / 2; i++) {
      const denominator = Math.pow(10000, (2 * i) / dModel);
      const angle = pos / denominator;
      const sinVal = Number(Math.sin(angle).toFixed(3));
      const cosVal = Number(Math.cos(angle).toFixed(3));
      sines.push(sinVal);
      cosines.push(cosVal);

      // Superposition: e_i + p_i
      const embSin = tokenEmb[2 * i] ?? 0;
      const embCos = tokenEmb[2 * i + 1] ?? 0;
      combined.push(Number((embSin * 0.7 + sinVal * 0.3).toFixed(3)));
      combined.push(Number((embCos * 0.7 + cosVal * 0.3).toFixed(3)));
    }

    return {
      token,
      positionIndex: pos,
      sineValues: sines,
      cosineValues: cosines,
      combinedVector: combined,
    };
  });
}

/**
 * Generates multi-head self-attention weight matrices:
 * Head 0: Semantic alignment
 * Head 1: Recency & local context bias
 * Head 2: Structural anchor (attends heavily to token 0)
 */
export function generateAttentionHeads(
  tokens: ProcessedToken[],
  seed = 101
): AttentionHead[] {
  const N = tokens.length;
  if (N === 0) return [];

  const rng = createMulberry32(seed);

  // Softmax helper for a single row of raw scores
  function softmax(row: number[]): number[] {
    const maxVal = Math.max(...row);
    const exps = row.map((v) => Math.exp(v - maxVal));
    const sumExp = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => Number((e / sumExp).toFixed(4)));
  }

  // 1. Semantic Alignment Head
  const semanticWeights: number[][] = [];
  for (let q = 0; q < N; q++) {
    const rawRow: number[] = [];
    for (let k = 0; k < N; k++) {
      // Causality: only attend to earlier and current tokens (or full if bidirectional)
      const dot =
        Math.cos((tokens[q].id ^ tokens[k].id) * 0.1) * 2.0 +
        (q === k ? 1.5 : 0) +
        (rng() * 0.5 - 0.25);
      rawRow.push(dot);
    }
    semanticWeights.push(softmax(rawRow));
  }

  // 2. Recency & Local Syntax Head
  const recencyWeights: number[][] = [];
  for (let q = 0; q < N; q++) {
    const rawRow: number[] = [];
    for (let k = 0; k < N; k++) {
      const dist = Math.abs(q - k);
      const score = 4.0 / (dist + 1.0) + (rng() * 0.3 - 0.15);
      rawRow.push(score);
    }
    recencyWeights.push(softmax(rawRow));
  }

  // 3. System Anchor Head (attends strongly to beginning tokens)
  const anchorWeights: number[][] = [];
  for (let q = 0; q < N; q++) {
    const rawRow: number[] = [];
    for (let k = 0; k < N; k++) {
      const isStart = k === 0 ? 3.5 : k <= 2 ? 1.5 : 0;
      const score = isStart + (q === k ? 1.2 : 0) + (rng() * 0.4 - 0.2);
      rawRow.push(score);
    }
    anchorWeights.push(softmax(rawRow));
  }

  return [
    {
      id: "semantic",
      name: "Head 1 · Semantic Association",
      description:
        "Routes attention across semantically correlated concepts, keywords, and instructions.",
      weights: semanticWeights,
    },
    {
      id: "recency",
      name: "Head 2 · Local Syntax & Recency",
      description:
        "Focal window around immediately adjacent preceding words and grammatical tokens.",
      weights: recencyWeights,
    },
    {
      id: "anchor",
      name: "Head 3 · Structural Anchor",
      description:
        "Maintains strong grounding on the initial instruction/system delimiter.",
      weights: anchorWeights,
    },
  ];
}

/**
 * Simulates multi-step autoregressive generation
 */
export function generateAutoregressiveSteps(
  promptTokens: ProcessedToken[],
  temperature = 0.7,
  numSteps = 5
): GenerationStep[] {
  const vocabularyCandidates: Array<{ token: string; id: number; baseScore: number }> = [
    { token: " loops", id: 24510, baseScore: 4.8 },
    { token: " iterate", id: 18920, baseScore: 3.9 },
    { token: " execute", id: 14210, baseScore: 3.4 },
    { token: " repeat", id: 11200, baseScore: 2.8 },
    { token: " through", id: 890, baseScore: 2.1 },
    { token: " sequences", id: 21900, baseScore: 4.5 },
    { token: " cleanly", id: 15300, baseScore: 3.7 },
    { token: " step-by-step", id: 29800, baseScore: 3.1 },
    { token: " using", id: 1240, baseScore: 2.6 },
    { token: " Python", id: 9822, baseScore: 4.9 },
    { token: " syntax", id: 16700, baseScore: 4.1 },
    { token: ".", id: 13, baseScore: 5.1 },
  ];

  const steps: GenerationStep[] = [];
  let runningText = promptTokens.map((t) => t.text).join("");

  for (let s = 0; s < numSteps; s++) {
    // Pick 5 candidates with dynamic scores based on step
    const stepCandidates: TokenCandidate[] = vocabularyCandidates
      .slice((s * 2) % 7, ((s * 2) % 7) + 5)
      .map((c, i) => {
        const rawLogit = c.baseScore + (i === 0 ? 1.0 : -i * 0.7);
        return {
          token: c.token,
          id: c.id,
          logit: Number(rawLogit.toFixed(2)),
          probability: 0,
          rank: i + 1,
        };
      });

    // Apply temperature-scaled softmax
    const temp = Math.max(0.01, temperature);
    const scaledExps = stepCandidates.map((c) => Math.exp(c.logit / temp));
    const sumExp = scaledExps.reduce((a, b) => a + b, 0);

    stepCandidates.forEach((c, idx) => {
      c.probability = Number((scaledExps[idx] / sumExp).toFixed(4));
    });

    // Sort by probability descending
    stepCandidates.sort((a, b) => b.probability - a.probability);
    stepCandidates.forEach((c, idx) => {
      c.rank = idx + 1;
    });

    const selected = stepCandidates[0];
    runningText += selected.token;

    steps.push({
      stepIndex: s,
      promptTokens: [...promptTokens],
      topCandidates: stepCandidates,
      selectedToken: selected,
      temperature,
      textSoFar: runningText,
    });
  }

  return steps;
}

/**
 * Builds the initial complete state for the simulator
 */
export function buildSimulatorState(
  inputText: string,
  stageIndex = 0
): SimulatorState {
  const tokens = tokenizeInputText(inputText);
  const seed = hashString(inputText || "promptforge");
  const embeddings = generateEmbeddings(tokens, seed);
  const positional = generatePositionalInfo(tokens, embeddings);
  const attentionHeads = generateAttentionHeads(tokens, seed + 1);
  const generationSteps = generateAutoregressiveSteps(tokens, 0.7, 5);

  const stageKeys: SimulatorState["stage"][] = [
    "input",
    "tokenization",
    "embeddings",
    "positional",
    "attention",
    "generation",
  ];

  const clampedStageIndex = Math.max(0, Math.min(5, stageIndex));

  return {
    stage: stageKeys[clampedStageIndex],
    stageNumber: clampedStageIndex + 1,
    inputText,
    tokens,
    embeddings,
    positional,
    attentionHeads,
    activeHeadIndex: 0,
    selectedQueryTokenIndex: tokens.length > 0 ? 0 : null,
    generationSteps,
    currentGenStepIndex: 0,
    isPlaying: false,
    playbackSpeed: 1.0,
  };
}
