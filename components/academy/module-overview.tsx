"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  FlaskConical,
  PlayCircle,
  Sparkles,
} from "lucide-react";
import { CurriculumModule, CURRICULUM_MODULES } from "@/content/modules";
import { useProgress } from "@/lib/storage/progress";
import { ProgressRing } from "@/components/academy/progress-ring";
import { cn } from "@/lib/utils";

interface ModuleOverviewProps {
  module: CurriculumModule;
}

export function ModuleOverview({ module }: ModuleOverviewProps) {
  const { progress, toggleLesson } = useProgress();

  const completedCount = module.lessons.filter((l) =>
    progress.completedLessonIds.includes(l.id)
  ).length;
  const percent = Math.min(
    100,
    Math.round((completedCount / (module.lessons.length || 1)) * 100)
  );

  const prevModule = CURRICULUM_MODULES.find(
    (m) => m.number === module.number - 1
  );
  const nextModule = CURRICULUM_MODULES.find(
    (m) => m.number === module.number + 1
  );

  const defaultLab = module.labs[0];

  return (
    <div className="space-y-10">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-mono text-navy/60">
        <Link
          href="/academy"
          className="flex items-center gap-1 hover:text-ultramarine transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Curriculum</span>
        </Link>
        <span>/</span>
        <span className="text-navy font-bold">
          Module {String(module.number).padStart(2, "0")}
        </span>
      </nav>

      {/* Module Hero Banner */}
      <div className="rounded-3xl border border-navy/10 bg-white p-8 sm:p-12 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-ultramarine/10 px-3.5 py-1 text-xs font-mono font-bold text-ultramarine border border-ultramarine/20">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Module {String(module.number).padStart(2, "0")}</span>
              </span>
              <span className="rounded-full bg-daylight px-3 py-1 font-mono text-xs font-semibold text-navy/70 border border-navy/10">
                {module.level} Level
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-navy font-sans">
              {module.title}
            </h1>

            <p className="text-sm sm:text-base font-semibold text-ultramarine font-mono">
              {module.subtitle}
            </p>

            <p className="text-sm sm:text-base text-navy/75 leading-[1.7] max-w-[70ch]">
              {module.summary || module.description}
            </p>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-navy/70">
              <div className="flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-ultramarine" />
                <span>{module.lessons.length} Core Lessons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <PlayCircle className="h-4 w-4 text-ultramarine" />
                <span>{module.videoCount ?? module.videos?.length ?? 0} Technical Videos</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-navy/60" />
                <span>{module.totalWatchTime || module.duration || "45 mins"} Core Watch Time</span>
              </div>
            </div>
          </div>

          {/* Module Progress Ring Card */}
          <div className="flex flex-col items-center sm:items-start lg:items-center gap-4 rounded-2xl border border-navy/10 bg-daylight p-6 shadow-xs shrink-0 min-w-[200px]">
            <ProgressRing
              percent={percent}
              size={80}
              strokeWidth={7}
              accent="amber"
            />
            <div className="text-center sm:text-left lg:text-center space-y-1">
              <div className="text-xs font-mono text-navy/60 uppercase tracking-wider font-semibold">
                Module Completion
              </div>
              <div className="font-mono text-lg font-bold text-navy">
                {completedCount} / {module.lessons.length} Lessons
              </div>
              <div className="text-[11px] font-mono text-mint-700 font-semibold">
                {percent === 100 ? "Module Complete! 🎉" : `${percent}% Completed`}
              </div>
            </div>
            {module.lessons[0] && (
              <Link
                href={`/academy/${module.id}/${module.lessons[0].id}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-ultramarine px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-ultramarine/90 transition-colors"
              >
                <span>Launch Studio</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Key Takeaway & Topics */}
        <div className="mt-8 border-t border-navy/10 pt-6 space-y-4">
          {module.keyTakeaway && (
            <div className="rounded-2xl border border-ultramarine/20 bg-ultramarine/5 p-4 flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-ultramarine shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-ultramarine block mb-1">
                  Architectural Key Takeaway
                </span>
                <p className="text-xs sm:text-sm text-navy/85 leading-relaxed">
                  {module.keyTakeaway}
                </p>
              </div>
            </div>
          )}

          {module.topics && module.topics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-navy/50 mr-1">Topics:</span>
              {module.topics.map((topic, i) => (
                <span
                  key={i}
                  className="rounded-lg border border-navy/10 bg-daylight px-2.5 py-1 text-[11px] font-mono font-medium text-navy/80"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Associated Visual Labs Banner */}
      {module.labs && module.labs.length > 0 && (
        <section aria-labelledby="labs-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 id="labs-heading" className="text-xl font-bold font-sans text-navy flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-ultramarine" />
              <span>Associated Visual Laboratories</span>
            </h2>
            <Link
              href="/labs"
              className="text-xs font-mono text-ultramarine hover:underline flex items-center gap-1"
            >
              <span>All Labs Index</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {module.labs.map((lab) => {
              const taskParam = lab.loadsTask
                ? `?task=${encodeURIComponent(
                    typeof lab.loadsTask === "string"
                      ? lab.loadsTask
                      : JSON.stringify(lab.loadsTask)
                  )}`
                : "";
              const targetUrl = `${lab.route}${taskParam}`;

              return (
                <div
                  key={lab.id}
                  className="rounded-2xl border border-navy/10 bg-white p-6 shadow-xs flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-daylight px-2.5 py-0.5 font-mono text-[10px] font-bold text-navy border border-navy/10">
                        {lab.status === "full" ? "Full Interactive Lab" : "Lite Visualizer"}
                      </span>
                      <span className="text-[11px] font-mono text-navy/50">
                        {lab.route}
                      </span>
                    </div>
                    <h3 className="font-sans text-base font-bold text-navy">
                      {lab.title}
                    </h3>
                    {lab.loadsTask && (
                      <p className="text-xs text-navy/70 font-mono bg-daylight p-2.5 rounded-xl border border-navy/5">
                        Task: {typeof lab.loadsTask === "string" ? lab.loadsTask : "Structured evaluation task"}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-navy/10 flex items-center justify-between">
                    <span className="text-xs font-mono text-navy/50">
                      Module {String(module.number).padStart(2, "0")} Lab
                    </span>
                    <Link
                      href={targetUrl}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-ultramarine px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-ultramarine/90 transition-colors"
                    >
                      <span>Open Lab</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Sequential Lesson Timeline */}
      <section aria-labelledby="timeline-heading" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="timeline-heading" className="text-xl font-bold font-sans text-navy flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-ultramarine" />
            <span>Curriculum Lesson Timeline</span>
          </h2>
          <span className="text-xs font-mono text-navy/50">
            {module.lessons.length} sequential learning units
          </span>
        </div>

        <div className="rounded-3xl border border-navy/10 bg-white p-6 sm:p-8 shadow-sm divide-y divide-navy/10">
          {module.lessons.map((lesson, idx) => {
            const isComplete = progress.completedLessonIds.includes(lesson.id);
            const labTarget = lesson.relatedLab || defaultLab?.route || "/labs";
            const taskQuery = defaultLab?.loadsTask
              ? `?task=${encodeURIComponent(
                  typeof defaultLab.loadsTask === "string"
                    ? defaultLab.loadsTask
                    : JSON.stringify(defaultLab.loadsTask)
                )}`
              : "";
            const labHref = `${labTarget}${taskQuery}`;

            return (
              <div
                key={lesson.id}
                className={cn(
                  "py-5 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors",
                  isComplete ? "bg-mint-50/20" : ""
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => toggleLesson(lesson.id)}
                    className="mt-1 shrink-0 p-1 text-navy/40 hover:text-navy transition-colors"
                    title={isComplete ? "Mark incomplete" : "Mark complete"}
                    aria-label={
                      isComplete
                        ? `Mark ${lesson.title} incomplete`
                        : `Mark ${lesson.title} complete`
                    }
                  >
                    {isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-mint-700" />
                    ) : (
                      <Circle className="h-5 w-5 text-navy/30" />
                    )}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-ultramarine">
                        Lesson {String(module.number).padStart(2, "0")}.{idx + 1}
                      </span>
                      {lesson.chapters && (
                        <span className="rounded-md bg-daylight px-2 py-0.5 text-[10px] font-mono text-navy/60 border border-navy/5">
                          {lesson.chapters.length} chapters
                        </span>
                      )}
                      {lesson.quiz && lesson.quiz.length > 0 && (
                        <span className="rounded-md bg-mint-50 px-2 py-0.5 text-[10px] font-mono text-mint-800 border border-mint-200">
                          {lesson.quiz.length} Quiz Questions
                        </span>
                      )}
                    </div>

                    <h3 className="font-sans text-base font-bold text-navy">
                      <Link
                        href={`/academy/${module.id}/${lesson.id}`}
                        className="hover:text-ultramarine transition-colors"
                      >
                        {lesson.title}
                      </Link>
                    </h3>

                    {lesson.summary && (
                      <p className="text-xs sm:text-sm text-navy/70 leading-relaxed max-w-[65ch]">
                        {lesson.summary}
                      </p>
                    )}
                  </div>
                </div>

                {/* Lesson Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 ml-9 md:ml-0">
                  <Link
                    href={labHref}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-navy/15 bg-white px-3 py-2 text-xs font-bold text-navy hover:bg-daylight hover:border-ultramarine/40 hover:text-ultramarine transition-colors"
                    title={`Practice in ${lesson.relatedLab || "Lab"}`}
                  >
                    <FlaskConical className="h-3.5 w-3.5 text-ultramarine" />
                    <span>Practice this</span>
                  </Link>
                  <Link
                    href={`/academy/${module.id}/${lesson.id}`}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-ultramarine px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-ultramarine/90 transition-colors"
                  >
                    <span>Study Lesson</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Prev / Next Module Navigation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-navy/10 pt-6">
        {prevModule ? (
          <Link
            href={`/academy/${prevModule.id}`}
            className="inline-flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-xs font-bold text-navy hover:bg-daylight transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>
              Previous: Module {String(prevModule.number).padStart(2, "0")} · {prevModule.title}
            </span>
          </Link>
        ) : (
          <div />
        )}

        {nextModule ? (
          <Link
            href={`/academy/${nextModule.id}`}
            className="inline-flex items-center gap-2 rounded-xl bg-ultramarine px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-ultramarine/90 transition-colors"
          >
            <span>
              Next: Module {String(nextModule.number).padStart(2, "0")} · {nextModule.title}
            </span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
