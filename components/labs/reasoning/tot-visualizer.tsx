"use client";

import React, { useState, useMemo } from "react";
import {
  GitBranch,
  CheckCircle2,
  Sparkles,
  Info,
  ChevronRight,
  RotateCcw,
  Zap,
  Filter,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  TotTreeState,
  TotNode,
  TotNodeScores,
} from "@/lib/reasoning/types";
import {
  buildTreeOfThoughts,
  TOT_PRESETS,
  TOT_EDUCATIONAL_DISCLOSURE,
} from "@/lib/reasoning/tot-engine";

export function TotVisualizer() {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    TOT_PRESETS[0].id
  );
  const [customInput, setCustomInput] = useState<string>("");
  const [treeState, setTreeState] = useState<TotTreeState>(() =>
    buildTreeOfThoughts(TOT_PRESETS[0].problem, TOT_PRESETS[0].id)
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string>("tot-root");
  const [filterPruned, setFilterPruned] = useState(false);

  // Switch preset
  const handlePresetChange = (presetId: string) => {
    setSelectedPresetId(presetId);
    const p = TOT_PRESETS.find((x) => x.id === presetId);
    if (p) {
      const nextTree = buildTreeOfThoughts(p.problem, p.id);
      setTreeState(nextTree);
      setSelectedNodeId(nextTree.rootNodeId);
    }
  };

  // Run custom prompt
  const handleRunCustom = () => {
    if (!customInput.trim()) return;
    const nextTree = buildTreeOfThoughts(customInput.trim());
    setTreeState(nextTree);
    setSelectedNodeId(nextTree.rootNodeId);
  };

  const selectedNode: TotNode | undefined = treeState.nodes[selectedNodeId];

  // Organize nodes by depth for tree rendering
  const depthLevels = useMemo(() => {
    const levels: Record<number, TotNode[]> = { 0: [], 1: [], 2: [] };
    Object.values(treeState.nodes).forEach((n) => {
      if (filterPruned && n.status === "pruned") return;
      if (levels[n.depth]) {
        levels[n.depth].push(n);
      }
    });
    return levels;
  }, [treeState, filterPruned]);

  return (
    <div className="space-y-6">
      {/* Educational Simulation Disclosure Header */}
      <div className="flex items-start gap-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 p-4">
        <Info className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="text-xs font-mono text-cyan-200 leading-relaxed">
          <span className="font-bold text-cyan-300">
            [EDUCATIONAL SIMULATION / DELIBERATE REASONING]
          </span>{" "}
          {TOT_EDUCATIONAL_DISCLOSURE}
        </div>
      </div>

      {/* Preset Selector & Custom Input */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-forge-border bg-forge-surface p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono font-semibold text-forge-text flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              Reasoning Challenge Presets
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterPruned(!filterPruned)}
                className={`flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-mono border transition-colors ${
                  filterPruned
                    ? "border-amber-500/40 bg-amber-500/10 text-amber-300"
                    : "border-forge-border text-forge-muted hover:text-forge-text"
                }`}
              >
                <Filter className="h-3 w-3" />
                <span>{filterPruned ? "Hide Pruned (Active)" : "Show All"}</span>
              </button>
              <button
                type="button"
                onClick={() => handlePresetChange(selectedPresetId)}
                className="flex items-center gap-1 rounded border border-forge-border px-2 py-0.5 text-[11px] font-mono text-forge-muted hover:text-forge-text"
                title="Reset Tree"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {TOT_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetChange(p.id)}
                className={`text-left rounded-lg border p-3 transition-all ${
                  selectedPresetId === p.id
                    ? "border-ember-500 bg-ember-950/20 ring-1 ring-ember-500/50"
                    : "border-forge-border bg-[#0E121B] hover:border-white/[0.15]"
                }`}
              >
                <div className="font-mono text-xs font-bold text-forge-text mb-1">
                  {p.title}
                </div>
                <div className="text-[10px] text-forge-muted line-clamp-2 leading-relaxed">
                  {p.description}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-forge-border flex items-center gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Or enter a custom problem for tree search..."
              className="flex-1 rounded-md border border-white/[0.08] bg-[#0E121B] px-3 py-1.5 font-mono text-xs text-forge-text focus:border-cyan-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleRunCustom}
              disabled={!customInput.trim()}
              className="rounded-md bg-cyan-500 px-3 py-1.5 font-mono text-xs font-bold text-black hover:bg-cyan-400 disabled:opacity-50"
            >
              Search Tree
            </button>
          </div>
        </div>

        {/* Tree Telemetry Stats */}
        <div className="rounded-xl border border-forge-border bg-forge-surface p-4 flex flex-col justify-between">
          <div>
            <span className="text-xs font-mono font-semibold text-forge-text flex items-center gap-1.5 mb-3">
              <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
              Tree Search Metrics
            </span>
            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between text-forge-muted">
                <span>Candidate Thoughts:</span>
                <span className="text-forge-text font-bold">
                  {treeState.totalCandidateThoughts}
                </span>
              </div>
              <div className="flex justify-between text-forge-muted">
                <span>Search Depth:</span>
                <span className="text-forge-text font-bold">
                  {treeState.maxDepth} Levels
                </span>
              </div>
              <div className="flex justify-between text-forge-muted">
                <span>Evaluation Rubric:</span>
                <span className="text-cyan-400 font-bold">3 Independent</span>
              </div>
              <div className="flex justify-between text-forge-muted">
                <span>Optimal Leaf:</span>
                <span className="text-amber-400 font-bold">
                  {treeState.chosenLeafId || "Found"}
                </span>
              </div>
            </div>
          </div>
          <div className="pt-3 border-t border-forge-border text-[10px] font-mono text-forge-muted">
            The winning path is highlighted with molten amber borders and glowing connectors.
          </div>
        </div>
      </div>

      {/* Visual Branching Tree Grid */}
      <div className="rounded-xl border border-forge-border bg-[#0A0D14] p-5 shadow-2xl overflow-x-auto">
        <div className="min-w-[840px] space-y-8">
          {/* Depth 0: Root */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Level 0 · Root Objective
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-cyan-500/30 to-transparent" />
            </div>
            {depthLevels[0]?.map((node) => (
              <div
                key={node.id}
                onClick={() => setSelectedNodeId(node.id)}
                className={`cursor-pointer rounded-xl border p-4 transition-all ${
                  selectedNodeId === node.id
                    ? "border-cyan-400 bg-cyan-950/30 ring-1 ring-cyan-400"
                    : "border-cyan-500/40 bg-[#0E121B] hover:border-cyan-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-forge-text flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                    {node.title}
                  </span>
                  <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 font-mono text-[10px]">
                    Objective
                  </Badge>
                </div>
                <p className="mt-1 font-mono text-xs text-forge-muted leading-relaxed">
                  {node.thoughtSummary}
                </p>
              </div>
            ))}
          </div>

          {/* Depth 1: Level 1 Candidate Approaches */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs font-bold text-ember-400 uppercase tracking-wider">
                Level 1 · Candidate Approaches (Branching Factor: 3)
              </span>
              <div className="h-[1px] flex-1 bg-gradient-to-r from-ember-500/30 to-transparent" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {depthLevels[1]?.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isChosen = node.isChosenPath;
                const isPruned = node.status === "pruned";

                return (
                  <div
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                      isChosen
                        ? isSelected
                          ? "border-ember-400 bg-ember-950/30 ring-2 ring-ember-400 shadow-lg shadow-ember-950/50"
                          : "border-ember-500/70 bg-ember-950/20 ring-1 ring-ember-500/40"
                        : isPruned
                        ? "border-white/[0.06] bg-[#0E121B]/40 opacity-60 hover:opacity-100"
                        : isSelected
                        ? "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400"
                        : "border-forge-border bg-[#0E121B] hover:border-white/[0.15]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        {isChosen ? (
                          <Badge className="bg-ember-500 text-black font-mono text-[9px] font-bold">
                            ★ CHOSEN PATH
                          </Badge>
                        ) : isPruned ? (
                          <Badge variant="outline" className="border-rose-500/40 text-rose-400 font-mono text-[9px]">
                            PRUNED
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-forge-border text-forge-muted font-mono text-[9px]">
                            CANDIDATE
                          </Badge>
                        )}
                        <span className="font-mono text-[10px] text-forge-muted">
                          Depth 1
                        </span>
                      </div>
                      <div className="font-mono text-xs font-bold text-forge-text mb-1.5 leading-snug">
                        {node.title}
                      </div>
                      <p className="font-mono text-[11px] text-forge-muted leading-relaxed line-clamp-3">
                        {node.thoughtSummary}
                      </p>
                    </div>

                    {/* Independent Metric Scores */}
                    <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-forge-muted">Feasibility:</span>
                        <span className={node.scores.feasibility.score >= 4 ? "text-cyan-400 font-bold" : "text-forge-muted"}>
                          {node.scores.feasibility.score}/5
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-forge-muted">Soundness:</span>
                        <span className={node.scores.soundness.score >= 4 ? "text-emerald-400 font-bold" : "text-forge-muted"}>
                          {node.scores.soundness.score}/5
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-forge-muted">Completeness:</span>
                        <span className={node.scores.completeness.score >= 4 ? "text-purple-400 font-bold" : "text-forge-muted"}>
                          {node.scores.completeness.score}/5
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Depth 2: Level 2 Sub-paths */}
          {depthLevels[2] && depthLevels[2].length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="font-mono text-xs font-bold text-purple-400 uppercase tracking-wider">
                  Level 2 · Refinements & Execution Plan
                </span>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-purple-500/30 to-transparent" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {depthLevels[2]?.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const isChosen = node.isChosenPath;

                  return (
                    <div
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                        isChosen
                          ? isSelected
                            ? "border-ember-400 bg-ember-950/30 ring-2 ring-ember-400 shadow-lg shadow-ember-950/50"
                            : "border-ember-500/70 bg-ember-950/20 ring-1 ring-ember-500/40"
                          : isSelected
                          ? "border-cyan-400 bg-cyan-950/20 ring-1 ring-cyan-400"
                          : "border-forge-border bg-[#0E121B] hover:border-white/[0.15]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          {isChosen ? (
                            <Badge className="bg-ember-500 text-black font-mono text-[9px] font-bold">
                              ★ OPTIMAL LEAF
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="border-forge-border text-forge-muted font-mono text-[9px]">
                              ALTERNATIVE
                            </Badge>
                          )}
                          <span className="font-mono text-[10px] text-forge-muted">
                            Depth 2
                          </span>
                        </div>
                        <div className="font-mono text-xs font-bold text-forge-text mb-1.5">
                          {node.title}
                        </div>
                        <p className="font-mono text-[11px] text-forge-muted leading-relaxed">
                          {node.thoughtSummary}
                        </p>
                      </div>

                      {/* Independent Metric Scores */}
                      <div className="mt-3 pt-3 border-t border-white/[0.08] space-y-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-forge-muted">Feasibility:</span>
                          <span className="text-cyan-400 font-bold">
                            {node.scores.feasibility.score}/5
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-forge-muted">Soundness:</span>
                          <span className="text-emerald-400 font-bold">
                            {node.scores.soundness.score}/5
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-forge-muted">Completeness:</span>
                          <span className="text-purple-400 font-bold">
                            {node.scores.completeness.score}/5
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Selected Node Deep Inspector */}
      {selectedNode && (
        <div className="rounded-xl border border-forge-border bg-[#0E121B] p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-cyan-400 uppercase">
                Node Inspector:
              </span>
              <span className="font-mono text-sm font-bold text-forge-text">
                {selectedNode.title}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedNode.isChosenPath && (
                <span className="rounded bg-ember-500/20 px-2 py-0.5 font-mono text-[10px] text-ember-300 border border-ember-500/40">
                  On Chosen Optimal Path
                </span>
              )}
              <span className="font-mono text-xs text-forge-muted">
                Status: {selectedNode.status.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-forge-muted block mb-1">
                  Thought Summary & Strategic Logic
                </label>
                <div className="rounded border border-white/[0.06] bg-[#0A0D14] p-3 font-mono text-xs text-forge-text leading-relaxed whitespace-pre-wrap">
                  {selectedNode.thoughtSummary}
                </div>
              </div>
            </div>

            {/* Individual Non-Combined Score Breakdown */}
            <div className="space-y-3 border-l border-white/[0.08] pl-4">
              <label className="text-[10px] font-mono uppercase tracking-wider text-forge-muted block">
                Independent Metric Evaluation
              </label>

              {/* Feasibility */}
              <div className="rounded border border-white/[0.06] bg-[#0A0D14] p-2.5">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-forge-muted">Feasibility</span>
                  <span className="text-cyan-400 font-bold">
                    {selectedNode.scores.feasibility.score}/5
                  </span>
                </div>
                <p className="text-[10px] text-forge-muted leading-tight">
                  {selectedNode.scores.feasibility.reason}
                </p>
              </div>

              {/* Soundness */}
              <div className="rounded border border-white/[0.06] bg-[#0A0D14] p-2.5">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-forge-muted">Soundness</span>
                  <span className="text-emerald-400 font-bold">
                    {selectedNode.scores.soundness.score}/5
                  </span>
                </div>
                <p className="text-[10px] text-forge-muted leading-tight">
                  {selectedNode.scores.soundness.reason}
                </p>
              </div>

              {/* Completeness */}
              <div className="rounded border border-white/[0.06] bg-[#0A0D14] p-2.5">
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span className="text-forge-muted">Completeness</span>
                  <span className="text-purple-400 font-bold">
                    {selectedNode.scores.completeness.score}/5
                  </span>
                </div>
                <p className="text-[10px] text-forge-muted leading-tight">
                  {selectedNode.scores.completeness.reason}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
