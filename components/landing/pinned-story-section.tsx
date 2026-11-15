"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Layers, Braces } from "lucide-react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { CurvedDivider } from "@/components/ui/curved-divider";

gsap.registerPlugin(ScrollTrigger);

interface StageData {
  number: number;
  id: string;
  name: string;
  title: string;
  badge: string;
  tagline: string;
  description: string;
  mathematicalOperation: string;
  insight: string;
}

const STAGES: StageData[] = [
  {
    number: 1,
    id: "raw-text",
    name: "Byte Ingestion",
    title: "Raw UTF-8 Prompt String",
    badge: "Stage 01",
    tagline: "Unstructured lexical input without semantic coordinates",
    description:
      "Your prompt begins as a continuous UTF-8 byte stream. Before the neural network computes a single parameter, the text is treated as raw characters without concept boundaries.",
    mathematicalOperation: "x_raw = UTF-8(Bytes)",
    insight:
      "LLMs do not comprehend sentences directly; text must first be discretized into discrete symbolic fragments.",
  },
  {
    number: 2,
    id: "token-split",
    name: "BPE Tokenization",
    title: "Subword Discretization",
    badge: "Stage 02",
    tagline: "Lexical fragmentation into vocabulary token IDs",
    description:
      "A Byte Pair Encoding (BPE) tokenizer scans the byte stream and breaks words into subword fragments from a fixed vocabulary dictionary (e.g. 32k to 128k tokens).",
    mathematicalOperation: "T = [id_1, id_2, ..., id_N] ∈ V^N",
    insight:
      "Token boundaries dictate model reasoning. If a word splits awkwardly, the model must expend extra attention capacity reconstructing it.",
  },
  {
    number: 3,
    id: "vector-embeddings",
    name: "Latent Projection",
    title: "High-Dimensional Vector Embeddings",
    badge: "Stage 03",
    tagline: "Mapping discrete IDs into continuous mathematical geometry",
    description:
      "Each token ID indexes a learned embedding table, converting integers into continuous vectors in 4,096-dimensional space. Positional encodings are injected so the model knows word order.",
    mathematicalOperation: "E_i = Embedding(id_i) + PositionalEncoding(i)",
    insight:
      "Words with similar syntactic and semantic roles cluster together geometrically in latent space.",
  },
  {
    number: 4,
    id: "attention-matrix",
    name: "Self-Attention",
    title: "Multi-Head Attention Weights",
    badge: "Stage 04",
    tagline: "Every token cross-examines every other token",
    description:
      "The transformer executes scaled dot-product attention across parallel heads. Query (Q) and Key (K) vectors compute an N×N affinity matrix, dynamically routing semantic context between tokens.",
    mathematicalOperation: "Attention(Q, K, V) = softmax(Q K^T / √d_k) V",
    insight:
      "The token 'compiler' pays heavy attention to 'entanglement', priming the model to bridge quantum mechanics with computer science.",
  },
  {
    number: 5,
    id: "autoregressive-generation",
    name: "Logit Sampling",
    title: "Autoregressive Output Synthesis",
    badge: "Stage 05",
    tagline: "Next-token prediction probability distributions",
    description:
      "The final transformer layer outputs unnormalized logit scores across the entire vocabulary. Temperature and top-p sampling select the highest-affinity next token, appended iteratively.",
    mathematicalOperation: "P(w_{t+1} | w_{1:t}) = softmax(W_u h_t)",
    insight:
      "Generation is iterative and probabilistic. Every newly emitted token modifies the attention field for subsequent tokens.",
  },
];

const RAW_PROMPT = "Explain quantum entanglement to a compiler engineer";

const INPUT_TOKENS = [
  { text: "Explain", id: 28912, x: 70, y: 70 },
  { text: " quantum", id: 18452, x: 175, y: 70 },
  { text: " ent", id: 914, x: 265, y: 70 },
  { text: "angle", id: 12890, x: 330, y: 70 },
  { text: "ment", id: 1204, x: 405, y: 70 },
  { text: " to", id: 311, x: 480, y: 70 },
  { text: " a", id: 264, x: 535, y: 70 },
  { text: " compiler", id: 14210, x: 610, y: 70 },
  { text: " engineer", id: 7421, x: 695, y: 70 },
];

const OUTPUT_TOKENS = [
  { text: "Quantum", id: 41209 },
  { text: " states", id: 6241 },
  { text: " act", id: 1402 },
  { text: " like", id: 729 },
  { text: " shared", id: 8912 },
  { text: " pointers", id: 21901 },
  { text: " without", id: 1840 },
  { text: " mutex", id: 34102 },
];

export function PinnedStorySection() {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState<boolean>(false);
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  const sectionRef = useRef<HTMLDivElement | null>(null);
  const pinTargetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (prefersReduced) return;

    const section = sectionRef.current;
    const pinTarget = pinTargetRef.current;
    if (!section || !pinTarget) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: "+=2600",
        pin: pinTarget,
        pinSpacing: true,
        scrub: 0.5,
        anticipatePin: 1,
        onUpdate: (self) => {
          const progress = self.progress;
          setScrollProgress(progress);
          const stage = Math.min(4, Math.floor(progress * 5));
          setCurrentStageIdx(stage);
        },
      });
    }, section);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      ctx.revert();
      window.removeEventListener("resize", handleResize);
    };
  }, [prefersReduced]);

  const activeStage = STAGES[currentStageIdx];

  // Static Fallback for reduced motion
  if (mounted && prefersReduced) {
    return (
      <section className="relative overflow-hidden bg-lavender py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-4 py-1.5 text-xs font-bold text-violet">
              <Layers className="h-4 w-4" />
              <span>Educational simulation · Complete 5-stage architecture</span>
            </div>
            <h2 className="mt-4 font-sans text-3xl font-extrabold text-indigo sm:text-4xl">
              Inside the LLM Attention Lifecycle
            </h2>
            <p className="mt-3 max-w-[65ch] mx-auto text-base text-indigo-900/70 leading-[1.7]">
              Static step-by-step deconstruction of how neural transformers parse prompts into completions.
            </p>
          </div>

          <div className="space-y-8">
            {STAGES.map((stage) => (
              <div
                key={stage.id}
                className="rounded-2xl border border-indigo-950/10 bg-white p-8 shadow-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-indigo-950/10 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-coral/10 px-3 py-1 font-sans text-xs font-bold text-coral border border-coral/30">
                      {stage.badge}
                    </span>
                    <h3 className="font-sans text-xl font-bold text-indigo">
                      {stage.title}
                    </h3>
                  </div>
                  <span className="font-mono text-xs text-teal font-medium">
                    {stage.mathematicalOperation}
                  </span>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-2">
                  <div>
                    <p className="text-base leading-relaxed text-indigo-900/80">
                      {stage.description}
                    </p>
                    <p className="mt-4 text-sm text-indigo-900/70">
                      <strong className="text-coral font-bold">Key insight:</strong>{" "}
                      {stage.insight}
                    </p>
                  </div>
                  <div className="flex items-center justify-center rounded-xl border border-indigo-950/10 bg-cream p-6 font-mono text-sm text-indigo">
                    {stage.number === 1 && (
                      <div className="text-center font-mono text-coral font-semibold">
                        &quot;{RAW_PROMPT}&quot;
                      </div>
                    )}
                    {stage.number === 2 && (
                      <div className="flex flex-wrap justify-center gap-2">
                        {INPUT_TOKENS.map((t) => (
                          <span
                            key={t.id}
                            className="rounded-lg border border-violet/30 bg-violet/10 px-2.5 py-1 text-xs font-mono text-violet font-medium"
                          >
                            {t.text} <span className="opacity-50">#{t.id}</span>
                          </span>
                        ))}
                      </div>
                    )}
                    {stage.number === 3 && (
                      <div className="text-center text-teal font-mono">
                        Embedding vectors: [0.142, -0.984, 0.412, ..., 0.051] ∈ ℝ⁴⁰⁹⁶
                      </div>
                    )}
                    {stage.number === 4 && (
                      <div className="text-center text-violet font-mono">
                        Self-attention matrix: softmax(QKᵀ / √64) V → 12 heads × 48 layers
                      </div>
                    )}
                    {stage.number === 5 && (
                      <div className="text-center text-coral font-mono">
                        Autoregressive logit distribution → sample next token &quot;Quantum&quot;
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <CurvedDivider fillColor="text-cream" />
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative bg-lavender pt-0 pb-0">
      <div
        ref={pinTargetRef}
        className="relative flex min-h-screen flex-col justify-center py-20 lg:py-28 overflow-hidden"
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          {/* Section Header */}
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-4 py-1 text-xs font-bold text-violet">
                <Layers className="h-4 w-4" />
                <span>Educational simulation</span>
              </div>
              <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-indigo sm:text-5xl">
                Inside the LLM Attention Lifecycle
              </h2>
            </div>
            <div className="font-mono text-xs font-semibold text-indigo-900/60">
              Stage {currentStageIdx + 1} of 5 · Scroll down to scrub
            </div>
          </div>

          {/* Centerpiece 2-column layout: Visualizer (Left) + Caption Card (Right) */}
          <div className="grid gap-8 lg:grid-cols-12 lg:items-center">
            {/* Visualizer Frame */}
            <div className="relative flex min-h-[380px] flex-col justify-between overflow-hidden rounded-2xl border border-indigo-950/10 bg-white p-8 shadow-card lg:col-span-7">
              {/* Top toolbar */}
              <div className="flex items-center justify-between border-b border-indigo-950/10 pb-4 font-mono text-xs">
                <div className="flex items-center gap-2 text-indigo">
                  <span className="h-2.5 w-2.5 rounded-full bg-coral animate-pulse" />
                  <span>
                    State: <strong className="text-coral">{activeStage.name}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-teal font-medium">
                    Scrub: {Math.round(scrollProgress * 100)}%
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setCurrentStageIdx((p) => Math.max(0, p - 1))}
                      disabled={currentStageIdx === 0}
                      className="rounded-lg border border-indigo-950/10 bg-cream px-2.5 py-1 font-mono text-xs text-indigo hover:bg-white disabled:opacity-30 disabled:pointer-events-none"
                      aria-label="Previous stage"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCurrentStageIdx((p) => Math.min(STAGES.length - 1, p + 1))
                      }
                      disabled={currentStageIdx === STAGES.length - 1}
                      className="rounded-lg border border-coral/30 bg-coral/10 px-2.5 py-1 font-mono text-xs text-coral font-bold hover:bg-coral/20 disabled:opacity-30 disabled:pointer-events-none"
                      aria-label="Next stage"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Graphic Canvas/SVG */}
              <div className="relative my-auto flex min-h-[260px] w-full items-center justify-center py-4">
                <svg
                  viewBox="0 0 800 240"
                  className="h-full w-full max-w-[760px] select-none overflow-visible"
                  aria-label={`Transformer stage ${currentStageIdx + 1}: ${activeStage.title}`}
                >
                  <defs>
                    <pattern
                      id="lavender-grid"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="rgba(30, 27, 75, 0.05)"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect
                    width="800"
                    height="240"
                    fill="url(#lavender-grid)"
                    rx="12"
                  />

                  {/* STAGE 1: RAW TEXT */}
                  {currentStageIdx === 0 && (
                    <g className="transition-opacity duration-300">
                      <rect
                        x="60"
                        y="75"
                        width="680"
                        height="70"
                        rx="12"
                        fill="rgba(255, 107, 74, 0.08)"
                        stroke="#FF6B4A"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <text
                        x="400"
                        y="118"
                        textAnchor="middle"
                        fill="#1E1B4B"
                        fontFamily="monospace"
                        fontSize="18"
                        fontWeight="bold"
                      >
                        &quot;{RAW_PROMPT}&quot;
                      </text>
                      <text
                        x="400"
                        y="180"
                        textAnchor="middle"
                        fill="#5B567A"
                        fontFamily="monospace"
                        fontSize="12"
                      >
                        [Contiguous byte stream: 51 ASCII characters, no token boundaries]
                      </text>
                    </g>
                  )}

                  {/* STAGE 2: TOKENS SPLIT APART */}
                  {currentStageIdx === 1 && (
                    <g className="transition-opacity duration-300">
                      {INPUT_TOKENS.map((token, i) => {
                        const spreadX = 40 + i * 80;
                        return (
                          <g key={token.id} transform={`translate(${spreadX}, 90)`}>
                            <rect
                              x="0"
                              y="0"
                              width="72"
                              height="48"
                              rx="8"
                              fill="rgba(124, 92, 255, 0.12)"
                              stroke="#7C5CFF"
                              strokeWidth="1.2"
                            />
                            <text
                              x="36"
                              y="24"
                              textAnchor="middle"
                              fill="#1E1B4B"
                              fontFamily="monospace"
                              fontSize="12"
                              fontWeight="600"
                            >
                              {token.text.trim()}
                            </text>
                            <text
                              x="36"
                              y="38"
                              textAnchor="middle"
                              fill="#7C5CFF"
                              fontFamily="monospace"
                              fontSize="9"
                              fontWeight="bold"
                            >
                              #{token.id}
                            </text>
                          </g>
                        );
                      })}
                      <text
                        x="400"
                        y="190"
                        textAnchor="middle"
                        fill="#12B5A6"
                        fontFamily="monospace"
                        fontSize="12"
                        fontWeight="600"
                      >
                        Notice: &apos;entanglement&apos; → [&apos;ent&apos;, &apos;angle&apos;, &apos;ment&apos;] (3 subwords)
                      </text>
                    </g>
                  )}

                  {/* STAGE 3: VECTOR EMBEDDINGS */}
                  {currentStageIdx === 2 && (
                    <g className="transition-opacity duration-300">
                      <line
                        x1="80"
                        y1="200"
                        x2="720"
                        y2="200"
                        stroke="rgba(30, 27, 75, 0.15)"
                        strokeWidth="1"
                      />
                      <line
                        x1="400"
                        y1="30"
                        x2="400"
                        y2="210"
                        stroke="rgba(30, 27, 75, 0.15)"
                        strokeWidth="1"
                      />
                      <text
                        x="730"
                        y="204"
                        fill="#5B567A"
                        fontFamily="monospace"
                        fontSize="10"
                      >
                        d₁ (Semantic)
                      </text>
                      <text
                        x="400"
                        y="20"
                        textAnchor="middle"
                        fill="#5B567A"
                        fontFamily="monospace"
                        fontSize="10"
                      >
                        d₄₀₉₆ (Context)
                      </text>

                      {INPUT_TOKENS.map((token, i) => {
                        const posX = 110 + i * 70 + Math.sin(i * 1.8) * 35;
                        const posY = 130 + Math.cos(i * 1.5) * 55;
                        return (
                          <g key={token.id} transform={`translate(${posX}, ${posY})`}>
                            <circle r="4" fill="#12B5A6" />
                            <circle
                              r="10"
                              fill="none"
                              stroke="#12B5A6"
                              strokeWidth="1"
                              opacity="0.4"
                            />
                            <line
                              x1="0"
                              y1="0"
                              x2="0"
                              y2={200 - posY}
                              stroke="rgba(18, 181, 166, 0.3)"
                              strokeDasharray="2 2"
                            />
                            <text
                              x="0"
                              y="-12"
                              textAnchor="middle"
                              fill="#1E1B4B"
                              fontFamily="monospace"
                              fontSize="11"
                              fontWeight="600"
                            >
                              v({token.text.trim()})
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {/* STAGE 4: ATTENTION MATRIX */}
                  {currentStageIdx === 3 && (
                    <g className="transition-opacity duration-300">
                      {INPUT_TOKENS.map((t1, i) => {
                        const x1 = 70 + i * 78;
                        const y1 = 170;

                        return (
                          <g key={`node-${t1.id}`}>
                            {INPUT_TOKENS.map((t2, j) => {
                              if (j <= i) return null;
                              const x2 = 70 + j * 78;
                              const y2 = 170;
                              const isSemanticPair =
                                (i === 1 && j === 7) ||
                                (i === 3 && j === 8) ||
                                (i === 0 && j === 1) ||
                                (i === 7 && j === 8);
                              const opacity = isSemanticPair ? 0.95 : 0.2;
                              const strokeColor = isSemanticPair ? "#FF6B4A" : "#7C5CFF";
                              const strokeW = isSemanticPair ? 2.5 : 1;
                              const arcHeight = Math.abs(j - i) * 18;

                              return (
                                <path
                                  key={`att-${i}-${j}`}
                                  d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${y1 - arcHeight} ${x2} ${y2}`}
                                  fill="none"
                                  stroke={strokeColor}
                                  strokeWidth={strokeW}
                                  strokeOpacity={opacity}
                                />
                              );
                            })}
                            <circle cx={x1} cy={y1} r="6" fill="#FF6B4A" />
                            <text
                              x={x1}
                              y={y1 + 22}
                              textAnchor="middle"
                              fill="#1E1B4B"
                              fontFamily="monospace"
                              fontSize="10"
                              fontWeight="600"
                            >
                              {t1.text.trim()}
                            </text>
                          </g>
                        );
                      })}
                      <text
                        x="400"
                        y="35"
                        textAnchor="middle"
                        fill="#FF6B4A"
                        fontFamily="monospace"
                        fontSize="12"
                        fontWeight="bold"
                      >
                        Attention Weight Affinity: Softmax(Q · Kᵀ / √dₖ)
                      </text>
                    </g>
                  )}

                  {/* STAGE 5: OUTPUT TOKENS */}
                  {currentStageIdx === 4 && (
                    <g className="transition-opacity duration-300">
                      <rect
                        x="40"
                        y="20"
                        width="720"
                        height="80"
                        rx="10"
                        fill="rgba(251, 246, 238, 0.9)"
                        stroke="rgba(30, 27, 75, 0.1)"
                      />
                      <text
                        x="60"
                        y="45"
                        fill="#5B567A"
                        fontFamily="monospace"
                        fontSize="11"
                        fontWeight="bold"
                      >
                        PROMPT CONTEXT CACHE:
                      </text>
                      <text
                        x="60"
                        y="75"
                        fill="#1E1B4B"
                        fontFamily="monospace"
                        fontSize="13"
                        fontWeight="bold"
                      >
                        &quot;{RAW_PROMPT}&quot;
                      </text>

                      <g transform="translate(40, 130)">
                        <text
                          x="20"
                          y="20"
                          fill="#12B5A6"
                          fontFamily="monospace"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          AUTOREGRESSIVE COMPLETION:
                        </text>
                        {OUTPUT_TOKENS.map((outTok, idx) => {
                          const posX = 20 + idx * 88;
                          return (
                            <g key={outTok.id} transform={`translate(${posX}, 35)`}>
                              <rect
                                x="0"
                                y="0"
                                width="82"
                                height="40"
                                rx="8"
                                fill="rgba(18, 181, 166, 0.12)"
                                stroke="#12B5A6"
                                strokeWidth="1.2"
                              />
                              <text
                                x="41"
                                y="22"
                                textAnchor="middle"
                                fill="#1E1B4B"
                                fontFamily="monospace"
                                fontSize="11"
                                fontWeight="600"
                              >
                                {outTok.text}
                              </text>
                              <text
                                x="41"
                                y="33"
                                textAnchor="middle"
                                fill="#12B5A6"
                                fontFamily="monospace"
                                fontSize="8"
                                fontWeight="bold"
                              >
                                #{outTok.id}
                              </text>
                            </g>
                          );
                        })}
                      </g>
                    </g>
                  )}
                </svg>
              </div>

              {/* Bottom strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-indigo-950/10 pt-4 font-mono text-xs">
                <span className="flex items-center gap-1.5 text-coral font-semibold">
                  <Braces className="h-4 w-4" /> Math Op: {activeStage.mathematicalOperation}
                </span>
                <span className="text-indigo-900/60 font-mono text-xs">
                  Scroll to scrub sequence · Zero reflow
                </span>
              </div>
            </div>

            {/* Side Caption Card */}
            <div className="relative flex flex-col justify-between rounded-2xl border border-indigo-950/10 bg-white p-8 shadow-card lg:col-span-5">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-coral/10 px-3.5 py-1 font-sans text-xs font-bold text-coral border border-coral/30">
                    {activeStage.badge} · {activeStage.name}
                  </span>
                  <span className="font-mono text-xs font-bold text-teal">
                    {currentStageIdx + 1} / 5
                  </span>
                </div>

                <h3 className="mt-6 font-sans text-2xl font-bold text-indigo sm:text-3xl">
                  {activeStage.title}
                </h3>

                <p className="mt-2 font-sans text-xs font-semibold uppercase tracking-wider text-violet">
                  {activeStage.tagline}
                </p>

                <p className="mt-4 text-base leading-[1.7] text-indigo-900/80">
                  {activeStage.description}
                </p>

                <div className="mt-6 rounded-xl border border-indigo-950/10 bg-butter/40 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo">
                    Key Insight
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-indigo-900/90 font-medium">
                    {activeStage.insight}
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-indigo-950/10 pt-4">
                <div className="flex items-center justify-between text-xs font-mono text-indigo-900/60">
                  <span>Transformation:</span>
                  <span className="text-coral font-bold">{activeStage.mathematicalOperation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curved Divider into Cream Band */}
      <CurvedDivider fillColor="text-cream" />
    </section>
  );
}
