"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  FileJson,
  PlayCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useProgress } from "@/lib/storage/progress";
import { ProgressRing } from "@/components/academy/progress-ring";
import { ProgressModal } from "@/components/academy/progress-modal";
import { CURRICULUM_MODULES } from "@/content/modules";
import {
  staggerContainerVariants,
  fadeUpVariants,
  fadeUpReducedVariants,
  createReducedMotionVariant,
} from "@/lib/motion/index";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

export function AcademyGrid() {
  const { progress } = useProgress();
  const prefersReducedMotion = useReducedMotion();
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Total lessons across curriculum
  const totalLessons = React.useMemo(
    () => CURRICULUM_MODULES.reduce((acc, m) => acc + m.lessons.length, 0),
    []
  );

  // Total completed lessons
  const totalCompleted = progress.completedLessonIds.length;
  const overallPercent = Math.min(
    100,
    Math.round((totalCompleted / (totalLessons || 1)) * 100)
  );

  const passedQuizzesCount = Object.keys(progress.quizScores || {}).length;

  const getFadeVariants = createReducedMotionVariant(
    fadeUpVariants,
    fadeUpReducedVariants
  );

  return (
    <div className="space-y-10">
      {/* Top Banner & Telemetry Header */}
      <div className="relative overflow-hidden rounded-forge-2xl border border-forge-border bg-gradient-to-br from-forge-surface via-forge-black to-forge-950 p-6 sm:p-8 shadow-forge">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-forge bg-ember-500/10 px-3 py-1 text-xs font-mono font-semibold text-ember-400 border border-ember-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>PromptForge Curriculum · 10 Modules</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-forge-text">
              The Engineering Curriculum
            </h1>
            <p className="text-xs sm:text-sm text-forge-muted leading-relaxed">
              From subword token matrices to autonomous multi-agent swarms and CI/CD evaluation gates.
              Every module couples architectural mental models with side-by-side interactive lab experiments.
            </p>
          </div>

          {/* Quick Metrics & Overall Ring */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-forge-xl border border-forge-border bg-forge-elevated/70 p-4 sm:p-5 backdrop-blur-sm">
            <ProgressRing
              percent={overallPercent}
              size={64}
              strokeWidth={5}
              accent="amber"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-forge-muted uppercase tracking-wider">
                <span>Curriculum Progress</span>
              </div>
              <div className="font-mono text-lg font-bold text-forge-text">
                {totalCompleted} / {totalLessons}{" "}
                <span className="text-xs font-normal text-forge-subtle">
                  ({overallPercent}%)
                </span>
              </div>
              <div className="text-[11px] font-mono text-cyan-400">
                {passedQuizzesCount} Quizzes Completed
              </div>
            </div>
          </div>
        </div>

        {/* Global Curriculum Controls & Last Visited Resume */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-forge-border/60 pt-4">
          <div className="flex items-center gap-2">
            {progress.lastVisited && (
              <Link
                href={`/academy/${progress.lastVisited.moduleId}/${progress.lastVisited.lessonId}`}
              >
                <Button
                  size="sm"
                  className="bg-ember-500 hover:bg-ember-600 text-white text-xs flex items-center gap-2 shadow-ember-sm"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Resume Last Lesson</span>
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="text-xs flex items-center gap-1.5 border-forge-border hover:bg-forge-elevated"
            >
              <FileJson className="h-3.5 w-3.5 text-ember-400" />
              <span>Export / Import Progress</span>
            </Button>
          </div>

          <div className="text-[11px] font-mono text-forge-subtle">
            All progress saved locally · Privacy-first
          </div>
        </div>
      </div>

      {/* 10 Module Grid with Staggered Reveal and Hover Lift */}
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {CURRICULUM_MODULES.map((mod) => {
          // Calculate module completed count
          const completedInModule = mod.lessons.filter((l) =>
            progress.completedLessonIds.includes(l.id)
          ).length;
          const modPercent = Math.round(
            (completedInModule / mod.lessons.length) * 100
          );
          const isComplete = modPercent === 100;

          // Target lesson to jump to: last visited in this module or first lesson
          const targetLessonId =
            progress.lastVisited?.moduleId === mod.id
              ? progress.lastVisited.lessonId
              : mod.lessons[0].id;

          return (
            <motion.div
              key={mod.id}
              variants={getFadeVariants(prefersReducedMotion)}
              whileHover={
                prefersReducedMotion
                  ? undefined
                  : { y: -5, transition: { duration: 0.2 } }
              }
              className="flex"
            >
              <Card
                className={cn(
                  "group relative flex w-full flex-col justify-between overflow-hidden rounded-forge-xl border bg-forge-surface p-5 sm:p-6 transition-all shadow-forge hover:border-ember-500/50 hover:shadow-ember-glow",
                  isComplete
                    ? "border-emerald-500/30"
                    : "border-forge-border"
                )}
              >
                {/* Top Badge & Progress Ring Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={mod.accent === "cyan" ? "cyan" : "ember"}
                        className="font-mono text-[10px] uppercase"
                      >
                        Module {mod.number.toString().padStart(2, "0")}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {mod.level}
                      </Badge>
                    </div>
                    <span className="font-mono text-[11px] text-forge-subtle block">
                      {mod.duration} · {mod.lessons.length} Lessons
                    </span>
                  </div>

                  <ProgressRing
                    percent={modPercent}
                    size={46}
                    strokeWidth={4}
                    accent={mod.accent === "cyan" ? "cyan" : "amber"}
                  />
                </div>

                {/* Module Title & Subtitle */}
                <div className="my-4 space-y-2">
                  <h3 className="text-lg font-bold text-forge-text group-hover:text-ember-400 transition-colors leading-snug">
                    {mod.title}
                  </h3>
                  <p className="text-xs text-forge-muted font-medium">
                    {mod.subtitle}
                  </p>
                  <p className="text-xs text-forge-subtle line-clamp-2 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                {/* Key Outcome */}
                <div className="mb-4 rounded-forge bg-forge-elevated/70 p-2.5 text-xs text-forge-muted border border-forge-border">
                  <span className="font-semibold text-forge-text block mb-0.5 text-[11px] uppercase tracking-wide text-cyan-400">
                    Target Outcome:
                  </span>
                  <span className="line-clamp-2 leading-relaxed text-[11px]">
                    {mod.outcome}
                  </span>
                </div>

                {/* Tags & Action Button */}
                <div className="space-y-4 pt-2 border-t border-forge-border/60">
                  <div className="flex flex-wrap gap-1.5">
                    {mod.tags.slice(0, 3).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="rounded bg-forge-elevated px-2 py-0.5 font-mono text-[10px] text-forge-subtle"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={`/academy/${mod.id}/${targetLessonId}`}
                    className="block w-full"
                  >
                    <Button
                      variant={isComplete ? "outline" : "default"}
                      size="sm"
                      className={cn(
                        "w-full text-xs font-semibold flex items-center justify-between group-hover:bg-ember-500 group-hover:text-white transition-all min-h-[38px]",
                        isComplete
                          ? "border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/30"
                          : "bg-forge-elevated text-forge-text border border-forge-border"
                      )}
                    >
                      <span>
                        {isComplete
                          ? "Review Module"
                          : completedInModule > 0
                          ? `Continue (${completedInModule}/${mod.lessons.length})`
                          : "Start Module"}
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Modal for Progress Export and Import */}
      <ProgressModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
