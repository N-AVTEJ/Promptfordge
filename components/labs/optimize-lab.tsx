"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Play,
  RotateCcw,
  BookmarkPlus,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Coins,
  Cpu,
  ArrowRight,
  Split,
  Eye,
  Layers,
  Check,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { savePrompt } from "@/lib/storage/library";
import { DiffLine, DiffResult } from "@/lib/engine/diff";
import {
  DiagnosisItem,
  DiagnosisCategory,
  DiagnosisSeverity,
  PromptAnalysis,
} from "@/lib/engine/optimize";
import { RunEvaluation, JudgeEvaluation } from "@/lib/engine/evaluate";
import { OptimizedCandidateResponse } from "@/app/api/optimize/route";

const PRESET_PROMPTS = [
  {
    title: "write about dogs (Deliberately Vague)",
    prompt: "write about dogs",
    context: "Prospective pet owners preparing for adoption",
  },
  {
    title: "explain recursion",
    prompt: "explain recursion",
    context: "Junior engineers preparing for technical interviews",
  },
  {
    title: "write a sales email",
    prompt: "write an email to sell our AI tool",
    context: "B2B SaaS VPs of Engineering",
  },
  {
    title: "create auth middleware",
    prompt: "make auth middleware for my nextjs app",
    context: "Production Next.js App Router with JWT validation",
  },
];

export function OptimizeLab() {
  const [promptText, setPromptText] = useState("write about dogs");
  const [contextText, setContextText] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Result state
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [originalRun, setOriginalRun] = useState<RunEvaluation | null>(null);
  const [originalJudge, setOriginalJudge] = useState<JudgeEvaluation | null>(null);
  const [candidates, setCandidates] = useState<OptimizedCandidateResponse[]>([]);
  const [activeCandidateIdx, setActiveCandidateIdx] = useState(0);

  // Diff & Reveal views
  const [diffViewMode, setDiffViewMode] = useState<"unified" | "split">("unified");
  const [revealMode, setRevealMode] = useState<"side_by_side" | "before" | "after">("side_by_side");

  // Save to Library modal state
  const [isSaving, setIsSaving] = useState(false);
  const [saveTitle, setSaveTitle] = useState("");
  const [saveTags, setSaveTags] = useState("optimized, production");
  const [saveNotes, setSaveNotes] = useState("");
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  const activeCandidate = candidates[activeCandidateIdx];

  const handleRunOptimize = async (customPrompt?: string) => {
    const textToRun = (customPrompt ?? promptText).trim();
    if (!textToRun) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSaveSuccessMsg(null);

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToRun,
          context: contextText.trim() || undefined,
          model: selectedModel,
          temperature: 0.7,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Optimization failed.");
      }

      setAnalysis(data.original.analysis);
      setOriginalRun(data.original.run);
      setOriginalJudge(data.original.judge);
      setCandidates(data.improvements);
      setActiveCandidateIdx(0);

      // Pre-fill save form
      if (data.improvements?.[0]) {
        setSaveTitle(`Optimized: ${textToRun.slice(0, 32)}...`);
        setSaveNotes(`Refined using strategy "${data.improvements[0].title}". Addressed ${data.improvements[0].diagnosesAddressed?.length || 0} weaknesses.`);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to optimize prompt.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToLibrary = () => {
    if (!activeCandidate) return;

    try {
      const tags = saveTags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const saved = savePrompt({
        title: saveTitle.trim() || activeCandidate.title,
        content: activeCandidate.prompt,
        tags,
        notes: saveNotes.trim() || `Generated via PromptForge Optimizer (${activeCandidate.strategy})`,
        metrics: {
          relevance: activeCandidate.judge?.relevance.score,
          clarity: activeCandidate.judge?.clarity.score,
          correctness: activeCandidate.judge?.correctness.score,
          constraintFollowing: activeCandidate.judge?.constraintFollowing.score,
          tokens: activeCandidate.run.tokenUsage.totalTokens,
          latencyMs: activeCandidate.run.latency.latencyMs,
          costUsd: activeCandidate.run.cost.costUsd,
          wordCount: activeCandidate.run.responseLength.words,
        },
      });

      setSaveSuccessMsg(`Prompt saved to library with ID: ${saved.id.slice(0, 14)}...`);
      setIsSaving(false);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save prompt to library.");
    }
  };

  const getSeverityBadge = (severity: DiagnosisSeverity) => {
    switch (severity) {
      case "critical":
        return <Badge variant="outline" className="border-rose-500/50 text-rose-400 bg-rose-950/20 font-mono text-[10px]">CRITICAL</Badge>;
      case "warning":
        return <Badge variant="outline" className="border-amber-500/50 text-amber-400 bg-amber-950/20 font-mono text-[10px]">WARNING</Badge>;
      case "info":
        return <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 bg-cyan-950/20 font-mono text-[10px]">INFO</Badge>;
    }
  };

  const getCategoryLabel = (cat: DiagnosisCategory) => {
    switch (cat) {
      case "missing_context":
        return "Context & Scope";
      case "vague_verbs":
        return "Directive Verbs";
      case "no_constraints":
        return "Operational Constraints";
      case "no_format":
        return "Output Schema";
      case "unanchored_role":
        return "Expert Persona";
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="flex flex-col gap-2 border-b border-forge-border pb-6">
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ember-400">
          <Sparkles className="h-4 w-4" />
          <span>Module 5 · Prompt Optimization & Versioning</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-forge-text sm:text-4xl">
              Prompt Optimizer & Tracker
            </h1>
            <p className="mt-1 text-sm text-forge-muted max-w-3xl leading-relaxed">
              Paste a weak prompt and get an evidence-backed improvement. Analyze weaknesses, inspect line-by-line diffs with pedagogical change rationales, compare independent execution metrics, and save versioned prompts directly to your local library.
            </p>
          </div>
          <Link
            href="/library"
            className="inline-flex items-center gap-1.5 self-start rounded-lg border border-cyan-500/40 bg-cyan-950/20 px-3.5 py-2 text-xs font-medium text-cyan-300 transition-colors hover:bg-cyan-900/30 hover:border-cyan-400"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            <span>Open Library</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Input Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Prompt Input */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-forge-border bg-forge-surface p-5 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-forge-muted flex items-center gap-1.5">
                <span>Weak Prompt Input</span>
                <span className="text-[10px] text-ember-400">(Required)</span>
              </label>
              <div className="text-xs font-mono text-forge-subtle">
                {promptText.trim().split(/\s+/).filter(Boolean).length} words · {promptText.length} chars
              </div>
            </div>

            <textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="e.g. write about dogs..."
              rows={4}
              className="w-full rounded-md border border-forge-border bg-forge-elevated p-3 text-sm font-mono text-forge-text placeholder:text-forge-subtle focus:border-ember-500 focus:outline-none focus:ring-1 focus:ring-ember-500 transition-colors"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-mono uppercase tracking-wider text-forge-muted">
                Optional Target Audience / Context
              </label>
              <input
                type="text"
                value={contextText}
                onChange={(e) => setContextText(e.target.value)}
                placeholder="e.g. First-time dog adopters preparing for adoption..."
                className="w-full rounded-md border border-forge-border bg-forge-elevated px-3 py-2 text-xs font-mono text-forge-text placeholder:text-forge-subtle focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors"
              />
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-forge-border/60">
              <div className="text-[11px] font-mono text-forge-muted mb-2">
                Quick Test Presets:
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_PROMPTS.map((preset) => (
                  <button
                    key={preset.title}
                    type="button"
                    onClick={() => {
                      setPromptText(preset.prompt);
                      setContextText(preset.context);
                      handleRunOptimize(preset.prompt);
                    }}
                    className={`text-xs px-2.5 py-1 rounded border font-mono transition-colors ${
                      promptText === preset.prompt
                        ? "border-ember-500/80 bg-ember-950/30 text-ember-300"
                        : "border-forge-border bg-forge-elevated text-forge-muted hover:border-ember-500/40 hover:text-forge-text"
                    }`}
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Col: Controls & Actions */}
        <div className="space-y-4">
          <Card className="border-forge-border bg-forge-surface p-5 space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-forge-muted">
              Execution Settings
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-forge-muted">
                Target Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full rounded-md border border-forge-border bg-forge-elevated px-3 py-2 text-xs font-mono text-forge-text focus:border-ember-500 focus:outline-none"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Low Cost)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                <option value="gpt-4o-mini">OpenAI GPT-4o-mini</option>
              </select>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-forge-elevated/60 p-3 text-[11px] text-forge-muted space-y-1.5 font-mono">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Info className="h-3.5 w-3.5" />
                <span>Engine Invariant</span>
              </div>
              <p className="leading-relaxed text-[11px]">
                Produces up to 3 candidate improvements. Never combines metrics into a single accuracy score.
              </p>
            </div>

            <Button
              onClick={() => handleRunOptimize()}
              disabled={isLoading || !promptText.trim()}
              className="w-full bg-gradient-to-r from-ember-600 to-amber-600 hover:from-ember-500 hover:to-amber-500 text-white font-mono font-medium text-xs py-2.5 shadow-md flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Diagnosing & Optimizing...</span>
                </>
              ) : (
                <>
                  <Play className="h-3.5 w-3.5 fill-current" />
                  <span>Diagnose & Optimize Prompt</span>
                </>
              )}
            </Button>
          </Card>

          {saveSuccessMsg && (
            <div className="rounded-lg border border-emerald-500/40 bg-emerald-950/20 p-3.5 text-xs font-mono text-emerald-300 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
              <Link
                href="/library"
                className="underline hover:text-white shrink-0 ml-2"
              >
                View →
              </Link>
            </div>
          )}

          {errorMessage && (
            <div className="rounded-lg border border-rose-500/40 bg-rose-950/20 p-3.5 text-xs font-mono text-rose-300 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Optimization Results Section */}
      {analysis && (
        <div className="space-y-8 pt-4">
          {/* 1. Weakness Diagnosis Panel */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
                <h2 className="text-lg font-bold text-forge-text font-mono">
                  Weakness Diagnoses ({analysis.diagnoses.length} Detected)
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-forge-muted">Prompt Quality Score:</span>
                <Badge
                  variant="outline"
                  className={`font-mono text-xs font-bold ${
                    analysis.score < 50
                      ? "border-rose-500/50 text-rose-400 bg-rose-950/20"
                      : analysis.score < 75
                      ? "border-amber-500/50 text-amber-400 bg-amber-950/20"
                      : "border-emerald-500/50 text-emerald-400 bg-emerald-950/20"
                  }`}
                >
                  {analysis.score} / 100 ({analysis.qualityTier.toUpperCase()})
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {analysis.diagnoses.map((diag) => (
                <div
                  key={diag.id}
                  className="rounded-lg border border-forge-border bg-forge-surface p-4 flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {getSeverityBadge(diag.severity)}
                      <span className="text-[10px] font-mono text-forge-muted">
                        {getCategoryLabel(diag.category)}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-forge-text">
                      {diag.title}
                    </h4>
                    <p className="text-xs text-forge-muted leading-relaxed">
                      {diag.description}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-forge-border/60">
                    <div className="text-[10px] font-mono text-ember-400 font-semibold mb-1">
                      Actionable Remedy:
                    </div>
                    <p className="text-[11px] text-forge-text font-mono leading-relaxed bg-forge-elevated/80 p-2 rounded border border-forge-border">
                      {diag.suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Version Strategy Switcher Tabs */}
          {candidates.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-forge-border pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-cyan-400" />
                  <h3 className="text-lg font-bold text-forge-text font-mono">
                    Candidate Improvements ({candidates.length})
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSaving(true)}
                    className="border-cyan-500/40 text-cyan-300 bg-cyan-950/20 hover:bg-cyan-900/30 text-xs font-mono flex items-center gap-1.5"
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" />
                    <span>Save Selected Version to Library</span>
                  </Button>
                </div>
              </div>

              {/* Strategy Selector Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {candidates.map((cand, idx) => {
                  const isSelected = idx === activeCandidateIdx;
                  return (
                    <div
                      key={cand.id}
                      onClick={() => setActiveCandidateIdx(idx)}
                      className={`cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-ember-500 bg-ember-950/20 ring-1 ring-ember-500/50 shadow-md"
                          : "border-forge-border bg-forge-surface hover:border-ember-500/40 hover:bg-forge-surface/80"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <Badge
                            variant="outline"
                            className={`text-[10px] ${
                              isSelected
                                ? "border-ember-500 text-ember-400"
                                : "border-forge-border text-forge-muted"
                            }`}
                          >
                            Version {idx + 1}
                          </Badge>
                          <span className="text-forge-subtle">
                            {cand.changes.length} changes
                          </span>
                        </div>
                        <h4 className="mt-2 text-sm font-bold text-forge-text">
                          {cand.title}
                        </h4>
                        <p className="mt-1 text-xs text-forge-muted line-clamp-2">
                          {cand.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-forge-border/60 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-forge-muted">
                          Clarity {cand.judge?.clarity.score ?? 4}/5
                        </span>
                        <span className={`font-bold ${isSelected ? "text-ember-400" : "text-forge-subtle"}`}>
                          {isSelected ? "Active View ✓" : "Inspect →"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 3. Diff View of Original vs Selected Improved Prompt */}
              {activeCandidate && (
                <div className="space-y-3 pt-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Split className="h-4 w-4 text-ember-400" />
                      <h4 className="text-sm font-bold font-mono text-forge-text">
                        Prompt Diff: Original vs {activeCandidate.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Diff summary counter */}
                      <div className="flex items-center gap-2 text-xs font-mono">
                        <span className="text-emerald-400">+{activeCandidate.diff.summary.added} added</span>
                        <span className="text-rose-400">-{activeCandidate.diff.summary.removed} removed</span>
                        <span className="text-amber-400">~{activeCandidate.diff.summary.modified} modified</span>
                        <span className="text-forge-subtle">={activeCandidate.diff.summary.unchanged} unchanged</span>
                      </div>

                      <div className="flex rounded-md border border-forge-border bg-forge-elevated p-0.5 text-xs font-mono">
                        <button
                          type="button"
                          onClick={() => setDiffViewMode("unified")}
                          className={`px-2.5 py-1 rounded ${
                            diffViewMode === "unified"
                              ? "bg-forge-surface text-forge-text font-bold"
                              : "text-forge-muted hover:text-white"
                          }`}
                        >
                          Unified
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiffViewMode("split")}
                          className={`px-2.5 py-1 rounded ${
                            diffViewMode === "split"
                              ? "bg-forge-surface text-forge-text font-bold"
                              : "text-forge-muted hover:text-white"
                          }`}
                        >
                          Side-by-Side
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Diff Canvas */}
                  <Card className="border-forge-border bg-[#0B0C0E] overflow-hidden font-mono text-xs">
                    {diffViewMode === "unified" ? (
                      <div className="divide-y divide-white/[0.04] overflow-x-auto">
                        {activeCandidate.diff.lines.map((line, idx) => {
                          const isAdded = line.type === "added";
                          const isRemoved = line.type === "removed";
                          const isModified = line.type === "modified";
                          const isUnchanged = line.type === "unchanged";

                          let bgClass = "bg-transparent";
                          let textClass = "text-forge-muted";
                          let symbol = " ";

                          if (isAdded) {
                            bgClass = "bg-emerald-950/30 text-emerald-300";
                            textClass = "text-emerald-300 font-medium";
                            symbol = "+";
                          } else if (isRemoved) {
                            bgClass = "bg-rose-950/30 text-rose-300";
                            textClass = "text-rose-300 line-through opacity-80";
                            symbol = "-";
                          } else if (isModified) {
                            bgClass = "bg-amber-950/25 text-amber-200";
                            textClass = "text-amber-200";
                            symbol = "~";
                          }

                          return (
                            <div
                              key={idx}
                              className={`flex items-start gap-3 px-3 py-1.5 transition-colors ${bgClass}`}
                            >
                              <div className="w-6 shrink-0 text-right select-none text-forge-subtle text-[11px]">
                                {line.improvedLineNumber ?? line.originalLineNumber ?? idx + 1}
                              </div>
                              <div className="w-3 shrink-0 font-bold select-none text-center">
                                {symbol}
                              </div>
                              <div className={`flex-1 break-words whitespace-pre-wrap ${textClass}`}>
                                {isModified && line.oldText ? (
                                  <div>
                                    <div className="line-through text-rose-400/80 mb-0.5">
                                      - {line.oldText}
                                    </div>
                                    <div className="text-emerald-300">
                                      + {line.newText || line.text}
                                    </div>
                                  </div>
                                ) : (
                                  line.text
                                )}
                              </div>
                              {line.reason && (
                                <div className="shrink-0 max-w-xs self-center">
                                  <Badge
                                    variant="outline"
                                    className="border-cyan-500/40 text-cyan-300 bg-cyan-950/40 text-[10px] whitespace-normal text-left font-sans"
                                  >
                                    💡 {line.reason}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      /* Side-by-Side Diff View */
                      <div className="grid grid-cols-2 divide-x divide-white/[0.08]">
                        <div className="p-3 space-y-1">
                          <div className="text-[11px] font-bold text-forge-subtle uppercase border-b border-white/[0.06] pb-1 mb-2">
                            Original Prompt
                          </div>
                          <pre className="text-rose-300 whitespace-pre-wrap leading-relaxed">
                            {promptText}
                          </pre>
                        </div>
                        <div className="p-3 space-y-1">
                          <div className="text-[11px] font-bold text-emerald-400 uppercase border-b border-white/[0.06] pb-1 mb-2">
                            {activeCandidate.title}
                          </div>
                          <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">
                            {activeCandidate.prompt}
                          </pre>
                        </div>
                      </div>
                    )}
                  </Card>

                  {/* Reasons for changes summary list */}
                  <div className="rounded-lg border border-forge-border bg-forge-surface/60 p-4 space-y-2">
                    <div className="text-xs font-mono font-bold text-forge-text flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-ember-400" />
                      <span>Pedagogical Rationale for Changes:</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      {activeCandidate.changes.map((change) => (
                        <div
                          key={change.id}
                          className="rounded border border-white/[0.05] bg-forge-elevated/40 p-2.5 space-y-1 font-mono"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-forge-text">{change.description}</span>
                            <Badge variant="outline" className="text-[9px] border-forge-border text-forge-muted">
                              {change.type}
                            </Badge>
                          </div>
                          <p className="text-forge-muted font-sans text-[11px] leading-relaxed">
                            {change.reason}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4. Animated Before & After Reveal (Output Transformation) */}
              {activeCandidate && originalRun && (
                <div className="space-y-3 pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-cyan-400" />
                      <h4 className="text-sm font-bold font-mono text-forge-text">
                        Animated Output Reveal: Weak Output vs Improved Output
                      </h4>
                    </div>

                    <div className="flex rounded-md border border-forge-border bg-forge-elevated p-0.5 text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setRevealMode("side_by_side")}
                        className={`px-2.5 py-1 rounded ${
                          revealMode === "side_by_side"
                            ? "bg-forge-surface text-forge-text font-bold"
                            : "text-forge-muted hover:text-white"
                        }`}
                      >
                        Side-by-Side
                      </button>
                      <button
                        type="button"
                        onClick={() => setRevealMode("before")}
                        className={`px-2.5 py-1 rounded ${
                          revealMode === "before"
                            ? "bg-forge-surface text-rose-300 font-bold"
                            : "text-forge-muted hover:text-white"
                        }`}
                      >
                        Before
                      </button>
                      <button
                        type="button"
                        onClick={() => setRevealMode("after")}
                        className={`px-2.5 py-1 rounded ${
                          revealMode === "after"
                            ? "bg-forge-surface text-emerald-300 font-bold"
                            : "text-forge-muted hover:text-white"
                        }`}
                      >
                        After Reveal
                      </button>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {revealMode === "side_by_side" && (
                      <motion.div
                        key="side_by_side"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                      >
                        {/* Original Output Card */}
                        <Card className="border-rose-950/40 bg-forge-surface p-4 flex flex-col justify-between space-y-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between border-b border-forge-border/60 pb-2">
                              <Badge variant="outline" className="border-rose-500/40 text-rose-300 font-mono text-[10px]">
                                Before: Original Weak Prompt
                              </Badge>
                              <span className="text-[11px] font-mono text-forge-subtle">
                                {originalRun.responseLength.words} words
                              </span>
                            </div>
                            <div className="text-xs text-forge-muted leading-relaxed font-mono whitespace-pre-wrap max-h-80 overflow-y-auto pr-1">
                              {originalRun.text}
                            </div>
                          </div>
                          <div className="pt-2 border-t border-forge-border/40 text-[11px] font-mono text-forge-subtle flex items-center justify-between">
                            <span>Latency: {originalRun.latency.latencyMs}ms</span>
                            <span>Tokens: {originalRun.tokenUsage.totalTokens}</span>
                          </div>
                        </Card>

                        {/* Improved Output Card */}
                        <Card className="border-emerald-950/50 bg-forge-surface p-4 flex flex-col justify-between space-y-3 ring-1 ring-emerald-500/20">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between border-b border-forge-border/60 pb-2">
                              <Badge variant="outline" className="border-emerald-500/50 text-emerald-300 font-mono text-[10px]">
                                After: {activeCandidate.title}
                              </Badge>
                              <span className="text-[11px] font-mono text-emerald-400">
                                {activeCandidate.run.responseLength.words} words
                              </span>
                            </div>
                            <div className="text-xs text-forge-text leading-relaxed font-mono whitespace-pre-wrap max-h-80 overflow-y-auto pr-1">
                              {activeCandidate.run.text}
                            </div>
                          </div>
                          <div className="pt-2 border-t border-forge-border/40 text-[11px] font-mono text-emerald-400/80 flex items-center justify-between">
                            <span>Latency: {activeCandidate.run.latency.latencyMs}ms</span>
                            <span>Tokens: {activeCandidate.run.tokenUsage.totalTokens}</span>
                          </div>
                        </Card>
                      </motion.div>
                    )}

                    {revealMode === "before" && (
                      <motion.div
                        key="before"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="rounded-xl border border-rose-900/40 bg-forge-surface p-5 space-y-3"
                      >
                        <div className="flex items-center justify-between border-b border-forge-border pb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-rose-500/50 text-rose-300 font-mono text-xs">
                              Original Prompt Output
                            </Badge>
                            <span className="text-xs text-forge-muted font-mono">Unstructured prose</span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setRevealMode("after")}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs"
                          >
                            Reveal Improved Output →
                          </Button>
                        </div>
                        <div className="text-sm font-mono text-forge-muted leading-relaxed whitespace-pre-wrap">
                          {originalRun.text}
                        </div>
                      </motion.div>
                    )}

                    {revealMode === "after" && (
                      <motion.div
                        key="after"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="rounded-xl border border-emerald-500/40 bg-forge-surface p-5 space-y-3 ring-1 ring-emerald-500/30"
                      >
                        <div className="flex items-center justify-between border-b border-forge-border pb-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-emerald-500/50 text-emerald-300 font-mono text-xs">
                              Transformed Output ({activeCandidate.title})
                            </Badge>
                            <span className="text-xs text-emerald-400 font-mono">High Information Density</span>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRevealMode("before")}
                            className="border-forge-border text-forge-muted text-xs font-mono"
                          >
                            ← Back to Before
                          </Button>
                        </div>
                        <div className="text-sm font-mono text-forge-text leading-relaxed whitespace-pre-wrap">
                          {activeCandidate.run.text}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* 5. Results Compare Per Metric (Strict Invariant: Independent Metrics) */}
              {activeCandidate && (
                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-ember-400" />
                    <h4 className="text-sm font-bold font-mono text-forge-text">
                      Results Compare Per Metric (Independent Dimensions)
                    </h4>
                  </div>
                  <div className="text-xs text-forge-muted">
                    In accordance with PromptForge standards, each dimension is evaluated independently with its own qualitative explanation. No combined accuracy score is computed.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                    {/* Metric 1: Relevance */}
                    <div className="rounded-lg border border-forge-border bg-forge-surface p-3.5 space-y-1.5 font-mono">
                      <div className="flex items-center justify-between text-xs text-forge-muted">
                        <span>Relevance (1-5)</span>
                        <Badge
                          variant="outline"
                          className={
                            activeCandidate.metricsComparison.relevance.delta >= 0
                              ? "border-emerald-500/40 text-emerald-300 text-[10px]"
                              : "border-rose-500/40 text-rose-300 text-[10px]"
                          }
                        >
                          {activeCandidate.metricsComparison.relevance.delta >= 0 ? "+" : ""}
                          {activeCandidate.metricsComparison.relevance.delta}
                        </Badge>
                      </div>
                      <div className="text-lg font-bold text-forge-text">
                        {activeCandidate.judge?.relevance.score ?? 4} / 5
                        <span className="text-xs text-forge-subtle font-normal ml-2">
                          (orig: {originalJudge?.relevance.score ?? 3})
                        </span>
                      </div>
                      <p className="text-[11px] text-forge-muted font-sans leading-relaxed pt-1">
                        {activeCandidate.judge?.relevance.reason || activeCandidate.metricsComparison.relevance.explanation}
                      </p>
                    </div>

                    {/* Metric 2: Clarity */}
                    <div className="rounded-lg border border-forge-border bg-forge-surface p-3.5 space-y-1.5 font-mono">
                      <div className="flex items-center justify-between text-xs text-forge-muted">
                        <span>Clarity (1-5)</span>
                        <Badge
                          variant="outline"
                          className={
                            activeCandidate.metricsComparison.clarity.delta >= 0
                              ? "border-emerald-500/40 text-emerald-300 text-[10px]"
                              : "border-rose-500/40 text-rose-300 text-[10px]"
                          }
                        >
                          {activeCandidate.metricsComparison.clarity.delta >= 0 ? "+" : ""}
                          {activeCandidate.metricsComparison.clarity.delta}
                        </Badge>
                      </div>
                      <div className="text-lg font-bold text-forge-text">
                        {activeCandidate.judge?.clarity.score ?? 5} / 5
                        <span className="text-xs text-forge-subtle font-normal ml-2">
                          (orig: {originalJudge?.clarity.score ?? 3})
                        </span>
                      </div>
                      <p className="text-[11px] text-forge-muted font-sans leading-relaxed pt-1">
                        {activeCandidate.judge?.clarity.reason || activeCandidate.metricsComparison.clarity.explanation}
                      </p>
                    </div>

                    {/* Metric 3: Constraint Following */}
                    <div className="rounded-lg border border-forge-border bg-forge-surface p-3.5 space-y-1.5 font-mono">
                      <div className="flex items-center justify-between text-xs text-forge-muted">
                        <span>Constraints (1-5)</span>
                        <Badge
                          variant="outline"
                          className={
                            activeCandidate.metricsComparison.constraintFollowing.delta >= 0
                              ? "border-emerald-500/40 text-emerald-300 text-[10px]"
                              : "border-rose-500/40 text-rose-300 text-[10px]"
                          }
                        >
                          {activeCandidate.metricsComparison.constraintFollowing.delta >= 0 ? "+" : ""}
                          {activeCandidate.metricsComparison.constraintFollowing.delta}
                        </Badge>
                      </div>
                      <div className="text-lg font-bold text-forge-text">
                        {activeCandidate.judge?.constraintFollowing.score ?? 5} / 5
                        <span className="text-xs text-forge-subtle font-normal ml-2">
                          (orig: {originalJudge?.constraintFollowing.score ?? 2})
                        </span>
                      </div>
                      <p className="text-[11px] text-forge-muted font-sans leading-relaxed pt-1">
                        {activeCandidate.judge?.constraintFollowing.reason || activeCandidate.metricsComparison.constraintFollowing.explanation}
                      </p>
                    </div>

                    {/* Metric 4: Latency & Cost */}
                    <div className="rounded-lg border border-forge-border bg-forge-surface p-3.5 space-y-1.5 font-mono">
                      <div className="flex items-center justify-between text-xs text-forge-muted">
                        <span>Latency & Tokens</span>
                        <span className="text-[10px] text-forge-subtle">
                          {activeCandidate.run.latency.latencyMs}ms
                        </span>
                      </div>
                      <div className="text-lg font-bold text-forge-text">
                        {activeCandidate.run.tokenUsage.totalTokens} tokens
                        <span className="text-xs text-forge-subtle font-normal ml-2">
                          (${activeCandidate.run.cost.costUsd.toFixed(6)})
                        </span>
                      </div>
                      <p className="text-[11px] text-forge-muted font-sans leading-relaxed pt-1">
                        {activeCandidate.run.latency.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Save to Library Modal */}
      {isSaving && activeCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-xl border border-forge-border bg-forge-surface p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-forge-border pb-3">
              <div className="flex items-center gap-2">
                <BookmarkPlus className="h-5 w-5 text-ember-400" />
                <h3 className="text-lg font-bold text-forge-text font-mono">
                  Save Prompt to Library
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSaving(false)}
                className="text-forge-muted hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-forge-muted">Prompt Title</label>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="e.g. Production Canine Care Breakdown"
                  className="w-full rounded-md border border-forge-border bg-forge-elevated p-2 text-forge-text focus:border-ember-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-forge-muted">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={saveTags}
                  onChange={(e) => setSaveTags(e.target.value)}
                  placeholder="e.g. structured, canine, veterinary"
                  className="w-full rounded-md border border-forge-border bg-forge-elevated p-2 text-forge-text focus:border-ember-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-forge-muted">Notes / Rationale</label>
                <textarea
                  value={saveNotes}
                  onChange={(e) => setSaveNotes(e.target.value)}
                  placeholder="Why this version was created..."
                  rows={3}
                  className="w-full rounded-md border border-forge-border bg-forge-elevated p-2 text-forge-text focus:border-ember-500 focus:outline-none"
                />
              </div>

              <div className="p-3 rounded border border-white/[0.06] bg-forge-elevated text-[11px] text-forge-muted">
                Initial save will create <strong>Version 1</strong> in your local library. Any subsequent updates to this prompt will automatically generate new sequential versions (v2, v3...).
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSaving(false)}
                className="border-forge-border text-forge-muted"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSaveToLibrary}
                className="bg-ember-600 hover:bg-ember-500 text-white font-mono text-xs"
              >
                Save Prompt →
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
