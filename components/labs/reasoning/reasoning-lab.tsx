"use client";

import React, { useState, useEffect } from "react";
import { GitBranch, Terminal, Users, Sparkles, Activity, Trophy } from "lucide-react";
import { useProgress } from "@/lib/storage/progress";
import { TotVisualizer } from "./tot-visualizer";
import { ReactVisualizer } from "./react-visualizer";
import { ExpertVisualizer } from "./expert-visualizer";
import { ActivePromptingVisualizer } from "./active-prompting-visualizer";
import { ApeVisualizer } from "./ape-visualizer";
import { CURRICULUM_MODULES } from "@/content/modules";

export type ReasoningStrategyTab = "tot" | "react" | "expert" | "active" | "ape";

export function ReasoningLab() {
  const [activeTab, setActiveTab] = useState<ReasoningStrategyTab>("tot");
  const { completeLab } = useProgress();

  useEffect(() => {
    completeLab("reasoning");
  }, [completeLab]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <a
            href="/academy/mod-10"
            className="inline-flex items-center gap-1.5 rounded-full border border-ultramarine/30 bg-ultramarine/10 px-3 py-1 font-mono text-xs font-semibold text-ultramarine hover:bg-ultramarine/20 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Module 10: {CURRICULUM_MODULES.find((m) => m.number === 10)?.title}</span>
          </a>
          <span className="rounded border border-navy/20 bg-daylight px-2 py-0.5 font-mono text-[10px] text-navy/70 uppercase">
            Full Lab
          </span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-forge-text sm:text-4xl">
          Visual Reasoning Playground
        </h1>
        <p className="text-sm text-forge-muted max-w-3xl leading-relaxed">
          Explore structured reasoning architectures beyond basic zero-shot prompting.
          Inspect Tree-of-Thoughts (ToT) branching search, ReAct Thought-Action-Observation tool loops,
          Active Prompting via uncertainty sampling, Expert Persona Specialist Council evaluations, and Automatic Prompt Engineer (APE).
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex flex-wrap items-center gap-2 border-b border-forge-border pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("tot")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-semibold transition-all ${
            activeTab === "tot"
              ? "bg-cyan-500 text-navy shadow-lg"
              : "border border-forge-border bg-forge-surface text-forge-muted hover:text-forge-text"
          }`}
        >
          <GitBranch className="h-4 w-4" />
          <span>Tree-of-Thoughts (ToT)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("react")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-semibold transition-all ${
            activeTab === "react"
              ? "bg-ember-500 text-navy shadow-lg"
              : "border border-forge-border bg-forge-surface text-forge-muted hover:text-forge-text"
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>ReAct (Thought · Action · Observation)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("active")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-semibold transition-all ${
            activeTab === "active"
              ? "bg-ultramarine text-white shadow-lg"
              : "border border-forge-border bg-forge-surface text-forge-muted hover:text-forge-text"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>Active Prompting (Uncertainty)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("expert")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-semibold transition-all ${
            activeTab === "expert"
              ? "bg-purple-500 text-white shadow-lg"
              : "border border-forge-border bg-forge-surface text-forge-muted hover:text-forge-text"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Expert Prompting Council</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ape")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 font-mono text-xs font-semibold transition-all ${
            activeTab === "ape"
              ? "bg-marigold text-navy shadow-lg"
              : "border border-forge-border bg-forge-surface text-forge-muted hover:text-forge-text"
          }`}
        >
          <Trophy className="h-4 w-4" />
          <span>Automatic Prompt Engineer (APE)</span>
        </button>
      </div>

      {/* Active Tab View */}
      <div className="pt-2">
        {activeTab === "tot" && <TotVisualizer />}
        {activeTab === "react" && <ReactVisualizer />}
        {activeTab === "active" && <ActivePromptingVisualizer />}
        {activeTab === "expert" && <ExpertVisualizer />}
        {activeTab === "ape" && <ApeVisualizer />}
      </div>
    </div>
  );
}
