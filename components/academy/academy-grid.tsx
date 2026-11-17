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
import { useProgress } from "@/lib/storage/progress";
import { cn } from "@/lib/utils";
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
      {/* Top Banner & Header */}
      <div className="rounded-3xl border border-navy/10 bg-white p-8 sm:p-12 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-ultramarine/10 px-3.5 py-1 text-xs font-mono font-bold text-ultramarine border border-ultramarine/20">
              <BookOpen className="h-4 w-4" />
              <span>PromptForge Curriculum · {CURRICULUM_MODULES.length} Modules</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-navy font-sans">
              The Engineering Curriculum
            </h1>
            <p className="text-sm sm:text-base text-navy/75 leading-[1.7] max-w-[65ch]">
              From subword token matrices to autonomous multi-agent swarms and CI/CD evaluation gates.
              Every module couples architectural mental models with side-by-side interactive lab experiments.
            </p>
          </div>

          {/* Quick Metrics & Overall Ring */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 rounded-2xl border border-navy/10 bg-daylight p-5 sm:p-6 shadow-xs">
            <ProgressRing
              percent={overallPercent}
              size={72}
              strokeWidth={6}
              accent="amber"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-navy/60 uppercase tracking-wider font-semibold">
                <span>Curriculum Progress</span>
              </div>
              <div className="font-mono text-xl font-bold text-navy">
                {totalCompleted} / {totalLessons}{" "}
                <span className="text-xs font-normal text-navy/60">
                  ({overallPercent}%)
                </span>
              </div>
              <div className="text-xs font-mono text-mint-700 font-semibold">
                {passedQuizzesCount} Quizzes Completed
              </div>
            </div>
          </div>
        </div>

        {/* Global Controls & Last Visited Resume */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-navy/10 pt-5">
          <div className="flex items-center gap-3">
            {progress.lastVisited && (
              <Link
                href={`/academy/${progress.lastVisited.moduleId}/${progress.lastVisited.lessonId}`}
                className="inline-flex items-center gap-2 rounded-xl bg-ultramarine px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-ultramarine/90 transition-colors"
              >
                <PlayCircle className="h-4 w-4" />
                <span>Resume Last Visited</span>
              </Link>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="text-xs flex items-center gap-1.5 border-navy/15 text-navy hover:bg-daylight hover:border-navy/25"
            >
              <FileJson className="h-3.5 w-3.5 text-ultramarine" />
              <span>Import / Export Progress</span>
            </Button>
          </div>

          <div className="text-xs font-mono text-navy/60">
            Open access curriculum · Complete hands-on training
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
              <div className="hover-lift flex h-full flex-col justify-between rounded-2xl border border-navy/10 bg-white p-8 shadow-sm">
                <div>
                  {/* Module Header */}
                  <div className="flex items-center justify-between border-b border-navy/10 pb-4">
                    <span className="rounded-full bg-daylight px-3 py-1 font-mono text-xs font-bold text-navy border border-navy/10">
                      Module {String(module.number).padStart(2, "0")}
                    </span>
                    <ProgressRing
                      percent={modulePercent}
                      size={36}
                      strokeWidth={3}
                      accent="amber"
                    />
                  </div>

                  <h2 className="mt-5 font-sans text-xl font-bold text-navy">
                    {module.title}
                  </h2>

                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-ultramarine font-mono">
                    {module.subtitle}
                  </p>

                  <p className="mt-3 text-sm leading-[1.7] text-navy/75">
                    {module.description}
                  </p>

                  {/* Lessons list in card */}
                  <div className="mt-6 space-y-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-navy/50 block">
                      Lessons in module:
                    </span>
                    {module.lessons.map((les, idx) => {
                      const isComplete = progress.completedLessonIds.includes(les.id);
                      return (
                        <Link
                          key={les.id}
                          href={`/academy/${module.id}/${les.id}`}
                          className="flex items-center justify-between rounded-lg bg-daylight p-2.5 text-xs text-navy hover:bg-daylight/70 border border-navy/5 transition-colors"
                        >
                          <span className="truncate pr-2">
                            {idx + 1}. {les.title}
                          </span>
                          <span
                            className={cn(
                              "font-mono text-[10px] font-bold shrink-0",
                              isComplete ? "text-mint-700" : "text-navy/40"
                            )}
                          >
                            {isComplete ? "✓ Done" : "Start"}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-navy/10">
                  <div className="flex items-center justify-between text-xs font-mono text-navy/60 mb-4 gap-2">
                    <span className="flex items-center gap-1.5" title={`${module.lessonCount} Lessons`}>
                      <BookOpen className="h-3.5 w-3.5 text-ultramarine" />
                      <span>{module.lessonCount} Lessons</span>
                    </span>
                    <span className="flex items-center gap-1.5" title={`${module.videoCount ?? 0} Videos`}>
                      <PlayCircle className="h-3.5 w-3.5 text-ultramarine" />
                      <span>{module.videoCount ?? 0} Videos</span>
                    </span>
                    <span className="flex items-center gap-1.5" title={`Total watch time: ${module.totalWatchTime || module.duration}`}>
                      <Clock className="h-3.5 w-3.5 text-navy/70" />
                      <span>{module.totalWatchTime || module.duration}</span>
                    </span>
                  </div>

                  <Link
                    href={targetLessonHref}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ultramarine px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-ultramarine/90 transition-colors"
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
