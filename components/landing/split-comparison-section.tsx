"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  FlaskConical,
  XCircle,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { CurvedDivider } from "@/components/ui/curved-divider";

export function SplitComparisonSection() {
  const prefersReduced = useReducedMotion();
  const [activeTab, setActiveTab] = useState<"naive" | "engineered">("engineered");

  return (
    <section className="relative overflow-hidden bg-cream pt-0 pb-0">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-coral/30 bg-coral/10 px-4 py-1.5 text-xs font-bold text-coral shadow-card">
            <FlaskConical className="h-4 w-4 text-coral" />
            <span>Pedagogical Methodology</span>
          </div>
          <h2 className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-indigo sm:text-5xl">
            Experiment, Don&apos;t Just Watch
          </h2>
          <p className="mt-4 max-w-[65ch] mx-auto text-base sm:text-lg leading-[1.7] text-indigo-900/75">
            Video tutorials provide an illusion of competence. Only turning knobs on temperature,
            token boundaries, and delimiter syntax builds real production muscle memory.
          </p>
        </div>

        {/* Split Comparison: Left (Passive) vs Right (Active Practitioner) */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2 items-stretch">
          {/* LEFT: Watching a video (Passive) */}
          <div className="flex flex-col justify-between rounded-2xl border border-indigo-950/10 bg-white p-8 shadow-card">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-indigo-950/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-950/10 bg-cream text-indigo-900/60">
                    <Play className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-indigo-900/50 block font-semibold">
                      Passive Spectator Mode
                    </span>
                    <h3 className="font-sans text-lg font-bold text-indigo">
                      Watching a Video
                    </h3>
                  </div>
                </div>
                <span className="rounded-full border border-coral/30 bg-coral/10 px-3 py-1 font-mono text-xs font-bold text-coral">
                  Passive
                </span>
              </div>

              {/* Passive simulation thumbnail */}
              <div className="mt-6 rounded-xl border border-indigo-950/10 bg-cream/70 p-4">
                <div className="relative aspect-video w-full rounded-lg bg-white flex flex-col items-center justify-center border border-indigo-950/10 shadow-sm">
                  <div className="h-12 w-12 rounded-full border border-indigo-950/15 bg-cream flex items-center justify-center text-indigo-900/50">
                    <Play className="h-5 w-5 ml-0.5 text-indigo-900/60" />
                  </div>
                  <span className="mt-3 font-mono text-xs font-medium text-indigo-900/70">
                    &quot;10 Prompt Hacks in 2026&quot; (48:12)
                  </span>
                  <div className="absolute bottom-3 left-4 right-4 h-1.5 rounded-full bg-indigo-950/10">
                    <div className="h-full w-1/3 bg-indigo-950/30 rounded-full" />
                  </div>
                </div>
              </div>

              {/* Critiques */}
              <div className="mt-6 space-y-3 text-sm text-indigo-900/80">
                <div className="flex items-start gap-2.5">
                  <XCircle className="h-4 w-4 text-coral shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-indigo font-semibold">Illusion of Competence:</strong> Nodding along to curated demos hides edge-case failure modes.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="h-4 w-4 text-coral shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-indigo font-semibold">Rapid Retention Decay:</strong> Passively watched advice fades without hands-on verification.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="h-4 w-4 text-coral shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-indigo font-semibold">Zero Telemetry:</strong> No visibility into token variance, latency spikes, or cost trade-offs.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-coral/20 bg-coral/5 p-4 text-xs font-mono">
              <div className="flex justify-between items-center text-indigo-900/70">
                <span>Production Preparedness:</span>
                <span className="text-coral font-bold">14% (Fails on unpredicted inputs)</span>
              </div>
            </div>
          </div>

          {/* RIGHT: Running the experiment (Right side animates in) */}
          <motion.div
            initial={prefersReduced ? { opacity: 1, x: 0 } : { opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={
              prefersReduced
                ? { duration: 0 }
                : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
            }
            className="flex flex-col justify-between rounded-2xl border-2 border-teal/40 bg-white p-8 shadow-card-hover"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-indigo-950/10 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal/30 bg-teal/10 text-teal">
                    <FlaskConical className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-mono text-xs uppercase tracking-wider text-teal block font-bold">
                      Practitioner Sandbox Mode
                    </span>
                    <h3 className="font-sans text-lg font-bold text-indigo">
                      Running the Experiment
                    </h3>
                  </div>
                </div>
                <span className="rounded-full border border-teal/30 bg-teal/10 px-3 py-1 font-mono text-xs font-bold text-teal flex items-center gap-1">
                  <Zap className="h-3 w-3 fill-teal" /> Live Lab
                </span>
              </div>

              {/* Mini Side-by-Side Interactive Diff */}
              <div className="mt-6 rounded-xl border border-indigo-950/10 bg-cream/50 p-4">
                <div className="flex items-center justify-between border-b border-indigo-950/10 pb-3">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab("naive")}
                      className={`rounded-lg px-3 py-1 font-mono text-xs font-semibold transition-colors ${
                        activeTab === "naive"
                          ? "bg-coral text-white"
                          : "bg-white text-indigo-900/60 border border-indigo-950/10 hover:text-indigo"
                      }`}
                    >
                      Prompt A: Naive
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("engineered")}
                      className={`rounded-lg px-3 py-1 font-mono text-xs font-semibold transition-colors ${
                        activeTab === "engineered"
                          ? "bg-teal text-white"
                          : "bg-white text-indigo-900/60 border border-indigo-950/10 hover:text-indigo"
                      }`}
                    >
                      Prompt B: Forged
                    </button>
                  </div>
                  <span className="font-mono text-xs text-teal font-medium">
                    Live Diff Telemetry
                  </span>
                </div>

                {/* Diff Output */}
                <div className="mt-4 font-mono text-xs space-y-3">
                  {activeTab === "naive" ? (
                    <>
                      <div className="rounded-lg border border-coral/30 bg-coral/10 p-3 text-indigo">
                        <span className="text-coral font-bold block text-[11px] mb-1">
                          PROMPT:
                        </span>
                        &quot;Extract customer names and amounts from this email, hurry.&quot;
                      </div>
                      <div className="rounded-lg border border-indigo-950/10 bg-white p-3 text-indigo-900/80">
                        <span className="text-indigo-900/50 font-bold block text-[11px] mb-1">
                          COMPLETION:
                        </span>
                        &quot;Here are the names: Alice spent around $40. Bob bought something too!&quot;
                        <div className="mt-2 text-coral font-semibold flex items-center gap-1 text-[11px]">
                          <XCircle className="h-3.5 w-3.5" /> Failed JSON parse · Conversational preamble
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-lg border border-teal/30 bg-teal/10 p-3 text-indigo">
                        <span className="text-teal font-bold block text-[11px] mb-1">
                          DELIMITED PROMPT:
                        </span>
                        &lt;instruction&gt;Extract orders to JSON: &#123;customer: str, amount_cents: int&#125;. No prose.&lt;/instruction&gt;
                      </div>
                      <div className="rounded-lg border border-indigo-950/10 bg-white p-3 text-teal">
                        <span className="text-indigo-900/50 font-bold block text-[11px] mb-1">
                          COMPLETION:
                        </span>
                        <pre className="font-mono text-[11px] text-indigo leading-tight">
{`[
  { "customer": "Alice", "amount_cents": 4000 },
  { "customer": "Bob", "amount_cents": 1250 }
]`}
                        </pre>
                        <div className="mt-2 text-teal font-semibold flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="h-3.5 w-3.5 text-teal" /> 100% Schema Compliance · 0ms latency penalty
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Benefits */}
              <div className="mt-6 space-y-3 text-sm text-indigo-900/80">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-teal shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-indigo font-semibold">Immediate Feedback:</strong> Test hypotheses against multiple models in parallel with real tokens.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-teal shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-indigo font-semibold">Deterministic Rubrics:</strong> Evaluate compliance against programmatic schema assertions.
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-teal/30 bg-teal/10 p-4 text-xs font-mono">
              <div className="flex justify-between items-center text-indigo">
                <span>Production Preparedness:</span>
                <span className="text-teal font-bold">96% (Verified on edge-case suites)</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Curved Divider into Mint Band */}
      <CurvedDivider fillColor="text-mint" />
    </section>
  );
}
