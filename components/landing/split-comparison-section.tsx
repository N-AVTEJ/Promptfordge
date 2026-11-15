"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  FlaskConical,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { fadeUpVariants, fadeUpReducedVariants } from "@/lib/motion";

export function SplitComparisonSection() {
  const prefersReduced = useReducedMotion();
  const [activeTab, setActiveTab] = useState<"naive" | "engineered">("engineered");

  const activeVariant = prefersReduced ? fadeUpReducedVariants : fadeUpVariants;

  return (
    <section className="relative overflow-hidden py-20 sm:py-28 bg-[#090A0D] border-t border-white/[0.06]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs font-semibold text-amber-400 shadow-[0_0_15px_rgba(255,107,0,0.15)]">
            <FlaskConical className="h-3.5 w-3.5 text-ember-500" />
            <span>Pedagogical Methodology</span>
          </div>
          <h2 className="mt-4 font-mono text-2xl font-extrabold tracking-tight text-forge-text sm:text-4xl">
            Experiment, Don&apos;t Watch
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
            Video tutorials give an illusion of competence. Only turning knobs on
            temperature, token limits, and delimiter boundaries builds real muscle memory.
          </p>
        </div>

        {/* Split Comparison Cards */}
        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {/* LEFT: Watching a video (Passive) */}
          <motion.div
            variants={activeVariant}
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="relative flex flex-col justify-between rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#111319] to-[#08090C] p-6 sm:p-7 shadow-xl"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] bg-[#13151A] text-zinc-400">
                    <Play className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500 block">
                      Passive spectator mode
                    </span>
                    <h3 className="font-mono text-base font-semibold text-zinc-200">
                      Watching a Video
                    </h3>
                  </div>
                </div>
                <span className="rounded border border-red-500/30 bg-red-500/10 px-2 py-0.5 font-mono text-[10px] text-red-400 font-semibold">
                  Passive
                </span>
              </div>

              {/* Passive Player Simulation */}
              <div className="mt-5 rounded-lg border border-white/[0.06] bg-[#08090C] p-3">
                <div className="relative aspect-video w-full rounded bg-[#050608] flex flex-col items-center justify-center border border-white/[0.04]">
                  <div className="h-10 w-10 rounded-full border border-white/[0.1] bg-white/[0.04] flex items-center justify-center text-forge-muted">
                    <Play className="h-4 w-4 ml-0.5" />
                  </div>
                  <span className="mt-2.5 font-mono text-[11px] text-forge-muted">
                    &quot;10 Prompt Hacks in 2026&quot; (48:12)
                  </span>
                  {/* Scrub bar */}
                  <div className="absolute bottom-3 left-4 right-4 h-1 rounded-full bg-white/[0.08]">
                    <div className="h-full w-1/3 bg-white/[0.25] rounded-full" />
                  </div>
                </div>
              </div>

              {/* Critique Breakdown */}
              <div className="mt-5 space-y-2.5 font-mono text-xs text-forge-muted">
                <div className="flex items-start gap-2">
                  <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-forge-text">Illusion of Competence:</strong> Nodding along to curated demos hides real failure modes.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-forge-text">Rapid Retention Decay:</strong> Most passively watched advice fades within 48 hours.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <XCircle className="h-3.5 w-3.5 text-red-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-forge-text">Zero Telemetry:</strong> No visibility into token distributions or latency trade-offs.
                  </span>
                </div>
              </div>
            </div>

            {/* Metric pill */}
            <div className="mt-6 rounded-md border border-white/[0.06] bg-[#08090C] p-3 font-mono text-xs">
              <div className="flex justify-between items-center text-forge-muted">
                <span>Production Preparedness:</span>
                <span className="text-red-400 font-semibold">14% (Fails on edge cases)</span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Running the experiment (Active Forge) */}
          <motion.div
            variants={activeVariant}
            initial={false}
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            className="relative flex flex-col justify-between rounded-xl border border-amber-500/40 bg-gradient-to-b from-[#151926] via-[#0E1119] to-[#08090C] p-6 sm:p-7 shadow-[0_0_35px_rgba(255,107,0,0.18)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/50 before:to-transparent"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md border border-ember-500/40 bg-ember-500/10 text-amber-400 shadow-[0_0_12px_rgba(255,107,0,0.2)]">
                    <FlaskConical className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-amber-400 font-semibold block">
                      Practitioner sandbox mode
                    </span>
                    <h3 className="font-mono text-base font-semibold text-white">
                      Running the Experiment
                    </h3>
                  </div>
                </div>
                <span className="rounded border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-0.5 font-mono text-[10px] text-cyan-300 font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
                  <Zap className="h-2.5 w-2.5 text-cyan-400 fill-cyan-400" /> Live Lab
                </span>
              </div>

              {/* Mini Side-by-Side Output Card */}
              <div className="mt-5 rounded-lg border border-white/[0.08] bg-[#08090C] p-3.5">
                {/* Tab switch */}
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setActiveTab("naive")}
                      className={`rounded px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                        activeTab === "naive"
                          ? "bg-red-500/20 text-red-300 border border-red-500/30"
                          : "text-forge-muted hover:text-forge-text"
                      }`}
                    >
                      Prompt A: Naive
                    </button>
                    <button
                      onClick={() => setActiveTab("engineered")}
                      className={`rounded px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                        activeTab === "engineered"
                          ? "bg-ember-500/20 text-ember-400 border border-ember-500/30"
                          : "text-forge-muted hover:text-forge-text"
                      }`}
                    >
                      Prompt B: Forged
                    </button>
                  </div>
                  <span className="font-mono text-[10px] text-cyan-400">
                    Live Diff Telemetry
                  </span>
                </div>

                {/* Card output simulation */}
                <div className="mt-3 font-mono text-xs">
                  {activeTab === "naive" ? (
                    <div className="space-y-2">
                      <div className="rounded border border-red-500/20 bg-red-950/20 p-2 text-forge-text">
                        <span className="text-red-400 font-bold block text-[10px] mb-0.5">PROMPT:</span>
                        &quot;Extract customer names and amounts from this email, hurry.&quot;
                      </div>
                      <div className="rounded border border-white/[0.06] bg-[#040507] p-2 text-forge-muted">
                        <span className="text-forge-subtle font-bold block text-[10px] mb-0.5">COMPLETION:</span>
                        &quot;Here are the names: Alice spent around $40. Bob bought something too!&quot;
                        <div className="mt-1.5 text-[10px] text-red-400 flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Failed JSON parse · Conversational preamble
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="rounded border border-ember-500/20 bg-ember-950/20 p-2 text-forge-text">
                        <span className="text-ember-400 font-bold block text-[10px] mb-0.5">DELIMITED PROMPT:</span>
                        &lt;instruction&gt;Extract orders to JSON: &#123;customer: str, amount_cents: int&#125;. No preamble.&lt;/instruction&gt;
                      </div>
                      <div className="rounded border border-cyan-500/30 bg-[#040507] p-2 text-cyan-300">
                        <span className="text-cyan-400 font-bold block text-[10px] mb-0.5">OUTPUT TELEMETRY:</span>
                        &#123;&quot;orders&quot;: [&#123;&quot;customer&quot;: &quot;Alice&quot;, &quot;amount_cents&quot;: 4250&#125;]&#125;
                        <div className="mt-1.5 text-[10px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" /> Validated Zod schema · Deterministic 0-shot
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Practitioner Benefits */}
              <div className="mt-5 space-y-2.5 font-mono text-xs text-forge-muted">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-forge-text">Real Feedback Loop:</strong> Adjust delimiters and see latency shifts in real-time.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-forge-text">High-Retention Mastery:</strong> 92% retention rate through hands-on failure recovery.
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-forge-text">Production Invariants:</strong> Real assertions you can export directly to CI/CD suites.
                  </span>
                </div>
              </div>
            </div>

            {/* Metric pill */}
            <div className="mt-6 rounded-md border border-ember-500/30 bg-ember-500/[0.06] p-3 font-mono text-xs">
              <div className="flex justify-between items-center text-forge-text">
                <span className="text-ember-400 font-semibold">Production Reliability:</span>
                <span className="text-emerald-400 font-semibold">99.8% (Deterministic Schema Gate)</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
