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
  Search,
  RotateCcw,
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
  const [searchQuery, setSearchQuery] = React.useState("");
  const [levelFilter, setLevelFilter] = React.useState<"all" | "beginner" | "intermediate" | "advanced">("all");

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

  const filteredModules = React.useMemo(() => {
    return CURRICULUM_MODULES.filter((module) => {
      // Level filter: beginner (Foundational), intermediate (Core), advanced (Advanced | Specialized)
      if (levelFilter === "beginner" && module.level !== "Foundational") return false;
      if (levelFilter === "intermediate" && module.level !== "Core") return false;
      if (
        levelFilter === "advanced" &&
        module.level !== "Advanced" &&
        module.level !== "Specialized"
      )
        return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = module.title.toLowerCase().includes(q);
        const inSubtitle = module.subtitle?.toLowerCase().includes(q);
        const inDesc = module.description?.toLowerCase().includes(q);
        const inSummary = module.summary?.toLowerCase().includes(q);
        const inTopics = module.topics?.some((t) => t.toLowerCase().includes(q));
        const inLessons = module.lessons.some((l) => l.title.toLowerCase().includes(q));
        if (!inTitle && !inSubtitle && !inDesc && !inSummary && !inTopics && !inLessons) {
          return false;
        }
      }
      return true;
    });
  }, [levelFilter, searchQuery]);

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

      {/* Search and Level Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 rounded-2xl border border-navy/10 bg-white p-4 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-navy/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search modules, lessons, topics..."
            className="w-full rounded-xl border border-navy/15 bg-daylight pl-10 pr-4 py-2 text-xs font-medium text-navy placeholder:text-navy/40 focus:border-ultramarine focus:outline-none focus:ring-1 focus:ring-ultramarine/30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 hover:text-navy text-xs font-mono"
            >
              Clear
            </button>
          )}
        </div>

        {/* Level Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-mono text-navy/50 mr-1 hidden md:inline">
            Level:
          </span>
          {(
            [
              { id: "all", label: "All Levels" },
              { id: "beginner", label: "Beginner" },
              { id: "intermediate", label: "Intermediate" },
              { id: "advanced", label: "Advanced" },
            ] as const
          ).map((filter) => {
            const active = levelFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setLevelFilter(filter.id)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  active
                    ? "bg-ultramarine text-white shadow-xs"
                    : "bg-daylight text-navy/70 hover:bg-navy/5 hover:text-navy"
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Curriculum Modules Grid (Max 3 cards per row: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8) */}
      {filteredModules.length === 0 ? (
        <div className="rounded-2xl border border-navy/10 bg-white p-12 text-center shadow-xs space-y-3">
          <p className="text-sm font-semibold text-navy">
            No modules match your current search and filter criteria.
          </p>
          <p className="text-xs text-navy/60 font-mono">
            Try clearing the search query or selecting &quot;All Levels&quot;.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchQuery("");
              setLevelFilter("all");
            }}
            className="text-xs gap-1.5 mt-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Filters</span>
          </Button>
        </div>
      ) : (
        <motion.div
          variants={staggerContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredModules.map((module) => {
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
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/academy/${module.id}`}
                          className="rounded-full bg-daylight px-3 py-1 font-mono text-xs font-bold text-navy border border-navy/10 hover:border-ultramarine hover:text-ultramarine transition-colors"
                        >
                          Module {String(module.number).padStart(2, "0")}
                        </Link>
                        <span className="rounded-md bg-navy/5 px-2 py-0.5 text-[10px] font-mono font-semibold text-navy/60">
                          {module.level}
                        </span>
                      </div>
                      <ProgressRing
                        percent={modulePercent}
                        size={36}
                        strokeWidth={3}
                        accent="amber"
                      />
                    </div>

                    <h2 className="mt-5 font-sans text-xl font-bold text-navy">
                      <Link
                        href={`/academy/${module.id}`}
                        className="hover:text-ultramarine transition-colors"
                      >
                        {module.title}
                      </Link>
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

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/academy/${module.id}`}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-navy/15 bg-white py-2 text-xs font-bold text-navy hover:bg-daylight transition-colors"
                      >
                        <span>Overview</span>
                      </Link>
                      <Link
                        href={targetLessonHref}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-ultramarine py-2 text-xs font-bold text-white shadow-xs hover:bg-ultramarine/90 transition-colors"
                      >
                        <span>Launch Studio</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Progress Export/Import Modal */}
      <ProgressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
