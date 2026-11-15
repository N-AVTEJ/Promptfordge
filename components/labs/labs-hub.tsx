"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Layers,
  Cpu,
  Terminal,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PromptPlayground } from "./playground";
import { PromptAnatomyLab } from "./prompt-anatomy";
import { LlmSimulatorLab } from "./llm-simulator";
import { CompareLab } from "./compare-lab";
import { OptimizeLab } from "./optimize-lab";

export type LabTab = "anatomy" | "simulator" | "playground" | "compare" | "optimize";

export function LabsHub() {
  const [activeTab, setActiveTab] = useState<LabTab>("anatomy");

  return (
    <div className="space-y-8">
      {/* Labs Hub Hero & Card Switchers */}
      <div className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ember-400">
            <Sparkles className="h-4 w-4" />
            <span>Interactive Visual Laboratories</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-forge-text sm:text-4xl">
            PromptForge Visual Labs
          </h1>
          <p className="text-sm text-forge-muted max-w-3xl leading-relaxed">
            Hands-on visualizers for understanding LLM architecture and prompt structure.
            Explore subword tokenization, vector geometry, multi-head attention routing, and strict architectural component decomposition.
          </p>
        </div>

        {/* 5 Interactive Lab Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 pt-2">
          {/* Card 1: Prompt Anatomy */}
          <div
            onClick={() => setActiveTab("anatomy")}
            className={`group cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between ${
              activeTab === "anatomy"
                ? "border-cyan-500 bg-cyan-950/20 shadow-lg ring-1 ring-cyan-500/50"
                : "border-forge-border bg-forge-surface hover:border-cyan-500/40 hover:bg-forge-surface/80"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 font-mono text-[10px]">
                  Module 2 · Anatomy
                </Badge>
                <Link
                  href="/labs/anatomy"
                  className="text-xs text-forge-muted hover:text-cyan-400 flex items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Standalone</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <h3 className="mt-3 text-lg font-bold text-forge-text group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span>Prompt Anatomy</span>
              </h3>
              <p className="mt-1.5 text-xs text-forge-muted leading-relaxed">
                Deconstruct prompts into Role, Task, Context, Examples, Constraints, and Output Format. Test A/B component variations live.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-forge-border/60 flex items-center justify-between text-xs font-mono">
              <span className="text-forge-muted">Rule-based + AI</span>
              <span className="text-cyan-400 font-bold">Open Visualizer →</span>
            </div>
          </div>

          {/* Card 2: LLM Simulator */}
          <div
            onClick={() => setActiveTab("simulator")}
            className={`group cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between ${
              activeTab === "simulator"
                ? "border-ember-500 bg-ember-950/20 shadow-lg ring-1 ring-ember-500/50"
                : "border-forge-border bg-forge-surface hover:border-ember-500/40 hover:bg-forge-surface/80"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-ember-500/40 text-ember-400 font-mono text-[10px]">
                  Module 1 · Transformers
                </Badge>
                <Link
                  href="/labs/llm-simulator"
                  className="text-xs text-forge-muted hover:text-ember-400 flex items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Standalone</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <h3 className="mt-3 text-lg font-bold text-forge-text group-hover:text-ember-400 transition-colors flex items-center gap-2">
                <Cpu className="h-4 w-4 text-ember-400" />
                <span>LLM Simulator</span>
              </h3>
              <p className="mt-1.5 text-xs text-forge-muted leading-relaxed">
                6-stage transformer simulator: BPE tokenization, vector embeddings, positional encoding, self-attention graph, and sampling.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-forge-border/60 flex items-center justify-between text-xs font-mono">
              <span className="text-forge-muted">Real BPE + Attention</span>
              <span className="text-ember-400 font-bold">Open Simulator →</span>
            </div>
          </div>

          {/* Card 3: Multi-Model Playground */}
          <div
            onClick={() => setActiveTab("playground")}
            className={`group cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between ${
              activeTab === "playground"
                ? "border-emerald-500 bg-emerald-950/20 shadow-lg ring-1 ring-emerald-500/50"
                : "border-forge-border bg-forge-surface hover:border-emerald-500/40 hover:bg-forge-surface/80"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 font-mono text-[10px]">
                  Engine · Multi-Adapter
                </Badge>
                <Link
                  href="/labs/playground"
                  className="text-xs text-forge-muted hover:text-emerald-400 flex items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Standalone</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <h3 className="mt-3 text-lg font-bold text-forge-text group-hover:text-emerald-400 transition-colors flex items-center gap-2">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span>Live Playground</span>
              </h3>
              <p className="mt-1.5 text-xs text-forge-muted leading-relaxed">
                Execute prompts against live Gemini & OpenAI providers with latency telemetry, LRU caching, and cost estimation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-forge-border/60 flex items-center justify-between text-xs font-mono">
              <span className="text-forge-muted">Gemini & OpenAI</span>
              <span className="text-emerald-400 font-bold">Open Workbench →</span>
            </div>
          </div>
          {/* Card 4: Technique Comparison Lab */}
          <div
            onClick={() => setActiveTab("compare")}
            className={`group cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between ${
              activeTab === "compare"
                ? "border-ember-500 bg-ember-950/20 shadow-lg ring-1 ring-ember-500/50"
                : "border-forge-border bg-forge-surface hover:border-ember-500/40 hover:bg-forge-surface/80"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-ember-500/40 text-ember-400 font-mono text-[10px]">
                  Module 4 · Comparison
                </Badge>
                <Link
                  href="/labs/compare"
                  className="text-xs text-forge-muted hover:text-ember-400 flex items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Standalone</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <h3 className="mt-3 text-lg font-bold text-forge-text group-hover:text-ember-400 transition-colors flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-ember-400" />
                <span>Technique Compare</span>
              </h3>
              <p className="mt-1.5 text-xs text-forge-muted leading-relaxed">
                Empirical multi-technique benchmarking. Run zero-shot to structured prompts with N-run spreads and independent metrics.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-forge-border/60 flex items-center justify-between text-xs font-mono">
              <span className="text-forge-muted">6 Techniques · Multi-Run</span>
              <span className="text-ember-400 font-bold">Open Compare →</span>
            </div>
          </div>
          {/* Card 5: Prompt Optimizer */}
          <div
            onClick={() => setActiveTab("optimize")}
            className={`group cursor-pointer rounded-xl border p-5 transition-all flex flex-col justify-between ${
              activeTab === "optimize"
                ? "border-amber-500 bg-amber-950/20 shadow-lg ring-1 ring-amber-500/50"
                : "border-forge-border bg-forge-surface hover:border-amber-500/40 hover:bg-forge-surface/80"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="border-amber-500/40 text-amber-300 font-mono text-[10px]">
                  Module 5 · Optimize
                </Badge>
                <Link
                  href="/labs/optimize"
                  className="text-xs text-forge-muted hover:text-amber-400 flex items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span>Standalone</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
              <h3 className="mt-3 text-lg font-bold text-forge-text group-hover:text-amber-400 transition-colors flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Prompt Optimizer</span>
              </h3>
              <p className="mt-1.5 text-xs text-forge-muted leading-relaxed">
                Diagnose weak prompts, inspect line diffs with pedagogical rationale, compare per-metric results, and save to library.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-forge-border/60 flex items-center justify-between text-xs font-mono">
              <span className="text-forge-muted">Diff & Versioning</span>
              <span className="text-amber-400 font-bold">Open Optimizer →</span>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded Active Lab View */}
      <div className="pt-4">
        {activeTab === "anatomy" && <PromptAnatomyLab />}
        {activeTab === "simulator" && <LlmSimulatorLab />}
        {activeTab === "playground" && <PromptPlayground />}
        {activeTab === "compare" && <CompareLab />}
        {activeTab === "optimize" && <OptimizeLab />}
      </div>
    </div>
  );
}
