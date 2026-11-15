"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Sparkles,
  Trophy,
  Shield,
  ArrowRight,
  BookOpen,
  FlaskConical,
  FolderGit2,
  Bookmark,
  ExternalLink,
  Info,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
} from "lucide-react";
import { useProgress } from "@/lib/storage/progress";
import { useChallenges } from "@/lib/storage/challenges";
import { getArenaProgress } from "@/lib/storage/arena";
import { getSavedPrompts } from "@/lib/storage/library";
import { getStorageItem, STORAGE_KEYS, CompareExperimentRecord, StorageHistoryItem } from "@/lib/storage/index";
import { getSuggestedNextLesson, getCurriculumStats } from "@/lib/dashboard/recommend";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

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
  const radius = 38;
  const strokeWidth = 7;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clampedPercent / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#0E1015]/80 p-5 text-center transition-colors hover:border-white/[0.14]">
      <div className="relative flex items-center justify-center">
        <svg className="h-28 w-28 -rotate-90 transform" viewBox="0 0 96 96" aria-hidden="true">
          {/* Background circle */}
          <circle
            cx="48"
            cy="48"
            r={radius}
            className="stroke-white/[0.06]"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx="48"
            cy="48"
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

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-forge-muted">{icon}</div>
          <span className="font-mono text-base font-bold text-white">
            {clampedPercent}%
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-0.5">
        <h4 className="text-xs font-semibold text-white">{label}</h4>
        <p className="text-[11px] font-mono text-forge-muted">{sublabel}</p>
      </div>
    </div>
  );
}

export function DashboardView() {
  const { progress, isHydrated } = useProgress();
  const { challenges } = useChallenges();

  // Arena progress
  const arenaProgress = useMemo(() => {
    if (!isHydrated) return { completedLevels: [], bestRedVsBlueFraction: null };
    return getArenaProgress();
  }, [isHydrated]);

  // Saved prompts
  const savedPrompts = useMemo(() => {
    if (!isHydrated) return [];
    return getSavedPrompts();
  }, [isHydrated]);

  // Compare experiments
  const recentExperiments = useMemo(() => {
    if (!isHydrated) return [];
    const exps = getStorageItem(STORAGE_KEYS.COMPARE_EXPERIMENTS);
    if (!Array.isArray(exps)) return [];
    return (exps as CompareExperimentRecord[]).slice(-4).reverse();
  }, [isHydrated]);

  // Prompt execution history
  const recentHistory = useMemo(() => {
    if (!isHydrated) return [];
    const hist = getStorageItem(STORAGE_KEYS.HISTORY);
    if (!Array.isArray(hist)) return [];
    return (hist as StorageHistoryItem[]).slice(-3).reverse();
  }, [isHydrated]);

  // Curriculum calculations
  const stats = useMemo(() => getCurriculumStats(progress), [progress]);
  const recommendation = useMemo(() => getSuggestedNextLesson(progress), [progress]);

  // Progress ring values
  const arenaPercentage = Math.round(((arenaProgress.completedLevels.length || 0) / 5) * 100);
  const challengesPercentage = Math.round(
    ((challenges.completedMissionIds.length || 0) / 9) * 100
  );

  return (
    <div className="space-y-10 pb-16">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#14171E] to-[#0A0C10] p-6 sm:p-8">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-ember-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.1] bg-white/[0.04] px-3 py-1 text-xs font-mono text-cyan-400">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Learner Telemetry Dashboard</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Engineering Command Center
            </h1>
            <p className="max-w-2xl text-xs text-forge-muted sm:text-sm">
              Deterministic progress rings, recent laboratory runs, saved prompt blueprints, and
              sequential curriculum recommendations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/challenges"
              className="inline-flex items-center gap-1.5 rounded-md border border-ember-500/30 bg-ember-500/10 px-3 py-2 text-xs font-semibold text-ember-400 transition-colors hover:bg-ember-500/20"
            >
              <Trophy className="h-4 w-4" />
              <span>{challenges.totalPoints} Mission Pts</span>
            </Link>
            <Link
              href="/library"
              className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.1] bg-[#12141A] px-3 py-2 text-xs font-medium text-forge-text hover:text-white"
            >
              <Bookmark className="h-4 w-4 text-cyan-400" />
              <span>{savedPrompts.length} Prompts</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Progress Rings Section */}
      <section aria-labelledby="progress-rings-heading" className="space-y-4">
        <h2 id="progress-rings-heading" className="text-lg font-semibold text-white">
          Progress Telemetry
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ProgressRing
            percentage={stats.completionPercentage}
            label="Academy Curriculum"
            sublabel={`${stats.completedLessons} / ${stats.totalLessons} Lessons`}
            strokeColor="stroke-ember-500"
            icon={<GraduationCap className="h-4 w-4 text-ember-400" />}
          />
          <ProgressRing
            percentage={stats.quizzesPassPercentage}
            label="Quiz Comprehension"
            sublabel={`${stats.quizzesPassed} / ${stats.quizzesAttempted} Passed`}
            strokeColor="stroke-cyan-400"
            icon={<Sparkles className="h-4 w-4 text-cyan-400" />}
          />
          <ProgressRing
            percentage={challengesPercentage}
            label="Missions Completed"
            sublabel={`${challenges.completedMissionIds.length} / 9 Challenges`}
            strokeColor="stroke-amber-400"
            icon={<Trophy className="h-4 w-4 text-amber-400" />}
          />
          <ProgressRing
            percentage={arenaPercentage}
            label="Security Arena"
            sublabel={`${arenaProgress.completedLevels.length} / 5 Levels`}
            strokeColor="stroke-emerald-400"
            icon={<Shield className="h-4 w-4 text-emerald-400" />}
          />
        </div>
      </section>

      {/* Suggested Next Lesson Card (Rule-Based Recommender, NO AI claim) */}
      <section aria-labelledby="recommended-lesson-heading">
        <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-[#0E1015] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-ember-500/10 px-2 py-0.5 text-[10px] font-mono font-medium text-ember-400 border border-ember-500/30">
                  <BookOpen className="h-3 w-3" />
                  Suggested Next Lesson
                </span>
                <span className="inline-flex items-center gap-1 rounded bg-white/[0.05] px-2 py-0.5 text-[10px] font-mono text-forge-muted border border-white/[0.06]">
                  <Info className="h-3 w-3" />
                  Rule-based logic • No AI claim
                </span>
                {recommendation.isRemediation && (
                  <span className="inline-flex items-center gap-1 rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-mono text-rose-400 border border-rose-500/30">
                    <AlertTriangle className="h-3 w-3" />
                    Review Quiz
                  </span>
                )}
              </div>

              <div>
                <span className="text-xs font-mono text-cyan-400">
                  Module {recommendation.module.number}: {recommendation.module.title}
                </span>
                <h3 id="recommended-lesson-heading" className="text-xl font-bold text-white">
                  {recommendation.lesson.title}
                </h3>
              </div>

              <p className="max-w-2xl text-xs leading-relaxed text-forge-muted">
                {recommendation.reason}
              </p>
            </div>

            <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
              <Link
                href={`/academy/${recommendation.module.id}/${recommendation.lesson.id}`}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-ember-500 to-amber-500 px-4 py-2.5 text-xs font-semibold text-black transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500"
              >
                <span>{recommendation.isRemediation ? "Review Lesson" : "Continue Lesson"}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>

              {progress.lastVisited && (
                <Link
                  href={`/academy/${progress.lastVisited.moduleId}/${progress.lastVisited.lessonId}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-[#12141A] px-3.5 py-2.5 text-xs font-medium text-forge-text hover:text-white"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-forge-muted" />
                  <span>Resume Last Visited</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Layout: Recent Experiments & Saved Prompts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Experiments */}
        <section aria-labelledby="experiments-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-cyan-400" />
              <h2 id="experiments-heading" className="text-base font-semibold text-white">
                Recent Comparison Experiments
              </h2>
            </div>
            <Link
              href="/labs/compare"
              className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1"
            >
              <span>Launch Lab</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentExperiments.map((exp) => (
              <div
                key={exp.id}
                className="rounded-lg border border-white/[0.08] bg-[#0E1015] p-3.5 transition-colors hover:border-white/[0.14]"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-400">{exp.model}</span>
                  <span className="text-[11px] font-mono text-forge-muted">
                    {new Date(exp.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-white font-medium">
                  {exp.task}
                </p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-forge-muted">
                  <span>{exp.results?.length || 0} techniques compared</span>
                  <span>{exp.runsPerTechnique} runs each</span>
                </div>
              </div>
            ))}

            {recentExperiments.length === 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0E1015] p-8 text-center">
                <FlaskConical className="mx-auto h-7 w-7 text-forge-muted opacity-40" />
                <h4 className="mt-2 text-xs font-semibold text-white">No experiments yet</h4>
                <p className="mt-1 text-[11px] text-forge-muted">
                  Head to the Comparison Lab to benchmark Zero-Shot vs Few-Shot prompts.
                </p>
                <Link
                  href="/labs/compare"
                  className="mt-3 inline-flex items-center gap-1 rounded bg-[#181B22] px-3 py-1.5 text-xs text-forge-text hover:text-white"
                >
                  <span>Open Compare Lab</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Saved Prompts & Blueprints */}
        <section aria-labelledby="prompts-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bookmark className="h-5 w-5 text-ember-400" />
              <h2 id="prompts-heading" className="text-base font-semibold text-white">
                Saved Prompt Library ({savedPrompts.length})
              </h2>
            </div>
            <Link
              href="/library"
              className="text-xs text-ember-400 hover:text-ember-300 inline-flex items-center gap-1"
            >
              <span>View Library</span>
              <ExternalLink className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {savedPrompts.slice(0, 4).map((p) => {
              const versionCount = p.versions?.length || 1;
              const latestVersion = p.versions?.[p.versions.length - 1];
              const clarity = latestVersion?.metrics?.clarity;

              return (
                <div
                  key={p.id}
                  className="rounded-lg border border-white/[0.08] bg-[#0E1015] p-3.5 transition-colors hover:border-white/[0.14]"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white truncate max-w-[200px]">
                      {p.title}
                    </span>
                    <span className="font-mono text-[10px] text-forge-muted">
                      v{versionCount}.0
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-forge-muted">
                    {p.content}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-forge-muted">
                    <div className="flex gap-1.5">
                      {p.tags.slice(0, 2).map((t) => (
                        <span
                          key={t}
                          className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-mono text-cyan-400"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                    {clarity !== undefined && (
                      <span className="font-mono text-emerald-400">
                        Clarity: {Math.round(clarity)}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {savedPrompts.length === 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-[#0E1015] p-8 text-center">
                <Bookmark className="mx-auto h-7 w-7 text-forge-muted opacity-40" />
                <h4 className="mt-2 text-xs font-semibold text-white">No saved prompts yet</h4>
                <p className="mt-1 text-[11px] text-forge-muted">
                  Optimize prompts in the Optimizer Lab and save versioned blueprints here.
                </p>
                <Link
                  href="/labs/optimize"
                  className="mt-3 inline-flex items-center gap-1 rounded bg-[#181B22] px-3 py-1.5 text-xs text-forge-text hover:text-white"
                >
                  <span>Open Prompt Optimizer</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Quick Access Lab Matrix */}
      <section aria-labelledby="quick-matrix-heading" className="space-y-4">
        <h2 id="quick-matrix-heading" className="text-base font-semibold text-white">
          Prompt Engineering Sandbox Matrix
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Link
            href="/academy"
            className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#0E1015] p-4 text-center transition-all hover:border-ember-500/40 hover:bg-[#14161E]"
          >
            <GraduationCap className="h-5 w-5 text-ember-400" />
            <span className="mt-2 text-xs font-semibold text-white">Academy</span>
            <span className="text-[10px] text-forge-muted">10 Modules</span>
          </Link>

          <Link
            href="/labs/playground"
            className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#0E1015] p-4 text-center transition-all hover:border-cyan-500/40 hover:bg-[#14161E]"
          >
            <Play className="h-5 w-5 text-cyan-400" />
            <span className="mt-2 text-xs font-semibold text-white">Playground</span>
            <span className="text-[10px] text-forge-muted">Live Sandbox</span>
          </Link>

          <Link
            href="/labs/compare"
            className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#0E1015] p-4 text-center transition-all hover:border-amber-500/40 hover:bg-[#14161E]"
          >
            <FlaskConical className="h-5 w-5 text-amber-400" />
            <span className="mt-2 text-xs font-semibold text-white">Compare</span>
            <span className="text-[10px] text-forge-muted">Multi-Run Evals</span>
          </Link>

          <Link
            href="/arena"
            className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#0E1015] p-4 text-center transition-all hover:border-emerald-500/40 hover:bg-[#14161E]"
          >
            <Shield className="h-5 w-5 text-emerald-400" />
            <span className="mt-2 text-xs font-semibold text-white">Security</span>
            <span className="text-[10px] text-forge-muted">Red vs Blue</span>
          </Link>

          <Link
            href="/workflow"
            className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#0E1015] p-4 text-center transition-all hover:border-indigo-500/40 hover:bg-[#14161E]"
          >
            <FolderGit2 className="h-5 w-5 text-indigo-400" />
            <span className="mt-2 text-xs font-semibold text-white">Workflow</span>
            <span className="text-[10px] text-forge-muted">DAG Pipelines</span>
          </Link>

          <Link
            href="/challenges"
            className="flex flex-col items-center justify-center rounded-xl border border-white/[0.08] bg-[#0E1015] p-4 text-center transition-all hover:border-yellow-500/40 hover:bg-[#14161E]"
          >
            <Trophy className="h-5 w-5 text-yellow-400" />
            <span className="mt-2 text-xs font-semibold text-white">Challenges</span>
            <span className="text-[10px] text-forge-muted">Badges & Track</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
