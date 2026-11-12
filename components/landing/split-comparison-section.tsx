"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Play, FlaskConical, CheckCircle2, XCircle, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { fadeUpVariants, fadeUpReducedVariants } from "@/lib/motion";

export function SplitComparisonSection() {
  const prefersReduced = useReducedMotion();
  const [activeTab, setActiveTab] = useState<"naive" | "engineered">(
    "engineered"
  );

  const activeVariant = prefersReduced ? fadeUpReducedVariants : fadeUpVariants;

  return (
    <section className="relative overflow-hidden border-t border-forge-border/40 bg-forge-950 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Badge
            variant="outline"
            className="border-ember-500/40 bg-ember-500/10 font-mono text-xs text-ember-400"
          >
            ACTIVE LAB METHODOLOGY
          </Badge>
          <h2 className="mt-4 font-mono text-3xl font-extrabold tracking-tight text-forge-text sm:text-5xl">
            Experiment, Don&apos;t Watch.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-forge-muted sm:text-lg">
            Video tutorials give you the illusion of competence. Only turning
            knobs on temperature, token limits, and delimiter boundaries builds
            muscle memory.
          </p>
        </div>

        {/* Split Comparison Cards */}
        <div className="mt-16 grid gap-8 lg:grid-cols-2">
          {/* LEFT: Watching a video (Passive) */}
          <motion.div
            variants={activeVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="bg-forge-900/60 relative flex flex-col justify-between rounded-2xl border border-forge-border p-6 opacity-80 transition-opacity hover:opacity-100 sm:p-8"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-forge-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-forge-border bg-forge-surface text-forge-muted">
                    <Play className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-forge-muted">
                      Passive Spectator Mode
                    </span>
                    <h3 className="font-mono text-lg font-bold text-forge-text">
                      Watching a Video
                    </h3>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-red-500/40 font-mono text-xs text-red-400"
                >
                  <XCircle className="mr-1 h-3 w-3" /> Passive
                </Badge>
              </div>

              {/* Passive Player Simulation */}
              <div className="mt-6 rounded-xl border border-forge-border/80 bg-forge-surface/80 p-4">
                <div className="relative flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-forge-border/40 bg-forge-950">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-forge-border bg-forge-surface/60 text-forge-muted">
                    <Play className="ml-0.5 h-5 w-5" />
                  </div>
                  <span className="mt-3 font-mono text-xs text-forge-muted">
                    &quot;10 Prompt Hacks You Must Know in 2026&quot; (48:12)
                  </span>
                  {/* Fake Scrub bar */}
                  <div className="absolute bottom-3 left-4 right-4 h-1 rounded-full bg-forge-border">
                    <div className="h-full w-1/3 rounded-full bg-forge-muted/60" />
                  </div>
                </div>
              </div>

              {/* Critique Breakdown */}
              <div className="mt-6 space-y-3 font-mono text-xs text-forge-muted">
                <div className="flex items-start gap-2.5">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <span>
                    <strong className="text-forge-text">
                      Illusion of Competence:
                    </strong>{" "}
                    Nodding along to a curated demo hides edge case failures.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <span>
                    <strong className="text-forge-text">
                      Retention Decay:
                    </strong>{" "}
                    88% of passively watched prompt advice is forgotten within
                    48 hours.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                  <span>
                    <strong className="text-forge-text">Zero Telemetry:</strong>{" "}
                    You never see token distributions, latency spikes, or logit
                    entropy.
                  </span>
                </div>
              </div>
            </div>

            {/* Metric pill */}
            <div className="mt-8 rounded-xl border border-forge-border bg-forge-surface/60 p-4 font-mono text-xs">
              <div className="flex items-center justify-between text-forge-muted">
                <span>Production Preparedness:</span>
                <span className="font-bold text-red-400">
                  14% (Fails on edge cases)
                </span>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Running the experiment (Active Forge) */}
          <motion.div
            variants={activeVariant}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="bg-forge-900/90 relative flex flex-col justify-between rounded-2xl border-2 border-ember-500/50 p-6 shadow-[0_0_35px_rgba(255,107,0,0.12)] backdrop-blur-md sm:p-8"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-forge-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-ember-500/40 bg-ember-500/10 text-ember-400">
                    <FlaskConical className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-ember-400">
                      Practitioner Sandbox Mode
                    </span>
                    <h3 className="font-mono text-lg font-bold text-forge-text">
                      Running the Experiment
                    </h3>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="border-cyan-500/40 font-mono text-xs text-cyan-400"
                >
                  <Zap className="mr-1 h-3 w-3" /> Live Lab
                </Badge>
              </div>

              {/* Mini Side-by-Side Output Card (Comes alive on scroll) */}
              <div className="mt-6 rounded-xl border border-forge-border bg-forge-surface p-4">
                {/* Tab switch */}
                <div className="flex items-center justify-between border-b border-forge-border/60 pb-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveTab("naive")}
                      className={`rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors ${
                        activeTab === "naive"
                          ? "border border-red-500/40 bg-red-500/20 text-red-300"
                          : "text-forge-muted hover:text-forge-text"
                      }`}
                    >
                      Prompt A: Naive
                    </button>
                    <button
                      onClick={() => setActiveTab("engineered")}
                      className={`rounded px-2.5 py-1 font-mono text-xs font-semibold transition-colors ${
                        activeTab === "engineered"
                          ? "border border-ember-500/40 bg-ember-500/20 text-ember-400"
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
                <div className="mt-4 font-mono text-xs">
                  {activeTab === "naive" ? (
                    <div className="space-y-2">
                      <div className="rounded border border-red-500/30 bg-red-950/20 p-2.5 text-forge-text">
                        <span className="mb-1 block font-bold text-red-400">
                          PROMPT:
                        </span>
                        &quot;Extract all customer names and order amounts from
                        this email, hurry.&quot;
                      </div>
                      <div className="rounded border border-forge-border/60 bg-forge-950 p-2.5 text-forge-muted">
                        <span className="mb-1 block font-bold text-forge-muted">
                          MODEL OUTPUT:
                        </span>
                        &quot;Here are the names I found: Alice spent around
                        $40. Bob also bought something but the amount
                        wasn&apos;t specified! Hope this helps!&quot;
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-red-400">
                          <XCircle className="h-3 w-3" /> Failed JSON parse ·
                          Hallucinated conversational preamble
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="bg-ember-950/20 rounded border border-ember-500/30 p-2.5 text-forge-text">
                        <span className="mb-1 block font-bold text-ember-400">
                          SYSTEM DELIMITED PROMPT:
                        </span>
                        &lt;instruction&gt;Extract orders into JSON schema:
                        &#123;customer: str, amount_cents: int&#125;. No
                        preamble.&lt;/instruction&gt;
                      </div>
                      <div className="rounded border border-cyan-500/40 bg-forge-950 p-2.5 text-cyan-300">
                        <span className="mb-1 block font-bold text-cyan-400">
                          STRUCTURED TELEMETRY:
                        </span>
                        &#123;&quot;orders&quot;: [&#123;&quot;customer&quot;:
                        &quot;Alice&quot;, &quot;amount_cents&quot;: 4250&#125;,
                        &#123;&quot;customer&quot;: &quot;Bob&quot;,
                        &quot;amount_cents&quot;: null&#125;]&#125;
                        <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" /> Validated Zod
                          schema · Deterministic 0-shot conversion
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Practitioner Benefits */}
              <div className="mt-6 space-y-3 font-mono text-xs text-forge-muted">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong className="text-forge-text">
                      Immediate Feedback Loop:
                    </strong>{" "}
                    Edit delimiters, adjust top-p, see token latency shift in
                    real-time.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong className="text-forge-text">
                      High-Retention Mastery:
                    </strong>{" "}
                    92% retention rate through hands-on failure recovery.
                  </span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong className="text-forge-text">
                      Zero Secret Backends:
                    </strong>{" "}
                    Real deterministic evaluation assertions you can ship to
                    CI/CD.
                  </span>
                </div>
              </div>
            </div>

            {/* Metric pill */}
            <div className="mt-8 rounded-xl border border-ember-500/40 bg-ember-500/10 p-4 font-mono text-xs">
              <div className="flex items-center justify-between text-forge-text">
                <span className="font-bold text-ember-400">
                  Production Reliability:
                </span>
                <span className="font-bold text-emerald-400">
                  99.8% (Deterministic Schema Gate)
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
