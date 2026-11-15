"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  FileJson,
  PlayCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const totalLessons = React.useMemo(
    () => CURRICULUM_MODULES.reduce((acc, m) => acc + m.lessons.length, 0),
    []
  );

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
    <div className="space-y-12">
      {/* Top Banner & Telemetry Header */}
      <div className="rounded-3xl border border-indigo-950/10 bg-white p-8 sm:p-12 shadow-card">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-coral/10 px-3.5 py-1 text-xs font-mono font-bold text-coral border border-coral/30">
              <BookOpen className="h-4 w-4" />
              <span>PromptForge Curriculum · 10 Modules</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-indigo font-sans">
              The Engineering Curriculum
            </h1>
            <p className="text-sm sm:text-base text-indigo-900/75 leading-[1.7] max-w-[65ch]">
              From subword token matrices to autonomous multi-agent swarms and CI/CD evaluation gates.
              Every module couples architectural mental models with side-by-side interactive lab experiments.
            </p>
          </div>

          {/* Quick Metrics & Overall Ring */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-2xl border border-indigo-950/10 bg-cream p-5 sm:p-6 shadow-sm">
            <ProgressRing
              percent={overallPercent}
              size={72}
              strokeWidth={6}
              accent="amber"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-indigo-900/60 uppercase tracking-wider font-semibold">
                <span>Curriculum Progress</span>
              </div>
              <div className="font-mono text-xl font-bold text-indigo">
                {totalCompleted} / {totalLessons}{" "}
                <span className="text-xs font-normal text-indigo-900/60">
                  ({overallPercent}%)
                </span>
              </div>
              <div className="text-xs font-mono text-teal font-medium">
                {passedQuizzesCount} Quizzes Completed
              </div>
            </div>
          </div>
        </div>

        {/* Global Controls & Last Visited Resume */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-indigo-950/10 pt-5">
          <div className="flex items-center gap-3">
            {progress.lastVisited && (
              <Link
                href={`/academy/${progress.lastVisited.moduleId}/${progress.lastVisited.lessonId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-coral px-4 py-2 text-xs font-bold text-white shadow-coral-glow hover:bg-coral-600 transition-colors"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Resume Last Visited</span>
              </Link>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="text-xs flex items-center gap-1.5"
            >
              <FileJson className="h-3.5 w-3.5 text-coral" />
              <span>Import / Export Progress</span>
            </Button>
          </div>

          <div className="text-xs font-mono text-indigo-900/60">
            Open access curriculum · 100% Client-side telemetry
          </div>
        </div>
      </div>

      {/* Curriculum Modules Grid (Max 3 cards per row: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8) */}
      <motion.div
        variants={staggerContainerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        {CURRICULUM_MODULES.map((module) => {
          const completedInThisModule = module.lessons.filter((l) =>
            progress.completedLessonIds.includes(l.id)
          ).length;
          const modulePercent = Math.min(
            100,
            Math.round((completedInThisModule / (module.lessons.length || 1)) * 100)
          );

          const firstLesson = module.lessons[0];
          const targetLessonHref = firstLesson
            ? `/academy/${module.id}/${firstLesson.id}`
            : `/academy/${module.id}`;

          return (
            <motion.div
              key={module.id}
              variants={getFadeVariants(prefersReducedMotion)}
              className="h-full"
            >
              <div className="hover-lift flex h-full flex-col justify-between rounded-2xl border border-indigo-950/10 bg-white p-8 shadow-card">
                <div>
                  {/* Module Header */}
                  <div className="flex items-center justify-between border-b border-indigo-950/10 pb-4">
                    <span className="rounded-full bg-cream px-3 py-1 font-mono text-xs font-bold text-indigo border border-indigo-950/10">
                      Module {String(module.number).padStart(2, "0")}
                    </span>
                    <ProgressRing
                      percent={modulePercent}
                      size={36}
                      strokeWidth={3}
                      accent="amber"
                    />
                  </div>

                  <h2 className="mt-5 font-sans text-xl font-bold text-indigo">
                    {module.title}
                  </h2>

                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-coral font-mono">
                    {module.subtitle}
                  </p>

                  <p className="mt-3 text-sm leading-[1.7] text-indigo-900/75">
                    {module.description}
                  </p>

                  {/* Lessons list in card */}
                  <div className="mt-6 space-y-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-900/50 block">
                      Lessons in module:
                    </span>
                    {module.lessons.map((les, idx) => {
                      const isComplete = progress.completedLessonIds.includes(les.id);
                      return (
                        <Link
                          key={les.id}
                          href={`/academy/${module.id}/${les.id}`}
                          className="flex items-center justify-between rounded-lg bg-cream/60 p-2.5 text-xs text-indigo hover:bg-cream border border-indigo-950/5 transition-colors"
                        >
                          <span className="truncate pr-2">
                            {idx + 1}. {les.title}
                          </span>
                          <span
                            className={cn(
                              "font-mono text-[10px] font-bold shrink-0",
                              isComplete ? "text-teal" : "text-indigo-900/40"
                            )}
                          >
                            {isComplete ? "✓ Done" : "Start"}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-indigo-950/10">
                  <div className="flex items-center justify-between text-xs font-mono text-indigo-900/60 mb-4">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5 text-violet" />
                      {module.lessonCount} Lessons
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-teal" />
                      {module.duration}
                    </span>
                  </div>

                  <Link
                    href={targetLessonHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-coral px-4 py-2.5 text-xs font-bold text-white shadow-coral-glow hover:bg-coral-600 transition-colors"
                  >
                    <span>Launch Studio</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Progress Export/Import Modal */}
      <ProgressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
