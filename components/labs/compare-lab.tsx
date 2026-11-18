"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Play,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Coins,
  Cpu,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  FileJson,
  Layers,
  Sparkles,
  HelpCircle,
  History,
  Info,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LabResultSkeleton } from "@/components/ui/skeleton";
import { CURRICULUM_MODULES } from "@/content/modules";
import { getPreloadedTask } from "@/lib/hooks/use-preload-task";
import {
  SYLLABUS_TECHNIQUES,
  SYLLABUS_TECHNIQUE_IDS,
  TechniqueId,
  generatePromptForTechnique,
} from "@/lib/techniques";
import { TechniqueAggregateResult } from "@/lib/engine/evaluate";
import {
  STORAGE_KEYS,
  getStorageItem,
  setStorageItem,
  CompareExperimentRecord,
} from "@/lib/storage";
import { getDemoCompareResults } from "@/lib/engine/demo-data";

interface CompareApiResponse {
  success: boolean;
  status?: "completed" | "partial";
  demoData?: boolean;
  warning?: {
    code: string;
    message: string;
    retryAfterSeconds?: number;
  };
  error?: {
    code: string;
    message: string;
    retryAfterSeconds?: number;
  };
  data?: {
    task: string;
    model: string;
    temperature: number;
    expectedFormat: string;
    referenceAnswerProvided: boolean;
    runsRequestedPerTechnique: number;
    totalRunsRequested: number;
    totalCompletedRuns: number;
    isPartial: boolean;
    results: TechniqueAggregateResult[];
  };
}

const PRESET_TASKS = [
  {
    title: "Entity Extraction (JSON)",
    format: "json",
    task: "Extract customer ID, issue severity (CRITICAL, HIGH, MEDIUM, LOW), affected system component, and root problem from this user support message: 'User ID: usr_882910. The checkout database connection pool timed out during checkout for 14 enterprise orders at 09:12 UTC. Payment service returned HTTP 504 gateway timeout.'",
    referenceAnswer:
      '{"customerId": "usr_882910", "severity": "CRITICAL", "affectedComponent": "checkout database connection pool", "rootProblem": "connection pool timeout causing HTTP 504 gateway timeout"}',
  },
  {
    title: "Quantum Superposition Explanation",
    format: "markdown",
    task: "Explain quantum superposition and entanglement to a 10-year-old child using an intuitive playground or coin analogy. Keep it engaging, mathematically grounded in intuition, and free of technical jargon.",
    referenceAnswer: "",
  },
  {
    title: "SQL Retention Query",
    format: "none",
    task: "Write a high-performance PostgreSQL query using Common Table Expressions (CTEs) to calculate 30-day user cohort retention from an events table containing (user_id, event_time, event_type). Include comments explaining edge cases like leap years and timezone shifts.",
    referenceAnswer: "",
  },
];

export function CompareLab() {
  const [isMounted, setIsMounted] = useState(false);

  // Form State
  const [task, setTask] = useState<string>(PRESET_TASKS[0].task);
  const [format, setFormat] = useState<string>(PRESET_TASKS[0].format);
  const [referenceAnswer, setReferenceAnswer] = useState<string>(
    PRESET_TASKS[0].referenceAnswer
  );
  const [showReferenceInput, setShowReferenceInput] = useState<boolean>(true);
  const [model, setModel] = useState<string>("gemini-1.5-flash");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [runsPerTechnique, setRunsPerTechnique] = useState<number>(3);

  // Techniques Selection & Custom Prompts
  const [selectedTechniqueIds, setSelectedTechniqueIds] = useState<TechniqueId[]>(
    [...SYLLABUS_TECHNIQUE_IDS]
  );
  const [customPrompts, setCustomPrompts] = useState<Record<string, string>>({});
  const [userEditedPrompts, setUserEditedPrompts] = useState<Record<string, boolean>>({});
  const [byokKey, setByokKey] = useState<string>("");
  const [showByok, setShowByok] = useState<boolean>(false);
  const [expandedPromptTech, setExpandedPromptTech] = useState<string | null>(null);

  // Execution & Progress State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [progressStage, setProgressStage] = useState<number>(0);
  const [progressMessage, setProgressMessage] = useState<string>("");
  const [results, setResults] = useState<TechniqueAggregateResult[] | null>(null);
  const [isPartialResult, setIsPartialResult] = useState<boolean>(false);
  const [isDemoData, setIsDemoData] = useState<boolean>(false);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Expanded Run Inspector in Card
  const [expandedRunCard, setExpandedRunCard] = useState<string | null>(null);
  const [selectedRunIndex, setSelectedRunIndex] = useState<Record<string, number>>({});

  // History & Export Drawer
  const [historyOpen, setHistoryOpen] = useState<boolean>(false);
  const [savedExperiments, setSavedExperiments] = useState<CompareExperimentRecord[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsMounted(true);
    // Load history from localStorage
    try {
      const records = getStorageItem(STORAGE_KEYS.COMPARE_EXPERIMENTS) as CompareExperimentRecord[];
      if (Array.isArray(records)) {
        setSavedExperiments(records);
      }
    } catch {
      // Ignore initial SSR/storage read errors
    }
  }, []);

  // Update prompt templates whenever task changes unless user manually edited that technique
  useEffect(() => {
    const preloaded = getPreloadedTask();
    if (preloaded) {
      setTask(preloaded);
    }
  }, []);

  useEffect(() => {
    setCustomPrompts((prev) => {
      const next: Record<string, string> = { ...prev };
      for (const t of SYLLABUS_TECHNIQUES) {
        if (!userEditedPrompts[t.id]) {
          next[t.id] = generatePromptForTechnique(t.id, task);
        }
      }
      return next;
    });
  }, [task, userEditedPrompts]);

  const toggleTechnique = (id: TechniqueId) => {
    if (selectedTechniqueIds.includes(id)) {
      if (selectedTechniqueIds.length === 1) return; // Keep at least one
      setSelectedTechniqueIds(selectedTechniqueIds.filter((t) => t !== id));
    } else {
      setSelectedTechniqueIds([...selectedTechniqueIds, id]);
    }
  };

  const selectAllTechniques = () => {
    setSelectedTechniqueIds([...SYLLABUS_TECHNIQUE_IDS]);
  };

  const handleCustomPromptChange = (id: string, value: string) => {
    setUserEditedPrompts((prev) => ({ ...prev, [id]: true }));
    setCustomPrompts((prev) => ({ ...prev, [id]: value }));
  };

  const resetPromptToTemplate = (id: TechniqueId) => {
    setUserEditedPrompts((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
    setCustomPrompts((prev) => ({
      ...prev,
      [id]: generatePromptForTechnique(id, task),
    }));
  };

  // Run Comparison Engine
  const runComparison = async () => {
    if (!task.trim()) {
      setErrorMessage("Please enter a task before running comparison.");
      return;
    }
    if (selectedTechniqueIds.length === 0) {
      setErrorMessage("Please select at least one prompting technique.");
      return;
    }

    setIsRunning(true);
    setErrorMessage(null);
    setWarningMessage(null);
    setIsPartialResult(false);
    setProgressStage(1);
    setProgressMessage("Compiling prompts and validating operational constraints...");

    // Staged progress ticker
    const timer1 = setTimeout(() => {
      setProgressStage(2);
      setProgressMessage(
        `Dispatching concurrent runs through Execution Engine (${selectedTechniqueIds.length * runsPerTechnique} runs)...`
      );
    }, 900);

    const timer2 = setTimeout(() => {
      setProgressStage(3);
      setProgressMessage("Shuffling candidates & executing position-bias-resistant LLM Judge...");
    }, 2800);

    const timer3 = setTimeout(() => {
      setProgressStage(4);
      setProgressMessage("Disaggregating metrics and computing empirical spreads...");
    }, 4500);

    try {
      const techniquesPayload = selectedTechniqueIds.map((id) => {
        const techDef = SYLLABUS_TECHNIQUES.find((t) => t.id === id);
        return {
          id,
          name: techDef?.name || id,
          prompt: customPrompts[id] || generatePromptForTechnique(id, task),
        };
      });

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (byokKey.trim()) {
        headers["x-provider-key"] = byokKey.trim();
      }

      const response = await fetch("/api/compare", {
        method: "POST",
        headers,
        body: JSON.stringify({
          task,
          techniques: techniquesPayload,
          runsPerTechnique,
          model,
          temperature,
          format: format === "none" ? undefined : format,
          referenceAnswer:
            showReferenceInput && referenceAnswer.trim()
              ? referenceAnswer.trim()
              : undefined,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      const json: CompareApiResponse = await response.json();

      if (!response.ok && !json.data) {
        throw new Error(
          json.error?.message || `Comparison failed with HTTP status ${response.status}`
        );
      }

      if (json.data && json.data.results) {
        setResults(json.data.results);
        setIsDemoData(Boolean(json.demoData));
        setIsPartialResult(Boolean(json.status === "partial" || json.data.isPartial));

        if (json.warning) {
          setWarningMessage(json.warning.message);
        }

        // Auto-save experiment to typed localStorage
        const experimentRecord: CompareExperimentRecord = {
          id: `exp_${Date.now()}`,
          timestamp: Date.now(),
          task,
          model,
          temperature,
          expectedFormat: format,
          referenceAnswer: showReferenceInput ? referenceAnswer : undefined,
          runsPerTechnique,
          results: json.data.results,
        };

        const existing = (getStorageItem(STORAGE_KEYS.COMPARE_EXPERIMENTS) || []) as CompareExperimentRecord[];
        const updated = [experimentRecord, ...existing.slice(0, 19)];
        setStorageItem(STORAGE_KEYS.COMPARE_EXPERIMENTS, updated);
        setSavedExperiments(updated);
      } else {
        throw new Error(json.error?.message || "Execution engine returned no results.");
      }
    } catch (err) {
      console.error("[PromptForge Compare UI] Run error:", err);
      setErrorMessage(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during execution."
      );
    } finally {
      setIsRunning(false);
      setProgressStage(0);
      setProgressMessage("");
    }
  };

  const handleLoadDemoData = () => {
    const demo = getDemoCompareResults(task, model);
    setResults(demo.results);
    setIsDemoData(true);
    setErrorMessage(null);
    setIsPartialResult(false);
    const experimentRecord: CompareExperimentRecord = {
      id: `exp_demo_${Date.now()}`,
      timestamp: Date.now(),
      task,
      model,
      temperature,
      expectedFormat: format || "none",
      runsPerTechnique: 3,
      results: demo.results,
    };
    const existing = (getStorageItem(STORAGE_KEYS.COMPARE_EXPERIMENTS) || []) as CompareExperimentRecord[];
    const updated = [experimentRecord, ...existing.slice(0, 19)];
    setStorageItem(STORAGE_KEYS.COMPARE_EXPERIMENTS, updated);
    setSavedExperiments(updated);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning) {
          runComparison();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, task, selectedTechniqueIds, customPrompts, runsPerTechnique, model, temperature, format, referenceAnswer, byokKey]);

  // Export Results as JSON
  const exportExperimentJson = () => {
    if (!results) return;
    const payload = {
      app: "PromptForge",
      version: "1.0",
      type: "technique-comparison-experiment",
      exportedAt: new Date().toISOString(),
      parameters: {
        task,
        model,
        temperature,
        expectedFormat: format,
        referenceAnswer: showReferenceInput ? referenceAnswer : undefined,
        runsPerTechnique,
      },
      results,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promptforge-compare-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON Experiment
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        if (parsed.results && Array.isArray(parsed.results)) {
          setResults(parsed.results);
          if (parsed.parameters) {
            if (parsed.parameters.task) setTask(parsed.parameters.task);
            if (parsed.parameters.model) setModel(parsed.parameters.model);
            if (parsed.parameters.temperature !== undefined)
              setTemperature(parsed.parameters.temperature);
            if (parsed.parameters.expectedFormat)
              setFormat(parsed.parameters.expectedFormat);
            if (parsed.parameters.referenceAnswer) {
              setReferenceAnswer(parsed.parameters.referenceAnswer);
              setShowReferenceInput(true);
            }
          }
          setErrorMessage(null);
        } else {
          setErrorMessage("Uploaded JSON file is not a valid PromptForge experiment format.");
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error
            ? `Corrupt JSON: ${err.message}`
            : "Failed to parse imported JSON file."
        );
      }
    };
    reader.readAsText(file);
  };

  const loadPastExperiment = (exp: CompareExperimentRecord) => {
    setTask(exp.task);
    setModel(exp.model);
    setTemperature(exp.temperature);
    if (exp.expectedFormat) setFormat(exp.expectedFormat);
    if (exp.referenceAnswer) {
      setReferenceAnswer(exp.referenceAnswer);
      setShowReferenceInput(true);
    } else {
      setShowReferenceInput(false);
    }
    setRunsPerTechnique(exp.runsPerTechnique);
    setResults(exp.results as TechniqueAggregateResult[]);
    setHistoryOpen(false);
  };

  // Analytical "What this shows" computations
  const analysisWinners = useMemo(() => {
    if (!results || results.length === 0) return null;

    // Latency winner (lowest mean)
    const sortedLatency = [...results].sort(
      (a, b) => a.latencySpread.mean - b.latencySpread.mean
    );
    const fastest = sortedLatency[0];
    const slowest = sortedLatency[sortedLatency.length - 1];
    const latencyDiffPct =
      slowest.latencySpread.mean > 0
        ? Math.round(
            ((slowest.latencySpread.mean - fastest.latencySpread.mean) /
              slowest.latencySpread.mean) *
              100
          )
        : 0;

    // Token economy winner (lowest output tokens)
    const sortedTokens = [...results].sort(
      (a, b) => a.outputTokensSpread.mean - b.outputTokensSpread.mean
    );
    const mostTokenEfficient = sortedTokens[0];

    // Constraint following winner (highest judge constraint score)
    const sortedConstraints = [...results].sort((a, b) => {
      const aScore = a.judgeConstraintFollowingSpread?.mean || 0;
      const bScore = b.judgeConstraintFollowingSpread?.mean || 0;
      return bScore - aScore;
    });
    const bestConstraint = sortedConstraints[0];

    // Consistency winner (tightest latency range)
    const sortedConsistency = [...results].sort(
      (a, b) => a.latencySpread.range - b.latencySpread.range
    );
    const mostConsistent = sortedConsistency[0];

    return {
      fastest,
      slowest,
      latencyDiffPct,
      mostTokenEfficient,
      bestConstraint,
      mostConsistent,
    };
  }, [results]);

  // Chart Data formatters
  const latencyChartData = useMemo(() => {
    if (!results) return [];
    return results.map((r) => ({
      name: r.techniqueName,
      mean: r.latencySpread.mean,
      min: r.latencySpread.min,
      max: r.latencySpread.max,
      spread: r.latencySpread.range,
    }));
  }, [results]);

  const outputTokensChartData = useMemo(() => {
    if (!results) return [];
    return results.map((r) => ({
      name: r.techniqueName,
      mean: r.outputTokensSpread.mean,
      min: r.outputTokensSpread.min,
      max: r.outputTokensSpread.max,
    }));
  }, [results]);

  const inputTokensChartData = useMemo(() => {
    if (!results) return [];
    return results.map((r) => ({
      name: r.techniqueName,
      promptTokens: r.inputTokensSpread.mean,
    }));
  }, [results]);

  const costChartData = useMemo(() => {
    if (!results) return [];
    return results.map((r) => ({
      name: r.techniqueName,
      costUsd: r.costSpread.mean,
      minCost: r.costSpread.min,
      maxCost: r.costSpread.max,
    }));
  }, [results]);

  const formatComplianceChartData = useMemo(() => {
    if (!results) return [];
    const hasData = results.some((r) => r.formatComplianceSpread !== undefined);
    if (!hasData) return null;

    return results.map((r) => {
      const meanVal = r.formatComplianceSpread?.mean ?? 0;
      const compliancePct = meanVal <= 1 ? Math.round(meanVal * 100) : Math.round(meanVal);
      return {
        name: r.techniqueName,
        compliancePct,
      };
    });
  }, [results]);

  const judgeRubricChartData = useMemo(() => {
    if (!results) return [];
    const hasJudge = results.some((r) => r.judgeRelevanceSpread !== undefined);
    if (!hasJudge) return null;

    return results.map((r) => ({
      name: r.techniqueName,
      Relevance: r.judgeRelevanceSpread?.mean || 0,
      Correctness: r.judgeCorrectnessSpread?.mean || 0,
      Clarity: r.judgeClaritySpread?.mean || 0,
      Constraints: r.judgeConstraintFollowingSpread?.mean || 0,
    }));
  }, [results]);

  const rougeChartData = useMemo(() => {
    if (!results) return [];
    const hasRouge = results.some((r) => r.rougeLF1Spread !== undefined);
    if (!hasRouge) return null;

    return results.map((r) => ({
      name: r.techniqueName,
      f1: Math.round((r.rougeLF1Spread?.mean || 0) * 1000) / 10,
      recall: Math.round((r.rougeLRecallSpread?.mean || 0) * 1000) / 10,
      precision: Math.round((r.rougeLPrecisionSpread?.mean || 0) * 1000) / 10,
    }));
  }, [results]);

  const totalRunsCount = selectedTechniqueIds.length * runsPerTechnique;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Telemetry Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href="/academy/mod-02"
              className="inline-flex items-center gap-1.5 rounded-full border border-ultramarine/30 bg-ultramarine/10 px-3 py-1 font-mono text-xs font-semibold text-ultramarine hover:bg-ultramarine/20 transition-colors"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Module 2: {CURRICULUM_MODULES.find((m) => m.number === 2)?.title}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHistoryOpen(!historyOpen)}
              className="h-8 border-forge-border bg-forge-surface text-xs font-mono text-forge-text hover:border-cyan-500/50"
            >
              <History className="mr-1.5 h-3.5 w-3.5 text-cyan-400" />
              <span>History ({savedExperiments.length})</span>
            </Button>

            {results && (
              <Button
                variant="outline"
                size="sm"
                onClick={exportExperimentJson}
                className="h-8 border-forge-border bg-forge-surface text-xs font-mono text-forge-text hover:border-ember-500/50"
              >
                <Download className="mr-1.5 h-3.5 w-3.5 text-ember-400" />
                <span>Export JSON</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-8 border-forge-border bg-forge-surface text-xs font-mono text-forge-text hover:border-cyan-500/50"
            >
              <Upload className="mr-1.5 h-3.5 w-3.5 text-forge-muted" />
              <span>Import</span>
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportJson}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-forge-text sm:text-4xl">
          Prompting Technique Comparison Lab
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-forge-muted">
          Compare prompt engineering techniques under controlled empirical conditions across multiple runs.
          Metrics are computed independently with standard deviations and spread ranges—
          <span className="font-semibold text-ember-400"> no artificial composite accuracy score</span>.
        </p>
      </div>

      {/* History Drawer Modal */}
      {historyOpen && (
        <Card className="border-cyan-500/40 bg-forge-surface p-5 shadow-2xl">
          <div className="flex items-center justify-between border-b border-forge-border pb-3">
            <h3 className="font-mono text-sm font-bold text-forge-text flex items-center gap-2">
              <History className="h-4 w-4 text-cyan-400" />
              <span>Saved Comparison Experiments</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setHistoryOpen(false)}
              className="text-xs text-forge-muted hover:text-forge-text"
            >
              Close
            </Button>
          </div>

          <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
            {savedExperiments.length === 0 ? (
              <p className="py-4 text-center text-xs font-mono text-forge-muted">
                No saved experiments yet. Run a comparison to automatically record it in history.
              </p>
            ) : (
              savedExperiments.map((exp) => (
                <div
                  key={exp.id}
                  onClick={() => loadPastExperiment(exp)}
                  className="group flex cursor-pointer items-center justify-between rounded-md border border-forge-border bg-forge-elevated p-3 transition-colors hover:border-cyan-500/60"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-white/10 font-mono text-[10px] text-cyan-300">
                        {exp.model}
                      </Badge>
                      <span className="font-mono text-[11px] text-forge-muted">
                        {new Date(exp.timestamp).toLocaleDateString()} {new Date(exp.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-xs text-forge-text group-hover:text-cyan-400">
                      {exp.task}
                    </p>
                  </div>
                  <div className="text-right font-mono text-[11px] text-forge-muted group-hover:text-cyan-400">
                    {exp.results?.length || 0} techniques · {exp.runsPerTechnique} runs →
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* Preset Tasks Banner */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-forge-border bg-forge-surface/60 p-3">
        <span className="text-xs font-mono text-forge-muted flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-ember-400" />
          <span>Preset Tasks:</span>
        </span>
        {PRESET_TASKS.map((preset) => (
          <Button
            key={preset.title}
            variant="outline"
            size="sm"
            onClick={() => {
              setTask(preset.task);
              setFormat(preset.format);
              setReferenceAnswer(preset.referenceAnswer);
              setShowReferenceInput(Boolean(preset.referenceAnswer));
            }}
            className="h-7 border-forge-border bg-forge-elevated text-xs font-mono text-forge-text hover:border-cyan-500/50 hover:text-cyan-300"
          >
            {preset.title}
          </Button>
        ))}
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Task Input & Settings (7 cols) */}
        <div className="space-y-5 lg:col-span-7">
          <Card className="border-forge-border bg-forge-surface p-5 space-y-4">
            <div>
              <label className="flex items-center justify-between text-xs font-mono font-bold uppercase tracking-wider text-forge-text">
                <span>1. Task Directive</span>
                <span className="text-[11px] font-normal text-forge-muted">
                  {task.length} characters
                </span>
              </label>
              <textarea
                value={task}
                onChange={(e) => setTask(e.target.value)}
                placeholder="Enter the task you want the LLM to perform..."
                rows={4}
                className="mt-2 w-full rounded-md border border-forge-border bg-daylight p-3 font-sans text-sm text-forge-text placeholder-forge-muted/50 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 leading-relaxed"
              />
            </div>

            {/* Expected Format & Reference Answer Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-forge-text">
                  Expected Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-forge-border bg-daylight px-3 py-2 text-xs font-mono text-forge-text focus:border-cyan-500 focus:outline-none"
                >
                  <option value="none">None (Freeform text)</option>
                  <option value="json">JSON Object/Array</option>
                  <option value="markdown">Hierarchical Markdown</option>
                  <option value="bullet-points">Bullet Points List</option>
                  <option value="csv">CSV (Comma-Separated)</option>
                  <option value="xml">XML / Structured Tags</option>
                </select>
                <p className="mt-1 text-[11px] text-forge-muted">
                  Evaluated independently for strict syntax compliance.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-forge-text">
                    Reference Answer
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowReferenceInput(!showReferenceInput)}
                    className="text-[11px] font-mono text-cyan-400 hover:underline"
                  >
                    {showReferenceInput ? "Hide" : "+ Add (ROUGE-L)"}
                  </button>
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-forge-muted">
                  <Info className="h-3.5 w-3.5 text-ember-400 shrink-0" />
                  <span>BLEU / ROUGE only computed with reference.</span>
                </div>
              </div>
            </div>

            {/* Optional Reference Answer Input */}
            {showReferenceInput && (
              <div className="pt-2 border-t border-forge-border/60">
                <label className="block text-xs font-mono text-ember-400">
                  Ground Truth Reference Answer (for ROUGE-L LCS Overlap):
                </label>
                <textarea
                  value={referenceAnswer}
                  onChange={(e) => setReferenceAnswer(e.target.value)}
                  placeholder="Paste exemplary ground truth answer here..."
                  rows={2}
                  className="mt-1.5 w-full rounded-md border border-forge-border bg-daylight p-2.5 font-sans text-xs text-forge-text placeholder-forge-muted/50 focus:border-ember-500 focus:outline-none"
                />
              </div>
            )}
          </Card>

          {/* Model & Execution Parameters */}
          <Card className="border-forge-border bg-forge-surface p-5">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-forge-text mb-4">
              2. Execution Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-mono text-forge-muted">Model</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="mt-1.5 w-full rounded-md border border-forge-border bg-daylight px-2.5 py-1.5 text-xs font-mono text-forge-text focus:border-cyan-500 focus:outline-none"
                >
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4o">GPT-4o</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono text-forge-muted">
                  <span>Runs / Technique (N)</span>
                  <span className="font-bold text-cyan-400">{runsPerTechnique}</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={runsPerTechnique}
                  onChange={(e) => setRunsPerTechnique(parseInt(e.target.value, 10))}
                  className="mt-3 w-full accent-cyan-400 cursor-pointer"
                />
                <p className="mt-1 text-[10px] text-forge-muted">
                  {runsPerTechnique === 1 ? "Single run (no spread)" : `Computes empirical spread over ${runsPerTechnique} runs`}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono text-forge-muted">
                  <span>Temperature</span>
                  <span className="font-bold text-ember-400">{temperature}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={1.5}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="mt-3 w-full accent-ember-500 cursor-pointer"
                />
                <p className="mt-1 text-[10px] text-forge-muted">
                  {temperature === 0 ? "Deterministic (low spread)" : "Generative variance"}
                </p>
              </div>
            </div>

            {/* Optional BYOK API Key Input */}
            <div className="mt-4 pt-3 border-t border-forge-border/60">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono text-forge-muted flex items-center gap-1.5">
                  <Key className="h-3 w-3 text-cyan-400" />
                  <span>Custom Provider Key (BYOK)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowByok(!showByok)}
                  className="text-[11px] font-mono text-cyan-400 hover:underline"
                >
                  {showByok ? "Hide" : byokKey.trim() ? "Key Configured ✓" : "+ Add Key"}
                </button>
              </div>
              {showByok && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter OpenAI (sk-...) or Gemini API key..."
                    value={byokKey}
                    onChange={(e) => setByokKey(e.target.value)}
                    className="flex-1 rounded-md border border-forge-border bg-daylight px-2.5 py-1.5 font-mono text-xs text-forge-text focus:border-cyan-500 focus:outline-none"
                  />
                  {byokKey.trim() && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setByokKey("")}
                      className="h-8 text-xs font-mono text-forge-muted hover:text-ember-400"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Technique Selection & Prompt Preview (5 cols) */}
        <div className="space-y-5 lg:col-span-5">
          <Card className="border-forge-border bg-forge-surface p-5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-forge-text">
                3. Select Techniques ({selectedTechniqueIds.length} / {SYLLABUS_TECHNIQUES.length})
              </label>
              <button
                type="button"
                onClick={selectAllTechniques}
                className="text-xs font-mono text-cyan-400 hover:underline"
              >
                Select All ({SYLLABUS_TECHNIQUES.length})
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              {SYLLABUS_TECHNIQUES.map((tech) => {
                const isSelected = selectedTechniqueIds.includes(tech.id);
                return (
                  <button
                    key={tech.id}
                    type="button"
                    onClick={() => toggleTechnique(tech.id)}
                    className={`flex flex-col text-left rounded-lg border p-2.5 transition-all ${
                      isSelected
                        ? "border-cyan-500/80 bg-cyan-950/20 text-forge-text shadow-sm"
                        : "border-forge-border bg-forge-elevated/40 text-forge-muted hover:border-forge-border-bright"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-xs font-bold" style={{ color: isSelected ? tech.color : undefined }}>
                        {tech.name}
                      </span>
                      <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-navy/10 bg-daylight">
                        {tech.tag}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] line-clamp-2 text-forge-muted leading-tight">
                      {tech.description}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Prompt Inspector / Inline Editor Toggle */}
            <div className="mt-4 pt-3 border-t border-forge-border/60">
              <div className="flex items-center justify-between text-xs font-mono text-forge-muted">
                <span>Generated Prompt Inspector</span>
                <span className="text-[11px] text-cyan-400">Click to customize</span>
              </div>

              <div className="mt-2 space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedTechniqueIds.map((id) => {
                  const tech = SYLLABUS_TECHNIQUES.find((t) => t.id === id);
                  const isExpanded = expandedPromptTech === id;
                  return (
                    <div
                      key={id}
                      className="rounded border border-forge-border bg-daylight p-2 text-xs"
                    >
                      <div
                        onClick={() =>
                          setExpandedPromptTech(isExpanded ? null : id)
                        }
                        className="flex cursor-pointer items-center justify-between font-mono text-[11px] text-forge-text"
                      >
                        <span className="font-bold" style={{ color: tech?.color }}>
                          {tech?.name} Prompt
                        </span>
                        <div className="flex items-center gap-1.5 text-forge-muted">
                          <span>{customPrompts[id]?.length || 0} chars</span>
                          {isExpanded ? (
                            <ChevronUp className="h-3 w-3" />
                          ) : (
                            <ChevronDown className="h-3 w-3" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="mt-2 space-y-2">
                          <textarea
                            value={customPrompts[id] || ""}
                            onChange={(e) =>
                              handleCustomPromptChange(id, e.target.value)
                            }
                            rows={5}
                            className="w-full rounded border border-forge-border bg-forge-surface p-2 font-mono text-[11px] text-forge-text focus:border-cyan-500 focus:outline-none"
                          />
                          <div className="flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resetPromptToTemplate(id)}
                              className="h-6 text-[10px] font-mono text-forge-muted hover:text-ember-400"
                            >
                              Reset to Template
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Execution Action & Staged Progress */}
      <div className="flex flex-col items-center justify-center space-y-4 pt-2">
        <Button
          size="lg"
          onClick={runComparison}
          disabled={isRunning}
          className="h-12 px-8 bg-ultramarine font-mono text-sm font-bold text-white shadow-lg hover:bg-ultramarine-hover disabled:opacity-50"
        >
          {isRunning ? (
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 animate-spin text-white" />
              <span>Executing {totalRunsCount} Runs...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Play className="h-4 w-4 fill-white text-white" />
              <span>Run Fair Comparison ({totalRunsCount} runs)</span>
            </div>
          )}
        </Button>

        {/* Staged Progress Indicator */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="w-full max-w-xl rounded-lg border border-cyan-500/50 bg-cyan-950/20 p-4 text-center font-mono"
            >
              <div className="flex items-center justify-between text-xs text-cyan-300">
                <span>Stage {progressStage} of 4</span>
                <span className="animate-pulse">Engine Active</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-indigo/10">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-ember-500"
                  initial={{ width: "10%" }}
                  animate={{ width: `${progressStage * 25}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="mt-2.5 text-xs text-forge-text font-medium">
                {progressMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {isRunning && (
          <div className="w-full max-w-5xl pt-4">
            <LabResultSkeleton count={3} />
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="w-full max-w-xl rounded-lg border border-red-500/40 bg-red-950/20 p-4 text-xs font-mono text-red-300 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <div>
                <p className="font-bold">Execution Error</p>
                <p className="mt-1 text-red-200">{errorMessage}</p>
              </div>
              <button
                type="button"
                onClick={handleLoadDemoData}
                className="inline-flex items-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-colors"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>Load Cached Demo Comparison</span>
              </button>
            </div>
          </div>
        )}

        {/* Partial Results / Rate Limit Banner */}
        {isPartialResult && (
          <div className="w-full max-w-3xl rounded-lg border border-amber-500/50 bg-amber-950/20 p-4 font-mono text-xs text-amber-300 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-ember-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold uppercase tracking-wider text-amber-200">
                Partial Results Displayed
              </p>
              <p className="mt-1 text-amber-300/90 leading-relaxed">
                {warningMessage ||
                  "Execution was throttled mid-run due to upstream per-IP rate limits or sandbox token budget. Partial data from completed runs is shown below."}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* RESULTS SECTION                                                     */}
      {/* =================================================================== */}
      {results && results.length > 0 && (
        <div className="space-y-10 pt-6">
          {isDemoData && (
            <div className="flex items-center gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-mono text-amber-300">
              <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
              <span className="font-bold">DEMO DATA:</span>
              <span>
                Pre-recorded empirical benchmark comparison. Live API execution was not invoked.
              </span>
            </div>
          )}

          {/* Analytical "What this shows" Panel */}
          {analysisWinners && (
            <Card className="border-cyan-500/40 bg-gradient-to-b from-forge-surface to-forge-elevated p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-cyan-400" />
                <h2 className="text-lg font-bold font-mono text-forge-text tracking-tight">
                  What This Empirical Comparison Shows
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
                {/* Latency Winner */}
                <div className="rounded-xl border border-navy/10 bg-daylight p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
                    <Clock className="h-3.5 w-3.5" />
                    <span>Fastest Execution</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-forge-text">
                    {analysisWinners.fastest.techniqueName}
                  </p>
                  <p className="mt-1 text-xs text-forge-muted leading-relaxed font-mono">
                    Mean {analysisWinners.fastest.latencySpread.mean}ms
                    {analysisWinners.latencyDiffPct > 0 && (
                      <span className="text-cyan-300">
                        {" "}
                        ({analysisWinners.latencyDiffPct}% faster than{" "}
                        {analysisWinners.slowest.techniqueName})
                      </span>
                    )}
                  </p>
                </div>

                {/* Token Efficiency Winner */}
                <div className="rounded-xl border border-navy/10 bg-daylight p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-ember-400">
                    <Coins className="h-3.5 w-3.5" />
                    <span>Most Token-Efficient</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-forge-text">
                    {analysisWinners.mostTokenEfficient.techniqueName}
                  </p>
                  <p className="mt-1 text-xs text-forge-muted leading-relaxed font-mono">
                    Mean {analysisWinners.mostTokenEfficient.outputTokensSpread.mean} output tokens (
                    ${analysisWinners.mostTokenEfficient.costSpread.mean.toFixed(6)})
                  </p>
                </div>

                {/* Constraint Following Winner */}
                <div className="rounded-xl border border-navy/10 bg-daylight p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Best Constraint Adherence</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-forge-text">
                    {analysisWinners.bestConstraint.techniqueName}
                  </p>
                  <p className="mt-1 text-xs text-forge-muted leading-relaxed font-mono">
                    Rubric score:{" "}
                    {analysisWinners.bestConstraint.judgeConstraintFollowingSpread?.mean !== undefined
                      ? `${analysisWinners.bestConstraint.judgeConstraintFollowingSpread.mean} / 5.0`
                      : "Pending Rubric"}
                  </p>
                </div>

                {/* Consistency Winner */}
                <div className="rounded-xl border border-navy/10 bg-daylight p-3.5">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-sky-400">
                    <Layers className="h-3.5 w-3.5" />
                    <span>Tightest Spread (Lowest Variance)</span>
                  </div>
                  <p className="mt-1 text-sm font-bold text-forge-text">
                    {analysisWinners.mostConsistent.techniqueName}
                  </p>
                  <p className="mt-1 text-xs text-forge-muted leading-relaxed font-mono">
                    Latency spread Δ
                    {analysisWinners.mostConsistent.latencySpread.range}ms (σ{" "}
                    {analysisWinners.mostConsistent.latencySpread.stdDev}ms)
                  </p>
                </div>
              </div>

              {/* Crucial Caution on Small Sample Size */}
              <div className="mt-3 rounded border border-amber-500/40 bg-amber-950/20 p-3 text-xs font-mono text-amber-300/90 leading-relaxed flex items-start gap-2.5">
                <HelpCircle className="h-4 w-4 text-ember-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-200">
                    Scientific Caution on Small Sample Size (N = {runsPerTechnique}):{" "}
                  </span>
                  With small run counts, differences under 15-20% in latency or output length can be stochastic
                  variance from LLM temperature sampling rather than inherent technique superiority. Never deploy
                  a technique to production without testing across N ≥ 50 varied benchmark test cases.
                </div>
              </div>
            </Card>
          )}

          {/* Section 1: Side-by-Side Technique Result Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold font-mono text-forge-text">
                  Technique Performance Cards ({results.length})
                </h3>
                <p className="text-xs text-forge-muted font-mono">
                  All metrics reported with mean and spread range across completed runs.
                </p>
              </div>
              <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 font-mono text-xs">
                Independent Metrics
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {results.map((result) => {
                const isExpanded = expandedRunCard === result.techniqueId;
                const activeRunIdx = selectedRunIndex[result.techniqueId] || 0;
                const currentRun = result.rawRuns[activeRunIdx] || result.rawRuns[0];

                return (
                  <Card
                    key={result.techniqueId}
                    className="border-forge-border bg-forge-surface flex flex-col justify-between overflow-hidden transition-all hover:border-cyan-500/40"
                  >
                    <div className="p-5 space-y-4">
                      {/* Card Header */}
                      <div className="flex items-start justify-between border-b border-forge-border/60 pb-3">
                        <div>
                          <h4 className="font-mono text-base font-bold text-forge-text">
                            {result.techniqueName}
                          </h4>
                          <span className="font-mono text-[10px] text-forge-muted">
                            {result.runsCompleted} / {result.runsRequested} runs completed
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-navy/10 font-mono text-[10px] text-teal-700 bg-daylight"
                        >
                          {result.techniqueId}
                        </Badge>
                      </div>

                      {/* Disaggregated Metrics Grid */}
                      <div className="space-y-2.5 font-mono text-xs">
                        {/* Latency */}
                        <div className="flex items-center justify-between rounded-xl bg-daylight p-2.5">
                          <span className="text-forge-muted flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Latency:</span>
                          </span>
                          <div className="text-right">
                            <span className="font-bold text-forge-text">
                              {result.latencySpread.mean}ms
                            </span>
                            <span className="block text-[10px] text-forge-muted">
                              spread: {result.latencySpread.min}-{result.latencySpread.max}ms (Δ{result.latencySpread.range}ms)
                            </span>
                          </div>
                        </div>

                        {/* Output Tokens */}
                        <div className="flex items-center justify-between rounded-xl bg-daylight p-2.5">
                          <span className="text-forge-muted flex items-center gap-1.5">
                            <Cpu className="h-3.5 w-3.5 text-ember-400" />
                            <span>Output Tokens:</span>
                          </span>
                          <div className="text-right">
                            <span className="font-bold text-forge-text">
                              {result.outputTokensSpread.mean}
                            </span>
                            <span className="block text-[10px] text-forge-muted">
                              spread: {result.outputTokensSpread.min}-{result.outputTokensSpread.max} tokens
                            </span>
                          </div>
                        </div>

                        {/* Input Tokens */}
                        <div className="flex items-center justify-between rounded-xl bg-daylight p-2.5">
                          <span className="text-forge-muted">Prompt Input:</span>
                          <span className="font-bold text-forge-text">
                            {result.inputTokensSpread.mean} tokens
                          </span>
                        </div>

                        {/* Estimated Cost */}
                        <div className="flex items-center justify-between rounded-xl bg-daylight p-2.5">
                          <span className="text-forge-muted flex items-center gap-1.5">
                            <Coins className="h-3.5 w-3.5 text-amber-400" />
                            <span>Cost:</span>
                          </span>
                          <span className="font-bold text-amber-500">
                            ${result.costSpread.mean.toFixed(6)}
                          </span>
                        </div>

                        {/* Format Compliance (if requested) */}
                        {result.formatComplianceSpread && (
                          <div className="flex items-center justify-between rounded-xl bg-daylight p-2.5">
                            <span className="text-forge-muted">Format Compliance:</span>
                            <Badge
                              variant="outline"
                              className={
                                (result.formatComplianceSpread.mean <= 1
                                  ? result.formatComplianceSpread.mean >= 0.8
                                  : result.formatComplianceSpread.mean >= 80)
                                  ? "border-emerald-500/40 text-emerald-300"
                                  : "border-red-500/40 text-red-300"
                              }
                            >
                              {result.formatComplianceSpread.mean <= 1
                                ? Math.round(result.formatComplianceSpread.mean * 100)
                                : Math.round(result.formatComplianceSpread.mean)}%
                            </Badge>
                          </div>
                        )}

                        {/* LLM Judge Rubric Breakdown (Each 1 to 5) */}
                        {result.judgeRelevanceSpread && (
                          <div className="rounded-xl border border-navy/10 bg-daylight p-2.5 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-bold text-cyan-300">
                              <span>LLM Judge Rubric</span>
                              <span className="text-[10px] font-normal text-forge-muted">
                                (shuffled order)
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                              <div>
                                <span className="text-forge-muted">Relevance: </span>
                                <span className="font-bold text-forge-text">
                                  {result.judgeRelevanceSpread.mean}/5
                                </span>
                              </div>
                              <div>
                                <span className="text-forge-muted">Correctness: </span>
                                <span className="font-bold text-forge-text">
                                  {result.judgeCorrectnessSpread?.mean || 4}/5
                                </span>
                              </div>
                              <div>
                                <span className="text-forge-muted">Clarity: </span>
                                <span className="font-bold text-forge-text">
                                  {result.judgeClaritySpread?.mean || 4}/5
                                </span>
                              </div>
                              <div>
                                <span className="text-forge-muted">Constraints: </span>
                                <span className="font-bold text-forge-text">
                                  {result.judgeConstraintFollowingSpread?.mean || 4}/5
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* ROUGE-L Overlap (Only if reference supplied) */}
                        {result.rougeLF1Spread && (
                          <div className="rounded border border-ember-500/30 bg-ember-950/20 p-2 space-y-1">
                            <div className="flex items-center justify-between text-[11px] font-bold text-ember-300">
                              <span>ROUGE-L Ground Truth Overlap</span>
                              <span>F1: {(result.rougeLF1Spread.mean * 100).toFixed(1)}%</span>
                            </div>
                            <div className="flex justify-between text-[10px] text-forge-muted">
                              <span>Recall: {((result.rougeLRecallSpread?.mean || 0) * 100).toFixed(1)}%</span>
                              <span>Precision: {((result.rougeLPrecisionSpread?.mean || 0) * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expandable Run Inspector */}
                    <div className="border-t border-navy/10 bg-daylight p-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedRunCard(isExpanded ? null : result.techniqueId)
                        }
                        className="w-full justify-between h-7 text-xs font-mono text-cyan-400 hover:text-cyan-300"
                      >
                        <span>{isExpanded ? "Hide Run Details" : "Inspect Run Outputs"}</span>
                        {isExpanded ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )}
                      </Button>

                      {isExpanded && (
                        <div className="mt-3 space-y-3">
                          {/* Run Selector Tabs */}
                          {result.rawRuns.length > 1 && (
                            <div className="flex gap-1.5 border-b border-forge-border pb-2">
                              {result.rawRuns.map((r, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() =>
                                    setSelectedRunIndex((prev) => ({
                                      ...prev,
                                      [result.techniqueId]: idx,
                                    }))
                                  }
                                  className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                                    activeRunIdx === idx
                                      ? "bg-ultramarine text-white font-bold"
                                      : "bg-daylight text-navy/70 hover:text-navy"
                                  }`}
                                >
                                  Run #{r.runIndex}
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Raw Output Preview */}
                          {currentRun && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-[10px] font-mono text-forge-muted">
                                <span>Output Text Preview:</span>
                                <span>
                                  {currentRun.responseLength.characters} chars, {currentRun.responseLength.words} words
                                </span>
                              </div>
                              <div className="max-h-48 overflow-y-auto rounded-xl border border-navy/10 bg-daylight p-2.5 font-sans text-xs text-forge-text leading-relaxed whitespace-pre-wrap">
                                {currentRun.text}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* =============================================================== */}
          {/* Section 2: Recharts Bar Charts per Metric (Never Merged)        */}
          {/* =============================================================== */}
          <div className="space-y-8 pt-4">
            <div className="border-b border-forge-border pb-3">
              <h3 className="text-xl font-bold font-mono text-forge-text">
                Disaggregated Metric Charts
              </h3>
              <p className="text-xs font-mono text-forge-muted">
                One chart per metric. We never blend latency, tokens, or quality into one misleading combined index.
              </p>
            </div>

            {/* Chart 1: Latency */}
            <Card className="border-forge-border bg-forge-surface p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-mono text-sm font-bold text-forge-text flex items-center gap-2">
                    <Clock className="h-4 w-4 text-cyan-400" />
                    <span>Execution Latency (ms)</span>
                  </h4>
                  <p className="text-[11px] text-forge-muted">
                    Mean execution time. Shorter is better for interactive user experiences.
                  </p>
                </div>
              </div>

              {isMounted && (
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={latencyChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--forge-border)" />
                      <XAxis dataKey="name" stroke="var(--indigo)" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                      <YAxis stroke="var(--indigo)" tick={{ fontSize: 11, fontFamily: "monospace" }} unit="ms" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--forge-surface)",
                          border: "1px solid var(--forge-border)",
                          borderRadius: "8px",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "var(--indigo)",
                        }}
                        formatter={(val: unknown) => [`${val} ms`, "Mean Latency"]}
                      />
                      <Bar dataKey="mean" fill="var(--teal)" name="Mean Latency (ms)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Chart 2: Output Tokens */}
            <Card className="border-forge-border bg-forge-surface p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-mono text-sm font-bold text-forge-text flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-ember-400" />
                    <span>Output Token Generation Length</span>
                  </h4>
                  <p className="text-[11px] text-forge-muted">
                    Inference volume. High output tokens drive the primary operational latency and dollar cost.
                  </p>
                </div>
              </div>

              {isMounted && (
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={outputTokensChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--forge-border)" />
                      <XAxis dataKey="name" stroke="var(--indigo)" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                      <YAxis stroke="var(--indigo)" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--forge-surface)",
                          border: "1px solid var(--forge-border)",
                          borderRadius: "8px",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "var(--indigo)",
                        }}
                        formatter={(val: unknown) => [`${val} tokens`, "Mean Output Tokens"]}
                      />
                      <Bar dataKey="mean" fill="var(--coral)" name="Mean Output Tokens" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Chart 3: Prompt Input Tokens */}
            <Card className="border-forge-border bg-forge-surface p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-mono text-sm font-bold text-forge-text flex items-center gap-2">
                    <Layers className="h-4 w-4 text-sky-400" />
                    <span>Prompt Input Tokens (Overhead)</span>
                  </h4>
                  <p className="text-[11px] text-forge-muted">
                    Measures prompt verbosity. Few-shot and exemplars carry higher prompt token ingestion overhead.
                  </p>
                </div>
              </div>

              {isMounted && (
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={inputTokensChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--forge-border)" />
                      <XAxis dataKey="name" stroke="var(--indigo)" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                      <YAxis stroke="var(--indigo)" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--forge-surface)",
                          border: "1px solid var(--forge-border)",
                          borderRadius: "8px",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "var(--indigo)",
                        }}
                        formatter={(val: unknown) => [`${val} tokens`, "Prompt Input Tokens"]}
                      />
                      <Bar dataKey="promptTokens" fill="var(--teal)" name="Input Tokens" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Chart 4: Estimated Cost */}
            <Card className="border-forge-border bg-forge-surface p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-mono text-sm font-bold text-forge-text flex items-center gap-2">
                    <Coins className="h-4 w-4 text-amber-400" />
                    <span>Estimated Cost ($ USD)</span>
                  </h4>
                  <p className="text-[11px] text-forge-muted">
                    Total execution expense combining prompt ingestion and output synthesis according to model pricing tables.
                  </p>
                </div>
              </div>

              {isMounted && (
                <div className="h-64 w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={costChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--forge-border)" />
                      <XAxis dataKey="name" stroke="var(--indigo)" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                      <YAxis stroke="var(--indigo)" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--forge-surface)",
                          border: "1px solid var(--forge-border)",
                          borderRadius: "8px",
                          fontFamily: "monospace",
                          fontSize: "12px",
                          color: "var(--indigo)",
                        }}
                        formatter={(val: unknown) => [`$${Number(val).toFixed(6)}`, "Estimated Cost"]}
                      />
                      <Bar dataKey="costUsd" fill="var(--coral)" name="Cost (USD)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </Card>

            {/* Chart 5: Format Compliance (When requested) */}
            {formatComplianceChartData && (
              <Card className="border-forge-border bg-forge-surface p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-mono text-sm font-bold text-forge-text flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Format Compliance Rate (%)</span>
                    </h4>
                    <p className="text-[11px] text-forge-muted">
                      Evaluates whether responses adhere strictly to the requested {format} syntax without syntax errors.
                    </p>
                  </div>
                </div>

                {isMounted && (
                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={formatComplianceChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--forge-border)" />
                        <XAxis dataKey="name" stroke="var(--indigo)" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                        <YAxis stroke="var(--indigo)" tick={{ fontSize: 11, fontFamily: "monospace" }} unit="%" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--forge-surface)",
                            border: "1px solid var(--forge-border)",
                            borderRadius: "8px",
                            fontFamily: "monospace",
                            fontSize: "12px",
                            color: "var(--indigo)",
                          }}
                          formatter={(val: unknown) => [`${val}%`, "Compliance Rate"]}
                        />
                        <Bar dataKey="compliancePct" fill="var(--teal)" name="Compliance %" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            )}

            {/* Chart 5: LLM Judge Rubric Dimensions */}
            {judgeRubricChartData && (
              <Card className="border-forge-border bg-forge-surface p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-mono text-sm font-bold text-forge-text flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-cyan-400" />
                      <span>LLM Judge Rubric Scores (1 to 5)</span>
                    </h4>
                    <p className="text-[11px] text-forge-muted">
                      Evaluated on Relevance, Correctness, Clarity, and Constraint-Following. Candidate order randomized.
                    </p>
                  </div>
                </div>

                {isMounted && (
                  <div className="h-72 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={judgeRubricChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--forge-border)" />
                        <XAxis dataKey="name" stroke="var(--indigo)" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                        <YAxis stroke="var(--indigo)" tick={{ fontSize: 11, fontFamily: "monospace" }} domain={[0, 5]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--forge-surface)",
                            border: "1px solid var(--forge-border)",
                            borderRadius: "8px",
                            fontFamily: "monospace",
                            fontSize: "12px",
                            color: "var(--indigo)",
                          }}
                          formatter={(val: unknown, name: unknown) => [`${val} / 5.0`, String(name)]}
                        />
                        <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: "11px" }} />
                        <Bar dataKey="Relevance" fill="var(--teal)" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Correctness" fill="var(--violet)" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Clarity" fill="var(--coral)" radius={[3, 3, 0, 0]} />
                        <Bar dataKey="Constraints" fill="var(--butter)" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            )}

            {/* Chart 6: ROUGE-L Overlap (Only when reference answer was supplied) */}
            {rougeChartData && (
              <Card className="border-forge-border bg-forge-surface p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-mono text-sm font-bold text-forge-text flex items-center gap-2">
                      <FileJson className="h-4 w-4 text-ember-400" />
                      <span>ROUGE-L Longest Common Subsequence Overlap (%)</span>
                    </h4>
                    <p className="text-[11px] text-forge-muted">
                      Computed strictly against user ground truth. Shows F1, Recall, and Precision.
                    </p>
                  </div>
                </div>

                {/* What it does / does not tell you educational callout */}
                <div className="rounded-xl border border-navy/10 bg-daylight p-3 text-xs font-mono space-y-1.5">
                  <div className="text-cyan-700">
                    <span className="font-bold">What ROUGE-L tells you: </span>
                    Measures exact phrase recall and longest contiguous/subsequence word order overlap against your ground truth.
                  </div>
                  <div className="text-amber-700">
                    <span className="font-bold">What ROUGE-L does NOT tell you: </span>
                    It does not evaluate semantic validity or logical soundness. A completely hallucinated answer with high word overlap scores high, while a concise correct alternative scores low.
                  </div>
                </div>

                {isMounted && (
                  <div className="h-64 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={rougeChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--forge-border)" />
                        <XAxis dataKey="name" stroke="var(--indigo)" tick={{ fontSize: 11, fontFamily: "monospace" }} />
                        <YAxis stroke="var(--indigo)" tick={{ fontSize: 11, fontFamily: "monospace" }} unit="%" domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "var(--forge-surface)",
                            border: "1px solid var(--forge-border)",
                            borderRadius: "8px",
                            fontFamily: "monospace",
                            fontSize: "12px",
                            color: "var(--indigo)",
                          }}
                          formatter={(val: unknown, name: unknown) => [`${val}%`, String(name).toUpperCase()]}
                        />
                        <Legend wrapperStyle={{ fontFamily: "monospace", fontSize: "11px" }} />
                        <Bar dataKey="f1" fill="var(--coral)" name="F1 Score %" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="recall" fill="var(--teal)" name="Recall %" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="precision" fill="var(--violet)" name="Precision %" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
