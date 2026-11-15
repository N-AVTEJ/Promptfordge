"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Cpu, Braces, Info, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

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
      "Your prompt begins as a continuous UTF-8 byte stream. Before the neural network computes a single parameter, the text is treated as raw characters without inherent concept boundaries.",
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
      "A Byte Pair Encoding (BPE) tokenizer scans the byte stream and breaks words into subword fragments from a fixed vocabulary dictionary (e.g. 32k to 128k tokens). Words like 'entanglement' fracture into multiple pieces.",
    mathematicalOperation: "T = [id_1, id_2, ..., id_N] \\in V^N",
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
      "Each token ID indexes a learned embedding table, converting integers into continuous vectors in 4,096-dimensional space. Sinusoidal or RoPE (Rotary) positional encodings are injected so the model knows word order.",
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
      "The transformer executes scaled dot-product attention across dozens of parallel attention heads. Query (Q) and Key (K) vectors compute an N×N attention affinity matrix, dynamically routing semantic context between tokens.",
    mathematicalOperation:
      "Attention(Q, K, V) = softmax(Q K^T / \\sqrt{d_k}) V",
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
      "The final transformer layer outputs unnormalized logit scores across the entire vocabulary. Temperature and top-p sampling select the highest-affinity next token, which is appended to the context for the next cycle.",
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
  { text: " to", id: 312, x: 475, y: 70 },
  { text: " a", id: 264, x: 525, y: 70 },
  { text: " compiler", id: 21908, x: 615, y: 70 },
  { text: " engineer", id: 8943, x: 725, y: 70 },
];

const OUTPUT_TOKENS = [
  { text: "State", id: 5912 },
  { text: " superposition", id: 19821 },
  { text: " maps", id: 7421 },
  { text: " to", id: 312 },
  { text: " non-", id: 1842 },
  { text: "local", id: 4912 },
  { text: " pointer", id: 14210 },
  { text: " aliases.", id: 38914 },
];

export function PinnedStorySection() {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState<boolean>(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const pinTargetRef = useRef<HTMLDivElement | null>(null);
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

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
        end: "+=1200",
        pin: pinTarget,
        pinSpacing: true,
        scrub: 0.25,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          setScrollProgress(progress);
          // 5 stages mapped across 0.0 to 1.0
          const stage = Math.min(4, Math.floor(progress * 5));
          setCurrentStageIdx(stage);
        },
      });
    }, section);

    // Debounced resize handler to recalculate pins without breaks
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

  // Static Fallback for reduced motion: render all 5 stages in vertical layout
  if (mounted && prefersReduced) {
    return (
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-md border border-cyan-500/20 bg-cyan-500/5 px-3 py-1 font-mono text-xs font-medium text-cyan-400">
            <Info className="h-3.5 w-3.5" />
            <span>Educational simulation · Complete 5-stage architecture</span>
          </div>
          <h2 className="mt-4 font-mono text-3xl font-extrabold text-forge-text sm:text-4xl">
            Inside the LLM Attention Lifecycle
          </h2>
          <p className="mt-2 text-sm text-forge-muted">
            Static step-by-step deconstruction of how neural transformers parse
            prompts into completions.
          </p>
        </div>

        <div className="space-y-8">
          {STAGES.map((stage) => (
            <div
              key={stage.id}
              className="rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#11141A] to-[#0A0C0F] p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.06] pb-4">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="border-ember-500/30 bg-ember-500/5 font-mono text-xs text-ember-400"
                  >
                    {stage.badge}
                  </Badge>
                  <h3 className="font-mono text-xl font-bold text-forge-text">
                    {stage.title}
                  </h3>
                </div>
                <span className="font-mono text-xs text-cyan-400">
                  {stage.mathematicalOperation}
                </span>
              </div>
              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-sm leading-relaxed text-forge-muted">
                    {stage.description}
                  </p>
                  <p className="mt-3 text-xs text-zinc-400">
                    <strong className="text-ember-400 font-medium">Key insight:</strong>{" "}
                    {stage.insight}
                  </p>
                </div>
                <div className="flex items-center justify-center rounded-lg border border-white/[0.06] bg-[#08090C] p-4 font-mono text-xs text-forge-text">
                  {stage.number === 1 && (
                    <div className="text-center font-mono text-ember-400">
                      {RAW_PROMPT}
                    </div>
                  )}
                  {stage.number === 2 && (
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {INPUT_TOKENS.map((t) => (
                        <span
                          key={t.id}
                          className="rounded border border-ember-500/30 bg-ember-500/10 px-2 py-1"
                        >
                          {t.text} <span className="opacity-40">#{t.id}</span>
                        </span>
                      ))}
                    </div>
                  )}
                  {stage.number === 3 && (
                    <div className="text-center text-cyan-400">
                      Embedding vectors: [0.142, -0.984, 0.412, ..., 0.051] ∈
                      ℝ⁴⁰⁹⁶
                    </div>
                  )}
                  {stage.number === 4 && (
                    <div className="text-center text-ember-400">
                      Self-attention matrix: softmax(QKᵀ / √64) V → 12 heads ×
                      48 layers
                    </div>
                  )}
                  {stage.number === 5 && (
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {OUTPUT_TOKENS.map((t) => (
                        <span
                          key={t.id}
                          className="rounded border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-cyan-300"
                        >
                          {t.text}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative z-20 bg-[#08090C]">
      <div
        ref={pinTargetRef}
        className="flex min-h-screen w-full flex-col justify-center px-4 py-8 sm:px-6 lg:px-8"
      >
        <div className="mx-auto w-full max-w-7xl">
          {/* Header & Simulation Notice */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
                <Cpu className="h-4 w-4 text-ember-400" />
              </div>
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-forge-muted">
                  Transformer internals
                </span>
                <h2 className="font-mono text-lg font-bold text-forge-text sm:text-2xl">
                  How an LLM Reads Your Prompt
                </h2>
              </div>
            </div>

            {/* Mandatory Honesty Rule: Labeled "Educational simulation" */}
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="border-cyan-500/30 bg-cyan-500/5 font-mono text-xs font-semibold text-cyan-400"
              >
                <Layers className="mr-1.5 h-3.5 w-3.5" />
                Educational simulation
              </Badge>
              <div className="hidden font-mono text-xs text-forge-muted sm:block">
                Stage {currentStageIdx + 1} of 5
              </div>
            </div>
          </div>

          {/* Centerpiece Layout: Left Visualizer + Right Stage Caption Card */}
          <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
            {/* Visualizer Frame (7 columns) */}
            <div className="relative flex min-h-[380px] flex-col justify-between overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-[#131722] via-[#0E1016] to-[#08090C] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] sm:min-h-[440px] lg:col-span-7 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/40 before:to-transparent">
              {/* Top toolbar */}
              <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#11141B]/80 px-2 pb-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="h-2 w-2 rounded-full bg-ember-500 animate-pulse shadow-[0_0_8px_#ff6b00]" />
                  <span>Pipeline state: <strong className="text-amber-400">{activeStage.name}</strong></span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="hidden font-mono text-[11px] text-cyan-400 sm:inline-block">
                    Scrub: {Math.round(scrollProgress * 100)}%
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCurrentStageIdx((p) => Math.max(0, p - 1))}
                      disabled={currentStageIdx === 0}
                      className="rounded border border-white/[0.1] bg-white/[0.04] px-2 py-0.5 font-mono text-[10px] text-zinc-300 transition-colors hover:bg-white/[0.1] hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      aria-label="Previous transformer stage"
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStageIdx((p) => Math.min(STAGES.length - 1, p + 1))}
                      disabled={currentStageIdx === STAGES.length - 1}
                      className="rounded border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] text-amber-300 transition-colors hover:bg-amber-500/20 hover:text-white disabled:opacity-30 disabled:pointer-events-none"
                      aria-label="Next transformer stage"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>

              {/* Main SVG/Canvas Graphic representing the 5 stages */}
              <div className="relative my-auto flex min-h-[260px] w-full items-center justify-center py-4">
                <svg
                  viewBox="0 0 800 240"
                  className="h-full w-full max-w-[760px] select-none overflow-visible"
                  aria-label={`Transformer stage ${currentStageIdx + 1}: ${activeStage.title}`}
                >
                  {/* Grid Lines */}
                  <defs>
                    <pattern
                      id="forge-grid"
                      width="40"
                      height="40"
                      patternUnits="userSpaceOnUse"
                    >
                      <path
                        d="M 40 0 L 0 0 0 40"
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.04)"
                        strokeWidth="1"
                      />
                    </pattern>
                  </defs>
                  <rect
                    width="800"
                    height="240"
                    fill="url(#forge-grid)"
                    rx="8"
                  />

                  {/* STAGE 1: RAW TEXT */}
                  {currentStageIdx === 0 && (
                    <g className="transition-opacity duration-300">
                      <rect
                        x="60"
                        y="80"
                        width="680"
                        height="60"
                        rx="10"
                        fill="rgba(255, 107, 0, 0.08)"
                        stroke="#FF6B00"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                      />
                      <text
                        x="400"
                        y="117"
                        textAnchor="middle"
                        fill="#F5F6F8"
                        fontFamily="monospace"
                        fontSize="20"
                        fontWeight="bold"
                      >
                        &quot;{RAW_PROMPT}&quot;
                      </text>
                      <text
                        x="400"
                        y="180"
                        textAnchor="middle"
                        fill="#A0A5B2"
                        fontFamily="monospace"
                        fontSize="12"
                      >
                        [Contiguous byte stream: 51 ASCII characters, no token
                        boundaries]
                      </text>
                    </g>
                  )}

                  {/* STAGE 2: TOKENS SPLIT APART */}
                  {currentStageIdx === 1 && (
                    <g className="transition-opacity duration-300">
                      {INPUT_TOKENS.map((token, i) => {
                        const spreadX = 40 + i * 80;
                        return (
                          <g
                            key={token.id}
                            transform={`translate(${spreadX}, 90)`}
                          >
                            <rect
                              x="0"
                              y="0"
                              width="72"
                              height="48"
                              rx="8"
                              fill="rgba(255, 107, 0, 0.12)"
                              stroke="#FF6B00"
                              strokeWidth="1.2"
                            />
                            <text
                              x="36"
                              y="24"
                              textAnchor="middle"
                              fill="#F5F6F8"
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
                              fill="#FF6B00"
                              fontFamily="monospace"
                              fontSize="9"
                              opacity="0.8"
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
                        fill="#00E5FF"
                        fontFamily="monospace"
                        fontSize="12"
                      >
                        Notice: &apos;entanglement&apos; → [&apos;ent&apos;,
                        &apos;angle&apos;, &apos;ment&apos;] (3 subwords)
                      </text>
                    </g>
                  )}

                  {/* STAGE 3: TOKENS BECOME VECTORS (DOTS IN SPACE) */}
                  {currentStageIdx === 2 && (
                    <g className="transition-opacity duration-300">
                      {/* Geometric coordinate axes */}
                      <line
                        x1="80"
                        y1="200"
                        x2="720"
                        y2="200"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="1"
                      />
                      <line
                        x1="400"
                        y1="30"
                        x2="400"
                        y2="210"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="1"
                      />
                      <text
                        x="730"
                        y="204"
                        fill="#A0A5B2"
                        fontFamily="monospace"
                        fontSize="10"
                      >
                        d₁ (Semantic)
                      </text>
                      <text
                        x="400"
                        y="20"
                        textAnchor="middle"
                        fill="#A0A5B2"
                        fontFamily="monospace"
                        fontSize="10"
                      >
                        d₄₀₉₆ (Context)
                      </text>

                      {INPUT_TOKENS.map((token, i) => {
                        // Vector coordinates in space
                        const posX = 110 + i * 70 + Math.sin(i * 1.8) * 35;
                        const posY = 130 + Math.cos(i * 1.5) * 55;
                        return (
                          <g
                            key={token.id}
                            transform={`translate(${posX}, ${posY})`}
                          >
                            {/* Precision coordinate dot */}
                            <circle r="4" fill="#00E5FF" opacity="0.9" />
                            <circle
                              r="10"
                              fill="none"
                              stroke="#00E5FF"
                              strokeWidth="1"
                              opacity="0.3"
                            />
                            {/* Vector line to axis */}
                            <line
                              x1="0"
                              y1="0"
                              x2="0"
                              y2={200 - posY}
                              stroke="rgba(0, 229, 255, 0.25)"
                              strokeDasharray="2 2"
                            />
                            <text
                              x="0"
                              y="-12"
                              textAnchor="middle"
                              fill="#F5F6F8"
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

                  {/* STAGE 4: ATTENTION LINES CONNECT TOKENS WITH VARYING OPACITY */}
                  {currentStageIdx === 3 && (
                    <g className="transition-opacity duration-300">
                      {/* Token nodes placed along an arc */}
                      {INPUT_TOKENS.map((t1, i) => {
                        const x1 = 70 + i * 78;
                        const y1 = 170;

                        return (
                          <g key={`node-${t1.id}`}>
                            {/* Attention lines connecting to other tokens with varying opacity */}
                            {INPUT_TOKENS.map((t2, j) => {
                              if (j <= i) return null;
                              const x2 = 70 + j * 78;
                              const y2 = 170;
                              // High attention between "quantum" (index 1) and "compiler" (index 7)
                              const isSemanticPair =
                                (i === 1 && j === 7) ||
                                (i === 3 && j === 8) ||
                                (i === 0 && j === 1) ||
                                (i === 7 && j === 8);
                              const opacity = isSemanticPair ? 0.95 : 0.14;
                              const strokeColor = isSemanticPair
                                ? "#FF6B00"
                                : "#00E5FF";
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

                            {/* Node anchor */}
                            <circle cx={x1} cy={y1} r="6" fill="#FF6B00" />
                            <text
                              x={x1}
                              y={y1 + 22}
                              textAnchor="middle"
                              fill="#F5F6F8"
                              fontFamily="monospace"
                              fontSize="10"
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
                        fill="#FF6B00"
                        fontFamily="monospace"
                        fontSize="12"
                      >
                        Attention Weight Affinity: Softmax(Q · Kᵀ / √dₖ)
                      </text>
                    </g>
                  )}

                  {/* STAGE 5: OUTPUT TOKENS APPEAR ONE BY ONE */}
                  {currentStageIdx === 4 && (
                    <g className="transition-opacity duration-300">
                      <rect
                        x="40"
                        y="20"
                        width="720"
                        height="80"
                        rx="8"
                        fill="rgba(11,12,14,0.6)"
                        stroke="rgba(255,255,255,0.1)"
                      />
                      <text
                        x="60"
                        y="45"
                        fill="#A0A5B2"
                        fontFamily="monospace"
                        fontSize="11"
                      >
                        PROMPT CONTEXT CACHE:
                      </text>
                      <text
                        x="60"
                        y="75"
                        fill="#A0A5B2"
                        fontFamily="monospace"
                        fontSize="13"
                      >
                        &quot;{RAW_PROMPT}&quot;
                      </text>

                      {/* Output tokens generated sequentially */}
                      <g transform="translate(40, 130)">
                        <text
                          x="20"
                          y="20"
                          fill="#00E5FF"
                          fontFamily="monospace"
                          fontSize="12"
                          fontWeight="bold"
                        >
                          AUTOREGRESSIVE COMPLETION:
                        </text>
                        {OUTPUT_TOKENS.map((outTok, idx) => {
                          const posX = 20 + idx * 88;
                          return (
                            <g
                              key={outTok.id}
                              transform={`translate(${posX}, 35)`}
                            >
                              <rect
                                x="0"
                                y="0"
                                width="82"
                                height="40"
                                rx="6"
                                fill="rgba(0, 229, 255, 0.12)"
                                stroke="#00E5FF"
                                strokeWidth="1.2"
                              />
                              <text
                                x="41"
                                y="22"
                                textAnchor="middle"
                                fill="#F5F6F8"
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
                                fill="#00E5FF"
                                fontFamily="monospace"
                                fontSize="8"
                                opacity="0.8"
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

              {/* Bottom Telemetry Strip */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/[0.06] pt-3 font-mono text-xs">
                <span className="flex items-center gap-1.5 text-ember-400">
                  <Braces className="h-3.5 w-3.5" /> Math Op:{" "}
                  {activeStage.mathematicalOperation}
                </span>
                <span className="text-[11px] text-zinc-500">
                  Scroll down to scrub sequence · Zero layout reflow
                </span>
              </div>
            </div>

            {/* Side Caption Card (5 columns) */}
            <div className="relative flex flex-col justify-between rounded-xl border border-amber-500/30 bg-gradient-to-b from-[#131722] via-[#0E1016] to-[#08090C] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.7)] sm:p-8 lg:col-span-5 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/40 before:to-transparent">
              <div>
                {/* Stage Badge & Step Indicator */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant="outline"
                    className="border-ember-500/50 bg-ember-500/10 font-mono text-xs text-amber-400 shadow-[0_0_10px_rgba(255,107,0,0.2)]"
                  >
                    {activeStage.badge} · {activeStage.name}
                  </Badge>
                  <span className="font-mono text-xs text-cyan-400 font-bold">
                    {currentStageIdx + 1} / 5
                  </span>
                </div>

                {/* Stage Title */}
                <h3 className="mt-4 font-mono text-2xl font-bold text-forge-text sm:text-3xl">
                  {activeStage.title}
                </h3>

                <p className="mt-2 font-mono text-xs font-medium text-cyan-400">
                  {activeStage.tagline}
                </p>

                {/* Description */}
                <p className="mt-4 text-sm leading-relaxed text-zinc-400 sm:text-base">
                  {activeStage.description}
                </p>

                {/* Pedagogical Insight Callout */}
                <div className="mt-6 rounded-lg border border-white/[0.06] bg-black/40 p-4">
                  <div className="flex items-center gap-2 font-mono text-xs font-semibold text-ember-400">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Architectural insight</span>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
                    {activeStage.insight}
                  </p>
                </div>
              </div>

              {/* Progress Indicator dots & bar */}
              <div className="mt-8 border-t border-white/[0.06] pt-6">
                <div className="mb-2 flex items-center justify-between font-mono text-xs text-zinc-400">
                  <span>Transformation pipeline</span>
                  <span className="font-medium text-ember-400">
                    Stage {currentStageIdx + 1}
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {STAGES.map((s, idx) => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setCurrentStageIdx(idx)}
                      className={`group flex flex-col items-center gap-1.5 rounded p-1 transition-all ${
                        idx === currentStageIdx ? "opacity-100" : "opacity-60 hover:opacity-100"
                      }`}
                      aria-label={`Jump to stage ${idx + 1}: ${s.name}`}
                      title={`Stage ${idx + 1}: ${s.name}`}
                    >
                      <div
                        className={`h-1.5 w-full rounded-full transition-all duration-200 ${
                          idx === currentStageIdx
                            ? "bg-amber-400 shadow-[0_0_8px_#ff6b00]"
                            : idx < currentStageIdx
                              ? "bg-cyan-500/60"
                              : "bg-white/[0.12] group-hover:bg-white/[0.25]"
                        }`}
                      />
                      <span className="hidden font-mono text-[9px] text-zinc-400 group-hover:text-white sm:block">
                        0{idx + 1}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
