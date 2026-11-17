"use client";

import React, { useState, useEffect } from "react";
import { GitBranch, Terminal, Users, Sparkles } from "lucide-react";
import { useProgress } from "@/lib/storage/progress";
import { TotVisualizer } from "./tot-visualizer";
import { ReactVisualizer } from "./react-visualizer";
import { ExpertVisualizer } from "./expert-visualizer";

export type ReasoningStrategyTab = "tot" | "react" | "expert";

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
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ember-400">
          <Sparkles className="h-4 w-4" />
          <span>Module 4 · Deliberate Reasoning Studio</span>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-forge-text sm:text-4xl">
          Visual Reasoning Playground
        </h1>
        <p className="text-sm text-forge-muted max-w-3xl leading-relaxed">
          Explore structured reasoning architectures beyond basic zero-shot prompting.
          Inspect Tree-of-Thoughts branching search, ReAct Thought-Action-Observation tool loops,
          and Multi-Persona Specialist Council evaluations.
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
      </div>

      {/* Active Tab View */}
      <div className="pt-2">
        {activeTab === "tot" && <TotVisualizer />}
        {activeTab === "react" && <ReactVisualizer />}
        {activeTab === "expert" && <ExpertVisualizer />}
      </div>
    </div>
  );
}
