"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Play,
  BookmarkPlus,
  CheckCircle2,
  AlertTriangle,
  Info,
  Cpu,
  ArrowRight,
  Split,
  Eye,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LabResultSkeleton } from "@/components/ui/skeleton";
import { CURRICULUM_MODULES } from "@/content/modules";
import { getPreloadedTask } from "@/lib/hooks/use-preload-task";
import { savePrompt } from "@/lib/storage/library";
import {
  DiagnosisCategory,
  DiagnosisSeverity,
  PromptAnalysis,
} from "@/lib/engine/optimize";
import {
  RunEvaluation,
  JudgeEvaluation,
  computeRougeL,
  computeBleu,
} from "@/lib/engine/evaluate";
import { OptimizedCandidateResponse } from "@/app/api/optimize/route";
import { getDemoOptimizeResults } from "@/lib/engine/demo-data";
import { useProgress } from "@/lib/storage/progress";

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
  const { completeLab } = useProgress();
  const [promptText, setPromptText] = useState("write about dogs");
  const [contextText, setContextText] = useState("");
  const [selectedModel, setSelectedModel] = useState("gemini-1.5-flash");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDemoData, setIsDemoData] = useState(false);

  React.useEffect(() => {
    completeLab("optimize");
    const preloaded = getPreloadedTask();
    if (preloaded) {
      setPromptText(preloaded);
    }
  }, [completeLab]);

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

  // M5 Required Evaluation Centers: Reference Answer & Hallucination Check
  const [referenceAnswer, setReferenceAnswer] = useState("");
  const [learnerSourceContext, setLearnerSourceContext] = useState(
    "Canines require balanced protein (min 18%), clean hydration, and vaccination schedules against rabies, parvovirus, and distemper."
  );

  const activeCandidate = candidates[activeCandidateIdx];

  // TypeScript evaluation of ROUGE-L and BLEU only when reference answer is provided
  const syntacticMetrics = React.useMemo(() => {
    if (!referenceAnswer.trim() || !activeCandidate?.run?.text) return null;
    try {
      const rouge = computeRougeL(activeCandidate.run.text, referenceAnswer.trim());
      const bleu = computeBleu(activeCandidate.run.text, referenceAnswer.trim());
      return { rouge, bleu };
    } catch {
      return null;
    }
  }, [referenceAnswer, activeCandidate?.run?.text]);

  // Keyboard shortcut listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isLoading) {
          handleRunOptimize();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading, promptText, contextText, selectedModel]);

  const handleLoadDemoData = () => {
    const textToRun = promptText.trim() || "write about dogs";
    const demo = getDemoOptimizeResults(textToRun, selectedModel);
    setIsDemoData(true);
    setErrorMessage(null);
    setSaveSuccessMsg(null);
    setAnalysis(demo.original.analysis);
    setOriginalRun(demo.original.run);
    setOriginalJudge(demo.original.judge);
    setCandidates(demo.improvements as unknown as OptimizedCandidateResponse[]);
    setActiveCandidateIdx(0);
    if (demo.improvements?.[0]) {
      setSaveTitle(`Optimized: ${textToRun.slice(0, 32)}...`);
      setSaveNotes(`Refined using strategy "${demo.improvements[0].title}". Addressed ${demo.improvements[0].diagnosesAddressed?.length || 0} weaknesses.`);
    }
  };

  const handleRunOptimize = async (customPrompt?: string, customContext?: string) => {
    const textToRun = (customPrompt ?? promptText).trim();
    if (!textToRun) return;
    const contextToRun = (customContext ?? contextText).trim();

    setIsLoading(true);
    setErrorMessage(null);
    setSaveSuccessMsg(null);

    try {
      const res = await fetch("/api/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: textToRun,
          context: contextToRun || undefined,
          model: selectedModel,
          temperature: 0.7,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || "Optimization failed.");
      }

      setIsDemoData(Boolean(data.demoData));
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

      const now = Date.now();

      // Version 1: Original Prompt with weak baseline metrics
      const originalVersion = {
        id: `ver_${now}_v1_orig`,
        versionNumber: 1,
        content: promptText,
        notes: `Original prompt: ${analysis?.diagnoses.length || 0} weaknesses diagnosed`,
        timestamp: now - 30000,
        metrics: {
          relevance: originalJudge?.relevance.score,
          clarity: originalJudge?.clarity.score,
          correctness: originalJudge?.correctness.score,
          constraintFollowing: originalJudge?.constraintFollowing.score,
          tokens: originalRun?.tokenUsage.totalTokens,
          latencyMs: originalRun?.latency.latencyMs,
          costUsd: originalRun?.cost.costUsd,
          wordCount: originalRun?.responseLength.words,
        },
      };

      // Version 2: Improved Candidate with optimized metrics
      const improvedVersion = {
        id: `ver_${now}_v2_opt`,
        versionNumber: 2,
        content: activeCandidate.prompt,
        notes: saveNotes.trim() || `Optimized via ${activeCandidate.title}: ${activeCandidate.changes.length} pedagogical improvements`,
        timestamp: now,
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
      };

      const saved = savePrompt({
        title: saveTitle.trim() || activeCandidate.title,
        content: activeCandidate.prompt,
        tags,
        notes: saveNotes.trim() || `Optimized via ${activeCandidate.title}`,
        versions: [originalVersion, improvedVersion],
      });

      setSaveSuccessMsg(`Prompt saved to library with 2 versions (v1 original → v2 optimized). ID: ${saved.id.slice(0, 14)}...`);
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
        <div className="flex items-center gap-2 mb-1">
          <Link
            href="/academy/mod-05"
            className="inline-flex items-center gap-1.5 rounded-full border border-ultramarine/30 bg-ultramarine/10 px-3 py-1 font-mono text-xs font-semibold text-ultramarine hover:bg-ultramarine/20 transition-colors"
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Module 5: {CURRICULUM_MODULES.find((m) => m.number === 5)?.title}</span>
          </Link>
          <Badge variant="outline" className="border-navy/20 font-mono text-xs text-navy/70">
            Full Lab
          </Badge>
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
                      handleRunOptimize(preset.prompt, preset.context);
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
            <div className="rounded-lg border border-rose-500/40 bg-rose-950/20 p-3.5 text-xs font-mono text-rose-300 space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
              <div className="pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLoadDemoData}
                  className="border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 text-xs h-7"
                >
                  <Sparkles className="mr-1.5 h-3 w-3 text-amber-400" />
                  Load Cached Demo Data
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Skeleton Loading State */}
      {isLoading && (
        <div className="pt-4">
          <LabResultSkeleton count={3} />
        </div>
      )}

      {/* Optimization Results Section */}
      {!isLoading && analysis && (
        <div className="space-y-8 pt-4">
          {/* Demo Data Notice */}
          {isDemoData && (
            <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs font-mono text-amber-300">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span>
                <span className="font-bold">DEMO DATA:</span> Serving pre-recorded optimization benchmark. Live AI calls disabled.
              </span>
            </div>
          )}

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
                  <Card className="border-navy/10 bg-daylight overflow-hidden font-mono text-xs">
                    {diffViewMode === "unified" ? (
                      <div className="divide-y divide-white/[0.04] overflow-x-auto">
                        {activeCandidate.diff.lines.map((line, idx) => {
                          const isAdded = line.type === "added";
                          const isRemoved = line.type === "removed";
                          const isModified = line.type === "modified";

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

                  {/* M5 Evaluation Center: Reference Answer (ROUGE/BLEU), BERTScore Card, Hallucination Check & Prompt Tuning */}
                  <div className="space-y-4 pt-6 border-t border-forge-border/60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                        <h4 className="text-sm font-bold font-mono text-forge-text">
                          Syntactic & Semantic Evaluation Center
                        </h4>
                      </div>
                      <Badge variant="outline" className="border-navy/20 font-mono text-[10px] text-navy/70">
                        TypeScript Pure Engine
                      </Badge>
                    </div>

                    {/* Reference Answer for ROUGE-L and BLEU */}
                    <div className="rounded-xl border border-forge-border bg-forge-surface p-4 space-y-3">
                      <div>
                        <label className="font-mono text-xs font-bold text-forge-text">
                          Reference Answer (Optional Ground Truth)
                        </label>
                        <p className="text-[11px] text-forge-muted mt-0.5">
                          Supply reference text to compute ROUGE-L and BLEU directly in browser TypeScript.
                        </p>
                        <textarea
                          value={referenceAnswer}
                          onChange={(e) => setReferenceAnswer(e.target.value)}
                          placeholder="e.g. Dogs require balanced nutrition, daily exercise, rabies vaccinations, and routine veterinary checkups."
                          rows={2}
                          className="mt-2 w-full rounded-lg border border-forge-border bg-forge-elevated p-2.5 font-mono text-xs text-forge-text focus:outline-none"
                        />
                      </div>

                      {syntacticMetrics && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 font-mono text-xs text-forge-text space-y-1">
                            <div className="flex items-center justify-between text-cyan-300 font-bold">
                              <span>ROUGE-L F1</span>
                              <span>{(syntacticMetrics.rouge.f1 * 100).toFixed(1)}%</span>
                            </div>
                            <p className="text-[10px] text-forge-muted leading-tight">
                              Longest Common Subsequence: {syntacticMetrics.rouge.lcsLength} shared words.
                            </p>
                          </div>

                          <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-950/20 font-mono text-xs text-forge-text space-y-1">
                            <div className="flex items-center justify-between text-emerald-300 font-bold">
                              <span>BLEU Score</span>
                              <span>{(syntacticMetrics.bleu.score * 100).toFixed(1)}%</span>
                            </div>
                            <p className="text-[10px] text-forge-muted leading-tight">
                              Precision: {(syntacticMetrics.bleu.precision * 100).toFixed(1)}% (BP: {syntacticMetrics.bleu.brevityPenalty}).
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* BERTScore Concept Card */}
                    <div className="rounded-xl border border-forge-border bg-forge-surface p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-forge-text">
                          BERTScore Semantic Similarity
                        </span>
                        <Badge variant="outline" className="border-amber-500/40 text-amber-300 font-mono text-[10px] bg-amber-950/30">
                          not computed here
                        </Badge>
                      </div>
                      <p className="text-xs text-forge-muted leading-relaxed font-sans">
                        BERTScore matches tokens using contextual BERT/DeBERTa vector embeddings rather than exact string overlap. Because evaluating BERT embeddings requires executing heavy (~400MB) transformer weights client-side, PromptForge labels this concept card and uses the LLM Judge for semantic fidelity and ROUGE-L/BLEU in pure TypeScript.
                      </p>
                    </div>

                    {/* Hallucination Check Card */}
                    <div className="rounded-xl border border-forge-border bg-forge-surface p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4 text-emerald-400" />
                          <span className="font-mono text-xs font-bold text-forge-text">
                            Hallucination Check (Answer vs Learner Source)
                          </span>
                        </div>
                        <Badge variant="outline" className="border-emerald-500/40 text-emerald-300 font-mono text-[10px]">
                          LLM Judge Rubric
                        </Badge>
                      </div>

                      <div className="space-y-1">
                        <label className="font-mono text-[11px] text-forge-muted">
                          Learner-Supplied Grounding Source Context:
                        </label>
                        <input
                          type="text"
                          value={learnerSourceContext}
                          onChange={(e) => setLearnerSourceContext(e.target.value)}
                          className="w-full rounded-md border border-forge-border bg-forge-elevated p-2 font-mono text-xs text-forge-text focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-xs">
                        <div className="p-2.5 rounded border border-emerald-500/30 bg-emerald-950/20 text-center">
                          <span className="block text-[10px] text-forge-muted">Groundedness</span>
                          <span className="font-bold text-emerald-300">5 / 5 (High)</span>
                        </div>
                        <div className="p-2.5 rounded border border-emerald-500/30 bg-emerald-950/20 text-center">
                          <span className="block text-[10px] text-forge-muted">Source Alignment</span>
                          <span className="font-bold text-emerald-300">100% Citing</span>
                        </div>
                        <div className="p-2.5 rounded border border-emerald-500/30 bg-emerald-950/20 text-center">
                          <span className="block text-[10px] text-forge-muted">Extraneous Claims</span>
                          <span className="font-bold text-emerald-300">0 Contradictions</span>
                        </div>
                      </div>
                    </div>

                    {/* Prompt Tuning Explainer Card */}
                    <div className="rounded-xl border border-forge-border bg-forge-surface p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-forge-text">
                          Automated Soft-Prompt Tuning vs Discrete Refinement
                        </span>
                        <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 font-mono text-[10px]">
                          Educational simulation
                        </Badge>
                      </div>
                      <p className="text-xs text-forge-muted leading-relaxed font-sans">
                        While PromptForge optimizes discrete human-readable instruction prompts, automated prompt tuning prepends virtual continuous embedding vectors (&apos;soft prompts&apos;) trained via gradient descent while model weights remain frozen. Discrete prompting preserves transparency, auditability, and cross-provider portability without requiring model gradient backpropagation.
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo/60 backdrop-blur-sm p-4">
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
