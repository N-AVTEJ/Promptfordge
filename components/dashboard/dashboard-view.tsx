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
  ExternalLink,
  CheckCircle2,
  Lock,
  PlayCircle,
  BarChart3,
} from "lucide-react";
import { useProgress } from "@/lib/storage/progress";
import { useChallenges } from "@/lib/storage/challenges";
import { getArenaProgress } from "@/lib/storage/arena";
import { getStorageItem, STORAGE_KEYS, CompareExperimentRecord } from "@/lib/storage/index";
import { getCurriculumStats } from "@/lib/dashboard/recommend";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { CURRICULUM_MODULES } from "@/content/modules";
import { cn } from "@/lib/utils";

interface ExperimentTelemetryItem {
  techniqueId?: string;
  formatComplianceSpread?: { mean?: number };
  latencySpread?: { mean?: number };
  outputTokensSpread?: { mean?: number };
}

interface ProgressRingProps {
  percentage: number;
  label?: string;
  sublabel?: string;
  strokeColor?: string;
  icon?: React.ReactNode;
  size?: number;
}

function ProgressRing({
  percentage,
  label,
  sublabel,
  strokeColor = "stroke-ultramarine",
  icon,
  size = 104,
}: ProgressRingProps) {
  const prefersReduced = useReducedMotion();
  const radius = size >= 100 ? 42 : size >= 64 ? 26 : 18;
  const strokeWidth = size >= 100 ? 8 : size >= 64 ? 5 : 3.5;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clampedPercent / 100) * circumference;
  const center = size / 2;

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          className="-rotate-90 transform"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
        >
          <circle
            cx={center}
            cy={center}
            r={radius}
            className="stroke-navy/10"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <motion.circle
            cx={center}
            cy={center}
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
          {icon && <div className="mb-0.5">{icon}</div>}
          <span
            className={cn(
              "font-mono font-bold text-navy",
              size >= 100 ? "text-lg" : size >= 64 ? "text-xs" : "text-[10px]"
            )}
          >
            {clampedPercent}%
          </span>
        </div>
      </div>

      {(label || sublabel) && (
        <div className="mt-3 space-y-0.5">
          {label && <h4 className="font-sans text-xs font-bold text-navy">{label}</h4>}
          {sublabel && <p className="font-mono text-[10px] text-navy/60">{sublabel}</p>}
        </div>
      )}
    </div>
  );
}

// Sample starter experiments when user history is empty
const STARTER_EXPERIMENTS: CompareExperimentRecord[] = [
  {
    id: "exp-starter-1",
    timestamp: 1715000000000,
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
    timestamp: 1714900000000,
    task: "Chain-of-thought mathematical reasoning over multi-step inventory constraints",
    model: "gemini-1.5-pro",
    temperature: 0.2,
    runsPerTechnique: 3,
    results: [
      {
        techniqueId: "zero-shot",
        formatComplianceSpread: { mean: 0.67, min: 0.5, max: 0.8, stdev: 0.1 },
        judgeClaritySpread: { mean: 0.6, min: 0.5, max: 0.7, stdev: 0.08 },
        latencySpread: { mean: 1200, min: 1100, max: 1300, stdev: 80, values: [110, 1200, 1300] },
        outputTokensSpread: { mean: 340, min: 320, max: 360, stdev: 16, values: [320, 340, 360] },
        costSpread: { mean: 0.0008, min: 0.0007, max: 0.0009, stdev: 0.00008, values: [0.0007, 0.0008, 0.0009] },
      },
    ],
  },
  {
    id: "exp-starter-3",
    timestamp: 1714800000000,
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

  // 12 Module Progress Rings from localStorage
  const moduleRingsData = useMemo(() => {
    return CURRICULUM_MODULES.map((m) => {
      const completedCount = m.lessons.filter((l) =>
        progress.completedLessonIds.includes(l.id)
      ).length;
      const totalCount = m.lessons.length;
      const percentage = Math.min(
        100,
        Math.round((completedCount / (totalCount || 1)) * 100)
      );
      return {
        module: m,
        completedCount,
        totalCount,
        percentage,
        isCompleted: percentage === 100,
      };
    });
  }, [progress.completedLessonIds]);

  // Step 6: "Next step": the first incomplete lesson plus its lab
  const nextStep = useMemo(() => {
    for (const m of CURRICULUM_MODULES) {
      for (const l of m.lessons) {
        if (!progress.completedLessonIds.includes(l.id)) {
          const defaultLab = m.labs[0];
          const labTarget = l.relatedLab || defaultLab?.route || "/labs";
          const taskParam = defaultLab?.loadsTask
            ? `?task=${encodeURIComponent(
                typeof defaultLab.loadsTask === "string"
                  ? defaultLab.loadsTask
                  : JSON.stringify(defaultLab.loadsTask)
              )}`
            : "";
          return {
            module: m,
            lesson: l,
            lab: defaultLab,
            labHref: `${labTarget}${taskParam}`,
            lessonHref: `/academy/${m.id}/${l.id}`,
          };
        }
      }
    }
    return null;
  }, [progress.completedLessonIds]);

  // Data-driven Module Completion Badges
  const moduleBadges = useMemo(() => {
    return moduleRingsData.map(({ module: m, completedCount, totalCount, percentage, isCompleted }) => {
      return {
        id: `badge-${m.id}`,
        moduleNumber: m.number,
        title: m.title,
        subtitle: m.subtitle,
        isUnlocked: isCompleted,
        progress: `${completedCount}/${totalCount}`,
        percentage,
      };
    });
  }, [moduleRingsData]);

  const unlockedBadgesCount = useMemo(
    () => moduleBadges.filter((b) => b.isUnlocked).length,
    [moduleBadges]
  );

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

  const challengesPercentage = Math.round(
    ((challenges.completedMissionIds.length || 0) / 9) * 100
  );

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-20 space-y-16">
      {/* 1. Welcome Header */}
      <div className="rounded-3xl border border-navy/10 bg-white p-8 sm:p-12 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-navy/15 bg-daylight px-3.5 py-1 text-xs font-mono font-semibold text-navy">
              <span className="h-2 w-2 rounded-full bg-ultramarine animate-pulse" />
              <span>Engineering Command Center · Zero Auth Wall</span>
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-navy">
              Engineering Dashboard
            </h1>
            <p className="max-w-[65ch] text-sm sm:text-base leading-[1.7] text-navy/75">
              Deterministic progress tracking across all {CURRICULUM_MODULES.length} modules,
              empirical multi-model experiment telemetry, and unlockable achievement milestones.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/challenges"
              className="inline-flex items-center gap-2 rounded-xl border border-marigold/40 bg-marigold/15 px-4 py-2.5 text-xs font-bold text-navy shadow-xs hover:bg-marigold/30 transition-colors"
            >
              <Trophy className="h-4 w-4 text-marigold-600" />
              <span>{challenges.totalPoints} Mission Pts</span>
            </Link>
            <Link
              href="/academy"
              className="inline-flex items-center gap-2 rounded-xl border border-navy/15 bg-daylight px-4 py-2.5 text-xs font-bold text-navy hover:bg-white transition-colors"
            >
              <BookOpen className="h-4 w-4 text-ultramarine" />
              <span>{CURRICULUM_MODULES.length} Academy Modules</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Step 6: "Next step" Hero (First incomplete lesson + its lab) */}
      <section aria-labelledby="next-step-heading">
        {nextStep ? (
          <div className="rounded-3xl border-2 border-ultramarine/30 bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-navy/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-ultramarine/10 px-3 py-1 font-mono text-xs font-bold text-ultramarine border border-ultramarine/20">
                  Next Step
                </span>
                <span className="text-xs font-mono text-navy/60">
                  First incomplete curriculum unit
                </span>
              </div>
              <span className="rounded-full bg-daylight px-3 py-1 font-mono text-xs font-semibold text-navy/70 border border-navy/10">
                Module {String(nextStep.module.number).padStart(2, "0")}
              </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-2xl">
                <span className="text-xs font-mono font-bold text-ultramarine">
                  Module {String(nextStep.module.number).padStart(2, "0")}: {nextStep.module.title}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-sans text-navy">
                  {nextStep.lesson.title}
                </h3>
                <p className="text-xs sm:text-sm text-navy/75 leading-relaxed">
                  {nextStep.lesson.summary}
                </p>
                {nextStep.lab && (
                  <div className="flex items-center gap-2 pt-2 text-xs font-mono text-navy/70">
                    <FlaskConical className="h-4 w-4 text-ultramarine" />
                    <span>Associated Lab: <strong className="text-navy">{nextStep.lab.title}</strong></span>
                    <span className="rounded bg-daylight px-2 py-0.5 text-[10px] font-bold text-navy/60 border border-navy/10">
                      {nextStep.lab.status === "full" ? "Full Lab" : "Lite"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                <Link
                  href={nextStep.lessonHref}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-ultramarine px-5 py-3 text-xs font-bold text-white shadow-xs hover:bg-ultramarine/90 transition-colors"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Launch Lesson</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {nextStep.lab && (
                  <Link
                    href={nextStep.labHref}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy/15 bg-daylight px-5 py-3 text-xs font-bold text-navy hover:bg-white hover:border-ultramarine/40 hover:text-ultramarine transition-colors"
                  >
                    <FlaskConical className="h-4 w-4 text-ultramarine" />
                    <span>Practice in Lab</span>
                  </Link>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-mint-300 bg-mint-50/50 p-8 text-center space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-mint-100 text-mint-800">
              <Trophy className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold font-sans text-navy">
              All {CURRICULUM_MODULES.length} Curriculum Modules Mastered! 🎉
            </h3>
            <p className="text-sm text-navy/70 max-w-lg mx-auto">
              You have completed every lesson across the curriculum. Test your prompt defense skills in the Security Arena or explore visual labs.
            </p>
            <div className="pt-2">
              <Link
                href="/arena"
                className="inline-flex items-center gap-2 rounded-xl bg-ultramarine px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-ultramarine/90 transition-colors"
              >
                <span>Launch Security Arena</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </section>

      {/* 3. Step 6: 12 Progress Rings from localStorage (one per module) */}
      <section aria-labelledby="rings-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy/10 pb-4">
          <div>
            <h2 id="rings-heading" className="font-sans text-2xl font-bold text-navy">
              Module Progress Rings
            </h2>
            <p className="mt-1 text-sm text-navy/70">
              Real-time progress rings for all {CURRICULUM_MODULES.length} modules synchronized with localStorage.
            </p>
          </div>
          <Link
            href="/academy"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ultramarine hover:underline"
          >
            <span>Academy Overview</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {moduleRingsData.map((item) => (
            <Link
              key={item.module.id}
              href={`/academy/${item.module.id}`}
              className="hover-lift flex flex-col items-center justify-between rounded-2xl border border-navy/10 bg-white p-4 text-center shadow-xs transition-all hover:border-ultramarine/40"
            >
              <div className="w-full flex items-center justify-between text-[11px] font-mono text-navy/50 mb-2">
                <span className="font-bold text-navy">M{String(item.module.number).padStart(2, "0")}</span>
                {item.isCompleted ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-mint-700" />
                ) : (
                  <span>{item.completedCount}/{item.totalCount}</span>
                )}
              </div>

              <ProgressRing
                percentage={item.percentage}
                size={68}
                strokeColor={item.isCompleted ? "stroke-mint" : "stroke-ultramarine"}
              />

              <div className="mt-3 w-full">
                <h4 className="font-sans text-xs font-bold text-navy truncate" title={item.module.title}>
                  {item.module.title}
                </h4>
                <p className="font-mono text-[10px] text-navy/50 mt-0.5">
                  {item.isCompleted ? "Mastered" : `${item.percentage}% Done`}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. Curriculum Summary Metrics (Curriculum, Quiz, Missions) */}
      <section aria-labelledby="summary-heading" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 id="summary-heading" className="font-sans text-xl font-bold text-navy">
            Curriculum Comprehension & Challenges
          </h2>
          <span className="font-mono text-xs text-navy/60">
            Composite metrics
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="rounded-2xl border border-navy/10 bg-white p-8 shadow-sm flex flex-col items-center justify-between">
            <ProgressRing
              percentage={stats.completionPercentage}
              label="Overall Curriculum"
              sublabel={`${stats.completedLessons} of ${stats.totalLessons} Lessons`}
              strokeColor="stroke-ultramarine"
              icon={<GraduationCap className="h-6 w-6 text-ultramarine" />}
            />
            <div className="mt-6 w-full pt-4 border-t border-navy/10 flex items-center justify-between text-xs font-mono text-navy/60">
              <span>Status:</span>
              <span className="text-ultramarine font-bold">
                {stats.completedLessons === stats.totalLessons ? "Complete" : "In Progress"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-8 shadow-sm flex flex-col items-center justify-between">
            <ProgressRing
              percentage={stats.quizzesPassPercentage}
              label="Quiz Comprehension"
              sublabel={`${stats.quizzesPassed} of ${stats.quizzesAttempted} Passed`}
              strokeColor="stroke-mint"
              icon={<Sparkles className="h-6 w-6 text-mint-700" />}
            />
            <div className="mt-6 w-full pt-4 border-t border-navy/10 flex items-center justify-between text-xs font-mono text-navy/60">
              <span>Passing Threshold:</span>
              <span className="text-navy font-bold">&ge; 66% Score</span>
            </div>
          </div>

          <div className="rounded-2xl border border-navy/10 bg-white p-8 shadow-sm flex flex-col items-center justify-between">
            <ProgressRing
              percentage={challengesPercentage}
              label="Missions & Badges"
              sublabel={`${challenges.completedMissionIds.length} of 9 Challenges`}
              strokeColor="stroke-marigold"
              icon={<Trophy className="h-6 w-6 text-marigold-600" />}
            />
            <div className="mt-6 w-full pt-4 border-t border-navy/10 flex items-center justify-between text-xs font-mono text-navy/60">
              <span>Arena Defense:</span>
              <span className="text-navy font-bold">
                {arenaProgress.completedLevels.length}/5 Levels Cleared
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Step 6: Data-Driven Module Completion Badges (Animated Unlock) */}
      <section aria-labelledby="badges-heading" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-navy/10 pb-4">
          <div>
            <h2 id="badges-heading" className="font-sans text-2xl font-bold text-navy flex items-center gap-2">
              <Trophy className="h-5 w-5 text-marigold-600" />
              <span>Module Completion Badges</span>
              <span className="rounded-full bg-daylight px-2.5 py-0.5 text-xs font-mono font-bold text-navy border border-navy/10">
                {unlockedBadgesCount} / {moduleBadges.length} Unlocked
              </span>
            </h2>
            <p className="mt-1 text-sm text-navy/70">
              Data-driven completion badges awarded upon 100% completion of each curriculum module.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {moduleBadges.map((badge) => (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.02 }}
              className={cn(
                "rounded-2xl p-5 border transition-all flex flex-col justify-between",
                badge.isUnlocked
                  ? "bg-white border-marigold/40 shadow-sm ring-1 ring-marigold/20"
                  : "bg-daylight/50 border-navy/10 opacity-75"
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-daylight px-2 py-0.5 font-mono text-[10px] font-bold text-navy border border-navy/10">
                    M{String(badge.moduleNumber).padStart(2, "0")}
                  </span>
                  {badge.isUnlocked ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-marigold/20 px-2 py-0.5 font-mono text-[10px] font-bold text-navy border border-marigold/30">
                      <Sparkles className="h-3 w-3 text-marigold-600" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-navy/40">
                      <Lock className="h-3 w-3" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <h4 className="font-sans text-sm font-bold text-navy line-clamp-1">
                  {badge.title}
                </h4>

                <p className="text-xs text-navy/60 font-mono">
                  {badge.isUnlocked
                    ? "Module fully mastered!"
                    : `${badge.progress} lessons completed`}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-navy/10 flex items-center justify-between text-[11px] font-mono">
                <span className="text-navy/50">Completion</span>
                <span className={badge.isUnlocked ? "font-bold text-mint-700" : "text-navy/60"}>
                  {badge.percentage}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. Step 6: Recent Experiments with Small Per-Metric Chart */}
      <section aria-labelledby="experiments-heading" className="space-y-6">
        <div className="flex items-center justify-between border-b border-navy/10 pb-4">
          <div>
            <h2 id="experiments-heading" className="font-sans text-2xl font-bold text-navy flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-ultramarine" />
              <span>Recent Experiments & Benchmark Telemetry</span>
            </h2>
            <p className="mt-1 max-w-[65ch] text-sm text-navy/70">
              Empirical multi-run benchmarks with per-metric compliance and latency sparklines.
            </p>
          </div>
          <Link
            href="/labs/compare"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-ultramarine hover:text-ultramarine/80 transition-colors"
          >
            <span>View compare lab</span>
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        {recentExperiments.length === 0 ? (
          <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center shadow-xs space-y-3">
            <p className="text-sm font-semibold text-navy">
              No empirical benchmark experiments recorded yet.
            </p>
            <p className="text-xs text-navy/60 font-mono">
              Run comparative prompt experiments to inspect latency, output tokens, and format compliance.
            </p>
            <Link
              href="/labs/compare"
              className="inline-flex items-center gap-2 rounded-xl bg-ultramarine px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-ultramarine/90 transition-colors mt-2"
            >
              <span>Launch Technique Comparison Lab</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {recentExperiments.map((exp) => (
              <div
                key={exp.id}
                className="hover-lift flex flex-col justify-between rounded-2xl border border-navy/10 bg-white p-6 shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-ultramarine">
                      {exp.model}
                    </span>
                    <span className="font-mono text-[11px] text-navy/50" suppressHydrationWarning>
                      {new Date(exp.timestamp).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="mt-4 font-sans text-sm font-bold text-navy line-clamp-2">
                    {exp.task || "Comparison Evaluation Benchmark"}
                  </h3>

                  {/* Per-Metric Comparison Chart */}
                  <div className="mt-4 rounded-xl bg-daylight p-3 space-y-2 border border-navy/5">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-navy/50 block">
                      Comparative Metrics ({exp.results?.length || 2} Techniques)
                    </span>

                    {exp.results?.slice(0, 2).map((rawRes, rIdx) => {
                      const res = rawRes as ExperimentTelemetryItem;
                      const compliance = Math.round((res.formatComplianceSpread?.mean ?? 0.8) * 100);
                      const latency = Math.round(res.latencySpread?.mean ?? 500);
                      return (
                        <div key={rIdx} className="space-y-1 font-mono text-[11px]">
                          <div className="flex justify-between text-navy/80">
                            <span className="font-semibold">{res.techniqueId}</span>
                            <span>{compliance}% format · {latency}ms</span>
                          </div>
                          {/* Mini visual bar */}
                          <div className="h-1.5 w-full bg-navy/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-ultramarine rounded-full"
                              style={{ width: `${Math.max(10, compliance)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-navy/10">
                  <button
                    type="button"
                    onClick={() => setSelectedExperiment(exp)}
                    className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-navy/15 bg-white py-2 text-xs font-bold text-navy hover:bg-daylight hover:border-ultramarine/40 hover:text-ultramarine transition-all"
                  >
                    <FlaskConical className="h-3.5 w-3.5" />
                    <span>Inspect Metrics</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Drawer for Experiment Details */}
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
              className="fixed inset-0 bg-navy/40 backdrop-blur-sm"
              aria-hidden="true"
            />

            {/* Slide-over Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: "0%" }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex h-full w-full max-w-lg flex-col border-l border-navy/10 bg-daylight p-8 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-navy/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ultramarine/10 text-ultramarine">
                    <FlaskConical className="h-4 w-4" />
                  </div>
                  <h3 id="drawer-title" className="font-sans text-lg font-bold text-navy">
                    Experiment Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedExperiment(null)}
                  className="rounded-lg p-1.5 text-navy/60 hover:bg-navy/5 hover:text-navy"
                  aria-label="Close details drawer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-navy/50 block mb-1">
                    Evaluated Task
                  </span>
                  <p className="font-sans text-base font-semibold text-navy">
                    {selectedExperiment.task}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl border border-navy/10 bg-white p-4">
                    <span className="text-[11px] font-mono text-navy/60 block">Model</span>
                    <span className="font-mono text-sm font-bold text-ultramarine">{selectedExperiment.model}</span>
                  </div>
                  <div className="rounded-xl border border-navy/10 bg-white p-4">
                    <span className="text-[11px] font-mono text-navy/60 block">Temperature</span>
                    <span className="font-mono text-sm font-bold text-navy">{selectedExperiment.temperature}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-sans text-sm font-bold uppercase tracking-wider text-navy/60">
                    Technique Benchmark Results
                  </h4>

                  {selectedExperiment.results?.map((rawItem, i: number) => {
                    const res = rawItem as ExperimentTelemetryItem;
                    return (
                      <div key={i} className="rounded-xl border border-navy/10 bg-white p-5 space-y-3">
                        <div className="flex items-center justify-between border-b border-navy/10 pb-2">
                          <span className="font-mono text-xs font-bold text-navy uppercase">
                            {res.techniqueId}
                          </span>
                          <span className="font-mono text-xs font-bold text-mint-700">
                            {Math.round((res.formatComplianceSpread?.mean ?? 1) * 100)}% Compliance
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs font-mono text-navy/80">
                          <div>
                            <span className="text-navy/50 block">Mean Latency</span>
                            <span>{Math.round(res.latencySpread?.mean ?? 0)} ms</span>
                          </div>
                          <div>
                            <span className="text-navy/50 block">Tokens</span>
                            <span>{Math.round(res.outputTokensSpread?.mean ?? 0)} toks</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-navy/10">
                  <Link
                    href="/labs/compare"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ultramarine px-5 py-3 text-xs font-bold text-white shadow-xs transition-all hover:bg-ultramarine/90"
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
