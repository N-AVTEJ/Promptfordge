"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  Trophy,
  ArrowRight,
  BookOpen,
  FlaskConical,
  X,
  RotateCcw,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useProgress } from "@/lib/storage/progress";
import { useChallenges } from "@/lib/storage/challenges";
import { getArenaProgress } from "@/lib/storage/arena";
import { getStorageItem, STORAGE_KEYS, CompareExperimentRecord } from "@/lib/storage/index";
import { getSuggestedNextLesson, getCurriculumStats } from "@/lib/dashboard/recommend";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { CURRICULUM_MODULES } from "@/content/modules";

interface ProgressRingProps {
  percentage: number;
  label: string;
  sublabel: string;
  strokeColor: string;
  icon: React.ReactNode;
}

function ProgressRing({
  percentage,
  label,
  sublabel,
  strokeColor,
  icon,
}: ProgressRingProps) {
  const prefersReduced = useReducedMotion();
  const radius = 42;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center">
        <svg className="h-32 w-32 -rotate-90 transform" viewBox="0 0 104 104" aria-hidden="true">
          <circle
            cx="52"
            cy="52"
            r={radius}
            className="stroke-indigo-950/10"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <motion.circle
            cx="52"
            cy="52"
            r={radius}
            className={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={
              prefersReduced ? { duration: 0 } : { duration: 0.8, ease: "easeOut" }
            }
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-indigo-900/60 mb-0.5">{icon}</div>
          <span className="font-mono text-lg font-bold text-indigo">
            {clampedPercent}%
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-1">
        <h4 className="font-sans text-sm font-bold text-indigo">{label}</h4>
        <p className="font-mono text-xs text-indigo-900/60">{sublabel}</p>
      </div>
    </div>
  );
}

// Sample starter experiments when user history is empty
const STARTER_EXPERIMENTS: CompareExperimentRecord[] = [
  {
    id: "exp-starter-1",
    timestamp: Date.now() - 3600000 * 2,
    task: "Extract structured customer sentiment and entities into RFC8259 JSON",
    model: "gemini-1.5-flash",
    temperature: 0.7,
    runsPerTechnique: 3,
    results: [
      {
        techniqueId: "zero-shot",
        formatComplianceSpread: { mean: 0.33, min: 0, max: 0.67, stdev: 0.2 },
        judgeClaritySpread: { mean: 0.5, min: 0.4, max: 0.6, stdev: 0.1 },
        latencySpread: { mean: 650, min: 580, max: 720, stdev: 50, values: [580, 650, 720] },
        outputTokensSpread: { mean: 120, min: 110, max: 130, stdev: 8, values: [110, 120, 130] },
        costSpread: { mean: 0.0001, min: 0.00009, max: 0.00012, stdev: 0.00001, values: [0.00009, 0.0001, 0.00012] },
      },
      {
        techniqueId: "few-shot",
        formatComplianceSpread: { mean: 1.0, min: 1.0, max: 1.0, stdev: 0.0 },
        judgeClaritySpread: { mean: 0.95, min: 0.9, max: 1.0, stdev: 0.04 },
        latencySpread: { mean: 710, min: 690, max: 730, stdev: 15, values: [690, 710, 730] },
        outputTokensSpread: { mean: 95, min: 90, max: 100, stdev: 4, values: [90, 95, 100] },
        costSpread: { mean: 0.00014, min: 0.00013, max: 0.00015, stdev: 0.00001, values: [0.00013, 0.00014, 0.00015] },
      },
    ],
  },
  {
    id: "exp-starter-2",
    timestamp: Date.now() - 3600000 * 24,
    task: "Chain-of-thought mathematical reasoning over multi-step inventory constraints",
    model: "gemini-1.5-pro",
    temperature: 0.2,
    runsPerTechnique: 3,
    results: [
      {
        techniqueId: "zero-shot",
        formatComplianceSpread: { mean: 0.67, min: 0.5, max: 0.8, stdev: 0.1 },
        judgeClaritySpread: { mean: 0.6, min: 0.5, max: 0.7, stdev: 0.08 },
        latencySpread: { mean: 1200, min: 1100, max: 1300, stdev: 80, values: [1100, 1200, 1300] },
        outputTokensSpread: { mean: 340, min: 320, max: 360, stdev: 16, values: [320, 340, 360] },
        costSpread: { mean: 0.0008, min: 0.0007, max: 0.0009, stdev: 0.00008, values: [0.0007, 0.0008, 0.0009] },
      },
    ],
  },
  {
    id: "exp-starter-3",
    timestamp: Date.now() - 3600000 * 48,
    task: "Adversarial prompt injection boundary testing with strict system prompt delimitation",
    model: "gemini-1.5-flash",
    temperature: 0.0,
    runsPerTechnique: 3,
    results: [
      {
        techniqueId: "delimited-system",
        formatComplianceSpread: { mean: 1.0, min: 1.0, max: 1.0, stdev: 0.0 },
        judgeClaritySpread: { mean: 1.0, min: 1.0, max: 1.0, stdev: 0.0 },
        latencySpread: { mean: 490, min: 450, max: 530, stdev: 30, values: [450, 490, 530] },
        outputTokensSpread: { mean: 65, min: 60, max: 70, stdev: 4, values: [60, 65, 70] },
        costSpread: { mean: 0.00007, min: 0.00006, max: 0.00008, stdev: 0.00001, values: [0.00006, 0.00007, 0.00008] },
      },
    ],
  },
];

export function DashboardView() {
  const { progress, isHydrated } = useProgress();
  const { challenges } = useChallenges();
  const [selectedExperiment, setSelectedExperiment] = useState<CompareExperimentRecord | null>(null);

  // Arena progress
  const arenaProgress = useMemo(() => {
    if (!isHydrated) return { completedLevels: [], bestRedVsBlueFraction: null };
    return getArenaProgress();
  }, [isHydrated]);

  // Compare experiments (3 items)
  const recentExperiments = useMemo(() => {
    if (!isHydrated) return STARTER_EXPERIMENTS.slice(0, 3);
    const exps = getStorageItem(STORAGE_KEYS.COMPARE_EXPERIMENTS);
    if (!Array.isArray(exps) || exps.length === 0) {
      return STARTER_EXPERIMENTS.slice(0, 3);
    }
    const userExps = (exps as CompareExperimentRecord[]).slice(-3).reverse();
    if (userExps.length < 3) {
      const needed = 3 - userExps.length;
      return [...userExps, ...STARTER_EXPERIMENTS.slice(0, needed)];
    }
    return userExps.slice(0, 3);
  }, [isHydrated]);

  // Curriculum calculations
  const stats = useMemo(() => getCurriculumStats(progress), [progress]);
  const recommendation = useMemo(() => getSuggestedNextLesson(progress), [progress]);

  // Three lessons for "Continue learning"
  const continueLearningLessons = useMemo(() => {
    const list: Array<{
      module: typeof CURRICULUM_MODULES[0];
      lesson: typeof CURRICULUM_MODULES[0]["lessons"][0];
      badge: string;
      reason: string;
    }> = [];

    // 1. Recommended lesson
    list.push({
      module: recommendation.module,
      lesson: recommendation.lesson,
      badge: recommendation.isRemediation ? "Remediation Quiz" : "Recommended Next",
      reason: recommendation.reason,
    });

    // 2. Next sequential lesson or last visited
    const allLessons = CURRICULUM_MODULES.flatMap((m) =>
      m.lessons.map((l) => ({ module: m, lesson: l }))
    );
    const completedSet = new Set(progress.completedLessonIds);

    const nextUncompleted = allLessons.find(
      (item) => !completedSet.has(item.lesson.id) && item.lesson.id !== recommendation.lesson.id
    );

    if (nextUncompleted) {
      list.push({
        module: nextUncompleted.module,
        lesson: nextUncompleted.lesson,
        badge: `Module ${nextUncompleted.module.number}`,
        reason: nextUncompleted.lesson.summary,
      });
    } else {
      // Pick Module 2 Lesson 1 as fallback
      const fallback = allLessons[1] || allLessons[0];
      list.push({
        module: fallback.module,
        lesson: fallback.lesson,
        badge: "Milestone",
        reason: fallback.lesson.summary,
      });
    }

    // 3. Specialized / Advanced lesson
    const advancedLesson = allLessons.find(
      (item) => item.module.number >= 3 && !completedSet.has(item.lesson.id)
    ) || allLessons[2] || allLessons[0];

    list.push({
      module: advancedLesson.module,
      lesson: advancedLesson.lesson,
      badge: "Deep Dive",
      reason: advancedLesson.lesson.summary,
    });

    return list.slice(0, 3);
  }, [recommendation, progress]);

  // Percentage calculations
  const challengesPercentage = Math.round(
    ((challenges.completedMissionIds.length || 0) / 9) * 100
  );

  return (
    <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28 space-y-16">
      {/* 1. Welcome Header */}
      <div className="rounded-3xl border border-indigo-950/10 bg-white p-8 sm:p-12 shadow-card">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-4 py-1 text-xs font-bold text-teal">
              <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
              <span>Learner Telemetry Dashboard</span>
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-indigo">
              Engineering Command Center
            </h1>
            <p className="max-w-[65ch] text-base leading-[1.7] text-indigo-900/75">
              Deterministic curriculum progress, empirical laboratory runs, and
              sequential curriculum recommendations. Zero authentication wall.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 rounded-xl border border-coral/30 bg-coral/10 px-4 py-2.5 text-xs font-bold text-coral shadow-sm hover:bg-coral hover:text-white transition-colors"
            >
              <Trophy className="h-4 w-4" />
              <span>{challenges.totalPoints} Mission Pts</span>
            </Link>
            <Link
              href="/academy"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-950/10 bg-cream px-4 py-2.5 text-xs font-bold text-indigo hover:bg-white transition-colors"
            >
              <BookOpen className="h-4 w-4 text-violet" />
              <span>10 Academy Modules</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Three Summary Cards */}
      <section aria-labelledby="summary-heading" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 id="summary-heading" className="font-sans text-xl font-bold text-indigo">
            Curriculum Telemetry
          </h2>
          <span className="font-mono text-xs text-indigo-900/60">
            Real-time local storage metrics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Summary Card 1: Curriculum Progress */}
          <div className="rounded-2xl border border-indigo-950/10 bg-white p-8 shadow-card flex flex-col items-center justify-between">
            <ProgressRing
              percentage={stats.completionPercentage}
              label="Academy Curriculum"
              sublabel={`${stats.completedLessons} of ${stats.totalLessons} Lessons`}
              strokeColor="stroke-coral"
              icon={<GraduationCap className="h-6 w-6 text-coral" />}
            />
            <div className="mt-6 w-full pt-4 border-t border-indigo-950/10 flex items-center justify-between text-xs font-mono text-indigo-900/60">
              <span>Status:</span>
              <span className="text-coral font-bold">
                {stats.completedLessons === 30 ? "Curriculum Completed" : "In Progress"}
              </span>
            </div>
          </div>

          {/* Summary Card 2: Quiz Comprehension */}
          <div className="rounded-2xl border border-indigo-950/10 bg-white p-8 shadow-card flex flex-col items-center justify-between">
            <ProgressRing
              percentage={stats.quizzesPassPercentage}
              label="Quiz Comprehension"
              sublabel={`${stats.quizzesPassed} of ${stats.quizzesAttempted} Passed`}
              strokeColor="stroke-teal"
              icon={<Sparkles className="h-6 w-6 text-teal" />}
            />
            <div className="mt-6 w-full pt-4 border-t border-indigo-950/10 flex items-center justify-between text-xs font-mono text-indigo-900/60">
              <span>Passing Threshold:</span>
              <span className="text-teal font-bold">&ge; 66% Score</span>
            </div>
          </div>

          {/* Summary Card 3: Missions & Challenges */}
          <div className="rounded-2xl border border-indigo-950/10 bg-white p-8 shadow-card flex flex-col items-center justify-between">
            <ProgressRing
              percentage={challengesPercentage}
              label="Missions & Badges"
              sublabel={`${challenges.completedMissionIds.length} of 9 Challenges`}
              strokeColor="stroke-violet"
              icon={<Trophy className="h-6 w-6 text-violet" />}
            />
            <div className="mt-6 w-full pt-4 border-t border-indigo-950/10 flex items-center justify-between text-xs font-mono text-indigo-900/60">
              <span>Arena Defense:</span>
              <span className="text-violet font-bold">
                {arenaProgress.completedLevels.length}/5 Levels Cleared
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Continue Learning Section (3 items with View all link) */}
      <section aria-labelledby="continue-learning-heading" className="space-y-6">
        <div className="flex items-center justify-between border-b border-indigo-950/10 pb-4">
          <div>
            <h2 id="continue-learning-heading" className="font-sans text-2xl font-bold text-indigo">
              Continue Learning
            </h2>
            <p className="mt-1 max-w-[65ch] text-sm text-indigo-900/70">
              Sequential curriculum recommendations determined by deterministic progress rules.
            </p>
          </div>
          <Link
            href="/academy"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-coral hover:text-coral-600 transition-colors"
          >
            <span>View all modules</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {continueLearningLessons.map((item, idx) => (
            <div
              key={idx}
              className="hover-lift flex flex-col justify-between rounded-2xl border border-indigo-950/10 bg-white p-8 shadow-card"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-cream px-3 py-1 font-mono text-xs font-bold text-indigo border border-indigo-950/10">
                    Module {String(item.module.number).padStart(2, "0")}
                  </span>
                  <span className="rounded-full bg-coral/10 px-2.5 py-0.5 font-mono text-[11px] font-bold text-coral border border-coral/30">
                    {item.badge}
                  </span>
                </div>

                <h3 className="mt-5 font-sans text-lg font-bold text-indigo line-clamp-2">
                  {item.lesson.title}
                </h3>

                <p className="mt-3 text-sm leading-[1.7] text-indigo-900/75 line-clamp-3">
                  {item.reason}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-indigo-950/10">
                <Link
                  href={`/academy/${item.module.id}/${item.lesson.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-coral px-4 py-2.5 text-xs font-bold text-white shadow-coral-glow transition-all hover:bg-coral-600"
                >
                  <span>Launch Lesson Studio</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Recent Experiments Section (3 items with View all link) */}
      <section aria-labelledby="experiments-heading" className="space-y-6">
        <div className="flex items-center justify-between border-b border-indigo-950/10 pb-4">
          <div>
            <h2 id="experiments-heading" className="font-sans text-2xl font-bold text-indigo">
              Recent Experiments
            </h2>
            <p className="mt-1 max-w-[65ch] text-sm text-indigo-900/70">
              Empirical multi-run benchmarks comparing zero-shot vs few-shot schema compliance.
            </p>
          </div>
          <Link
            href="/labs/compare"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-teal hover:text-teal-600 transition-colors"
          >
            <span>View all experiments</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {recentExperiments.map((exp) => (
            <div
              key={exp.id}
              className="hover-lift flex flex-col justify-between rounded-2xl border border-indigo-950/10 bg-white p-8 shadow-card"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-teal">
                    {exp.model}
                  </span>
                  <span className="font-mono text-[11px] text-indigo-900/50">
                    {new Date(exp.timestamp).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="mt-5 font-sans text-base font-bold text-indigo line-clamp-2">
                  {exp.task || "Comparison Evaluation Benchmark"}
                </h3>

                <div className="mt-4 rounded-xl bg-cream/60 p-3.5 space-y-1.5 font-mono text-xs text-indigo-900/80 border border-indigo-950/5">
                  <div className="flex justify-between">
                    <span>Runs per technique:</span>
                    <span className="font-bold text-indigo">{exp.runsPerTechnique}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Techniques evaluated:</span>
                    <span className="font-bold text-indigo">{exp.results?.length || 2}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-indigo-950/10">
                <button
                  type="button"
                  onClick={() => setSelectedExperiment(exp)}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-indigo-950/15 bg-white py-2.5 text-xs font-bold text-indigo hover:bg-cream hover:border-teal/40 hover:text-teal transition-all"
                >
                  <FlaskConical className="h-3.5 w-3.5" />
                  <span>Inspect Telemetry Drawer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Drawer for Experiment Details (Opens in drawer, NOT inline!) */}
      <AnimatePresence>
        {selectedExperiment && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="drawer-title"
            className="fixed inset-0 z-50 flex justify-end"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedExperiment(null)}
              className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Slide-over Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-indigo-950/10 bg-cream p-8 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-indigo-950/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal/10 text-teal">
                    <FlaskConical className="h-4 w-4" />
                  </div>
                  <h3 id="drawer-title" className="font-sans text-lg font-bold text-indigo">
                    Experiment Telemetry
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedExperiment(null)}
                  className="rounded-lg p-1.5 text-indigo-900/60 hover:bg-indigo-950/5 hover:text-indigo"
                  aria-label="Close telemetry drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-indigo-900/50 block mb-1">
                    Evaluated Task
                  </span>
                  <p className="font-sans text-base font-semibold text-indigo">
                    {selectedExperiment.task}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-indigo-950/10 bg-white p-4">
                    <span className="text-[11px] font-mono text-indigo-900/60 block">Model</span>
                    <span className="font-mono text-sm font-bold text-teal">{selectedExperiment.model}</span>
                  </div>
                  <div className="rounded-xl border border-indigo-950/10 bg-white p-4">
                    <span className="text-[11px] font-mono text-indigo-900/60 block">Temperature</span>
                    <span className="font-mono text-sm font-bold text-indigo">{selectedExperiment.temperature}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-indigo-900/60">
                    Technique Benchmark Results
                  </h4>

                  {selectedExperiment.results?.map((res, i) => (
                    <div key={i} className="rounded-xl border border-indigo-950/10 bg-white p-5 space-y-3">
                      <div className="flex items-center justify-between border-b border-indigo-950/10 pb-2">
                        <span className="font-mono text-xs font-bold text-indigo uppercase">
                          {res.techniqueId}
                        </span>
                        <span className="font-mono text-xs font-bold text-teal">
                          {Math.round((res.formatComplianceSpread?.mean ?? 1) * 100)}% Compliance
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs font-mono text-indigo-900/80">
                        <div>
                          <span className="text-indigo-900/50 block">Mean Latency</span>
                          <span>{Math.round(res.latencySpread?.mean ?? 0)} ms</span>
                        </div>
                        <div>
                          <span className="text-indigo-900/50 block">Tokens</span>
                          <span>{Math.round(res.outputTokensSpread?.mean ?? 0)} toks</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-indigo-950/10">
                  <Link
                    href="/labs/compare"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal px-5 py-3 text-xs font-bold text-white shadow-teal-glow transition-all hover:bg-teal-600"
                  >
                    <span>Launch in Compare Lab</span>
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
