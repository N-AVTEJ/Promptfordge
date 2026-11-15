"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Circle,
  BookOpen,
  Terminal,
  HelpCircle,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  FileJson,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProgress } from "@/lib/storage/progress";
import { ProgressRing } from "@/components/academy/progress-ring";
import { YouTubePlayer, type YouTubePlayerRef } from "@/components/academy/youtube-player";
import { TimestampChips } from "@/components/academy/timestamp-chips";
import { QuizCard } from "@/components/academy/quiz-card";
import { NotesPanel } from "@/components/academy/notes-panel";
import { LabSlotPanel } from "@/components/academy/lab-slot-panel";
import { ProgressModal } from "@/components/academy/progress-modal";
import type { CurriculumModule, Lesson } from "@/content/modules";

export interface LessonStudioProps {
  module: CurriculumModule;
  lesson: Lesson;
  nextLesson?: { moduleId: string; lessonId: string; title: string };
  prevLesson?: { moduleId: string; lessonId: string; title: string };
  allModules?: CurriculumModule[];
}

export function LessonStudio({
  module,
  lesson,
  nextLesson,
  prevLesson,
}: LessonStudioProps) {
  const { progress, toggleLesson, visitLesson } = useProgress();
  const router = useRouter();

  // YouTube player imperative seek ref
  const playerRef = React.useRef<YouTubePlayerRef>(null);

  // Active second from player playback
  const [currentPlaybackSecond, setCurrentPlaybackSecond] = React.useState(0);

  // Right panel tabs: "notes" | "lab" | "quiz"
  const [rightTab, setRightTab] = React.useState<"notes" | "lab" | "quiz">("notes");

  // Mobile layout tabs (< 1024px): "outline" | "center" | "right"
  const [mobileTab, setMobileTab] = React.useState<"outline" | "center" | "right">("center");

  // Progress modal
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Custom prompt sent from practice challenge to lab
  const [customLabPrompt, setCustomLabPrompt] = React.useState<string | undefined>(undefined);

  // Full keyboard navigation pass
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (
        (e.key === "[" || (e.altKey && e.key === "ArrowLeft")) &&
        prevLesson
      ) {
        e.preventDefault();
        router.push(`/academy/${prevLesson.moduleId}/${prevLesson.lessonId}`);
      } else if (
        (e.key === "]" || (e.altKey && e.key === "ArrowRight")) &&
        nextLesson
      ) {
        e.preventDefault();
        router.push(`/academy/${nextLesson.moduleId}/${nextLesson.lessonId}`);
      } else if (e.key === "1" || (e.altKey && e.key === "1")) {
        e.preventDefault();
        setRightTab("notes");
        setMobileTab("right");
      } else if (e.key === "2" || (e.altKey && e.key === "2")) {
        e.preventDefault();
        setRightTab("lab");
        setMobileTab("right");
      } else if (e.key === "3" || (e.altKey && e.key === "3")) {
        e.preventDefault();
        setRightTab("quiz");
        setMobileTab("right");
      } else if (e.key === "m" || (e.altKey && e.key === "m")) {
        e.preventDefault();
        toggleLesson(lesson.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router, prevLesson, nextLesson, lesson.id, toggleLesson]);

  // Register last visited and reset transient state on lesson change
  React.useEffect(() => {
    visitLesson(module.id, lesson.id);
    setCustomLabPrompt(undefined);
    setCurrentPlaybackSecond(0);
  }, [module.id, lesson.id, visitLesson]);

  // Handle seek requested by chapter chips
  const handleSeek = (seconds: number) => {
    playerRef.current?.seekTo(seconds);
    setCurrentPlaybackSecond(seconds);
  };

  // Calculate module completion percentage
  const completedInModule = module.lessons.filter((l) =>
    progress.completedLessonIds.includes(l.id)
  ).length;
  const modulePercent = Math.round((completedInModule / module.lessons.length) * 100);

  const isCurrentLessonComplete = progress.completedLessonIds.includes(lesson.id);
  const quizScore = progress.quizScores?.[lesson.id];

  const handleSendToLab = () => {
    setCustomLabPrompt(lesson.practiceChallenge.starterPrompt);
    setRightTab("lab");
    setMobileTab("right");
  };

  return (
    <div className="flex min-h-screen flex-col bg-forge-950 text-forge-text">
      {/* Studio Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#0A0C0F]/95 px-4 sm:px-6 backdrop-blur-md">
        {/* Breadcrumb / Back to Academy */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm min-w-0 flex-1 mr-2">
          <Link
            href="/academy"
            className="flex items-center gap-1 sm:gap-1.5 text-zinc-400 hover:text-white transition-colors shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium hidden xs:inline">Academy</span>
          </Link>
          <span className="text-zinc-600 shrink-0">/</span>
          <span className="font-mono text-xs text-zinc-400 hidden md:inline shrink-0">
            Mod {module.number.toString().padStart(2, "0")}
          </span>
          <span className="text-zinc-600 hidden md:inline shrink-0">/</span>
          <span className="font-medium text-forge-text truncate max-w-[90px] xs:max-w-[140px] sm:max-w-[280px]">
            {lesson.title}
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Progress Ring / Module Progress */}
          <div className="flex items-center gap-2">
            <ProgressRing
              percent={modulePercent}
              size={30}
              strokeWidth={3}
              accent={module.accent === "cyan" ? "cyan" : "amber"}
            />
            <span className="text-xs font-mono text-zinc-400 hidden md:inline">
              {completedInModule}/{module.lessons.length} done
            </span>
          </div>

          {/* Progress Import/Export Modal Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-8 px-2 sm:px-3 text-xs flex items-center gap-1.5 border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:bg-white/[0.08]"
            title="Export or Import Progress"
          >
            <FileJson className="h-3.5 w-3.5 text-ember-400" />
            <span className="hidden sm:inline">Progress sync</span>
          </Button>

          {/* Mark Complete Quick Toggle */}
          <Button
            variant={isCurrentLessonComplete ? "outline" : "default"}
            size="sm"
            onClick={() => toggleLesson(lesson.id)}
            className={cn(
              "h-8 px-2 sm:px-3 text-xs flex items-center gap-1.5 font-medium transition-all",
              isCurrentLessonComplete
                ? "border-emerald-500/40 text-emerald-400 bg-emerald-950/20 hover:bg-emerald-950/40"
                : "bg-ember-500 hover:bg-ember-600 text-black font-semibold"
            )}
          >
            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden xs:inline">
              {isCurrentLessonComplete ? "Completed" : "Mark complete"}
            </span>
            <span className="xs:hidden">
              {isCurrentLessonComplete ? "Done" : "Mark"}
            </span>
          </Button>
        </div>
      </header>

      {/* Mobile Screen Tab Navigation (< 1024px) */}
      <div className="lg:hidden sticky top-14 z-20 flex border-b border-forge-border bg-forge-elevated">
        <button
          type="button"
          onClick={() => setMobileTab("outline")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold uppercase tracking-wider text-center border-b-2 transition-colors",
            mobileTab === "outline"
              ? "border-ember-500 text-ember-400 bg-forge-surface"
              : "border-transparent text-forge-muted hover:text-forge-text"
          )}
        >
          <span className="hidden sm:inline">1. </span>Outline
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("center")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold uppercase tracking-wider text-center border-b-2 transition-colors",
            mobileTab === "center"
              ? "border-ember-500 text-ember-400 bg-forge-surface"
              : "border-transparent text-forge-muted hover:text-forge-text"
          )}
        >
          <span className="hidden sm:inline">2. </span>
          <span className="sm:hidden">Video</span>
          <span className="hidden sm:inline">Lesson & Video</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("right")}
          className={cn(
            "flex-1 py-2 text-xs font-semibold uppercase tracking-wider text-center border-b-2 transition-colors",
            mobileTab === "right"
              ? "border-ember-500 text-ember-400 bg-forge-surface"
              : "border-transparent text-forge-muted hover:text-forge-text"
          )}
        >
          <span className="hidden sm:inline">3. </span>Lab & Notes
        </button>
      </div>

      {/* Main Studio Body: 3 Panels */}
      <main className="flex-1 w-full max-w-[1800px] mx-auto p-3 sm:p-4 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* ============================================================== */}
          {/* PANEL 1 (LEFT): Module Curriculum & Chapter List (Cols: 3/12) */}
          {/* ============================================================== */}
          <aside
            className={cn(
              "lg:col-span-3 rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#11141A] to-[#0A0C0F] p-4 space-y-5 lg:sticky lg:top-20",
              mobileTab !== "outline" && "hidden lg:block"
            )}
          >
            {/* Module Card Mini-Header */}
            <div className="space-y-2 border-b border-white/[0.06] pb-4">
              <div className="flex items-center justify-between">
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono uppercase border-white/[0.1] bg-white/[0.04] text-zinc-300"
                >
                  Module {module.number}
                </Badge>
                <span className="text-[11px] font-mono text-zinc-400">
                  {module.duration}
                </span>
              </div>
              <h2 className="text-sm font-bold text-forge-text leading-snug">
                {module.title}
              </h2>
              <div className="flex items-center gap-2 pt-1">
                <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-ember-500 to-cyan-400 transition-all duration-500"
                    style={{ width: `${modulePercent}%` }}
                  />
                </div>
                <span className="text-[11px] font-mono text-zinc-400">
                  {modulePercent}%
                </span>
              </div>
            </div>

            {/* Lessons List in this Module */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 px-1">
                Lessons in this module
              </div>

              {module.lessons.map((les, idx) => {
                const isActive = les.id === lesson.id;
                const isComplete = progress.completedLessonIds.includes(les.id);
                const score = progress.quizScores?.[les.id];

                return (
                  <div key={les.id} className="space-y-1">
                    <div
                      className={cn(
                        "group flex items-center justify-between rounded-lg p-2 transition-all border",
                        isActive
                          ? "bg-white/[0.06] border-ember-500/40 text-amber-300"
                          : "bg-transparent border-transparent hover:bg-white/[0.03] hover:border-white/[0.06]"
                      )}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLesson(les.id);
                        }}
                        className="shrink-0 p-1 text-zinc-500 hover:text-emerald-400 transition-colors"
                        title={isComplete ? "Mark incomplete" : "Mark complete"}
                        aria-label={
                          isComplete
                            ? `Mark ${les.title} incomplete`
                            : `Mark ${les.title} complete`
                        }
                      >
                        {isComplete ? (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Circle className="h-4 w-4 text-zinc-600" />
                        )}
                      </button>

                      <Link
                        href={`/academy/${module.id}/${les.id}`}
                        className="flex-1 flex items-center justify-between min-w-0 px-2 group/link"
                      >
                        <div className="min-w-0 flex-1">
                          <div
                            className={cn(
                              "text-xs truncate leading-tight font-mono",
                              isActive
                                ? "text-amber-300 font-semibold"
                                : "text-zinc-300 group-hover/link:text-white"
                            )}
                          >
                            {idx + 1}. {les.title}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                            <span>{les.chapters.length} chapters</span>
                            {score !== undefined && (
                              <span className="text-cyan-400 font-mono">
                                Quiz: {score}/{les.quiz.length}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight
                          className={cn(
                            "h-3.5 w-3.5 shrink-0 transition-transform ml-1",
                            isActive
                              ? "text-amber-400 translate-x-0.5"
                              : "text-zinc-600 opacity-40 group-hover/link:opacity-100"
                          )}
                        />
                      </Link>
                    </div>

                    {/* Expandable Chapters under Active Lesson */}
                    {isActive && (
                      <div className="ml-6 border-l border-white/[0.08] pl-3 py-1 space-y-1">
                        {les.chapters.map((chap, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => handleSeek(chap.time)}
                            className="flex w-full items-center justify-between text-left text-[11px] text-zinc-400 hover:text-amber-400 py-1 transition-colors group"
                          >
                            <span className="truncate pr-1 group-hover:underline">
                              {chap.label}
                            </span>
                            <span className="font-mono text-[10px] text-zinc-500 shrink-0">
                              {Math.floor(chap.time / 60)}:
                              {(chap.time % 60).toString().padStart(2, "0")}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Adjacent Lessons Navigation Footer */}
            <div className="border-t border-forge-border pt-4 space-y-2">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-forge-muted px-1">
                Curriculum Progression
              </div>
              <div className="grid grid-cols-2 gap-2">
                {prevLesson ? (
                  <Link href={`/academy/${prevLesson.moduleId}/${prevLesson.lessonId}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 flex items-center justify-center gap-1 border-forge-border"
                    >
                      <ArrowLeft className="h-3 w-3" />
                      <span className="truncate">Prev</span>
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled
                    className="w-full text-xs h-8 border-forge-border opacity-40"
                  >
                    <span className="truncate">Start</span>
                  </Button>
                )}

                {nextLesson ? (
                  <Link href={`/academy/${nextLesson.moduleId}/${nextLesson.lessonId}`}>
                    <Button
                      size="sm"
                      className="w-full text-xs h-8 flex items-center justify-center gap-1 bg-ember-500 hover:bg-ember-600 text-white"
                    >
                      <span className="truncate">Next</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/academy">
                    <Button
                      size="sm"
                      className="w-full text-xs h-8 flex items-center justify-center gap-1 bg-emerald-600 text-white"
                    >
                      <span>Completed</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </aside>

          {/* ============================================================== */}
          {/* PANEL 2 (CENTER): YouTube Embed & Video Studio (Cols: 5/12)   */}
          {/* ============================================================== */}
          <section
            className={cn(
              "lg:col-span-5 space-y-6",
              mobileTab !== "center" && "hidden lg:block"
            )}
          >
            {/* Lesson Title & Badges */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono">
                  Module {module.number} · Lesson {module.lessons.findIndex((l) => l.id === lesson.id) + 1}
                </Badge>
                <Badge variant={module.accent === "cyan" ? "cyan" : "ember"} className="text-xs">
                  {module.level}
                </Badge>
                {quizScore !== undefined && (
                  <Badge variant="outline" className="text-xs font-mono text-cyan-400 border-cyan-500/30">
                    Quiz Score: {quizScore}/{lesson.quiz.length}
                  </Badge>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-forge-text">
                {lesson.title}
              </h1>
            </div>

            {/* Official YouTube Embed (Lazy-loaded, privacy-enhanced nocookie domain) */}
            <YouTubePlayer
              ref={playerRef}
              youtubeId={lesson.youtubeId}
              title={lesson.title}
              onTimeUpdate={(sec) => setCurrentPlaybackSecond(sec)}
            />

            {/* Timestamp Chips that Seek Player via API */}
            <div className="rounded-forge-lg border border-forge-border bg-forge-surface p-4">
              <TimestampChips
                chapters={lesson.chapters}
                currentTime={currentPlaybackSecond}
                onSeek={handleSeek}
              />
            </div>

            {/* Lesson Summary */}
            <div className="rounded-forge-lg border border-forge-border bg-forge-surface p-4 sm:p-5 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-forge-muted">
                Lesson Overview
              </h3>
              <p className="text-xs sm:text-sm text-forge-text leading-relaxed">
                {lesson.summary}
              </p>
            </div>

            {/* Key Concepts */}
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-forge-muted">
                Key Concepts
              </h3>
              <div className="flex flex-wrap gap-2">
                {lesson.keyConcepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-forge border border-forge-border bg-forge-elevated px-2.5 py-1 text-xs font-medium text-forge-text"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* Practice Challenge Card with "Send to Lab" */}
            <div className="rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#12151C] to-[#0A0C0F] p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-ember-400" />
                  <h3 className="text-sm font-bold text-forge-text font-mono">
                    Practice challenge: {lesson.practiceChallenge.title}
                  </h3>
                </div>
                <Badge variant="outline" className="border-white/[0.1] bg-white/[0.04] text-[10px] font-mono text-zinc-300">
                  Hands-on
                </Badge>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                {lesson.practiceChallenge.instructions}
              </p>

              {lesson.practiceChallenge.starterPrompt && (
                <div className="rounded-lg bg-black/60 p-3 font-mono text-[11px] text-zinc-200 border border-white/[0.06] overflow-x-auto">
                  {lesson.practiceChallenge.starterPrompt}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-500 italic">
                  Run in the right panel playground
                </span>
                <Button
                  size="sm"
                  onClick={handleSendToLab}
                  className="bg-ember-500 hover:bg-ember-600 text-black font-semibold text-xs flex items-center gap-1.5"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Open in Lab Studio</span>
                </Button>
              </div>
            </div>
          </section>

          {/* ============================================================== */}
          {/* PANEL 3 (RIGHT): Tabbed Notes, Lab Slot & Quiz (Cols: 4/12)   */}
          {/* ============================================================== */}
          <aside
            className={cn(
              "lg:col-span-4 rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#11141A] to-[#0A0C0F] p-4 space-y-4 lg:sticky lg:top-20",
              mobileTab !== "right" && "hidden lg:block"
            )}
          >
            {/* Panel Tabs Header */}
            <div
              className="flex border border-white/[0.06] bg-black/40 rounded-lg p-1"
              role="tablist"
              aria-label="Lesson workspace panels"
            >
              <button
                type="button"
                role="tab"
                id="tab-notes"
                aria-selected={rightTab === "notes"}
                aria-controls="panel-notes"
                aria-label="Notes panel (Shortcut: 1)"
                onClick={() => setRightTab("notes")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded transition-all font-mono",
                  rightTab === "notes"
                    ? "bg-white/[0.08] text-white"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <BookOpen className="h-3.5 w-3.5" />
                <span>Notes</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-lab"
                aria-selected={rightTab === "lab"}
                aria-controls="panel-lab"
                aria-label="Lab playground panel (Shortcut: 2)"
                onClick={() => setRightTab("lab")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded transition-all font-mono",
                  rightTab === "lab"
                    ? "bg-white/[0.08] text-cyan-300"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>Lab</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-quiz"
                aria-selected={rightTab === "quiz"}
                aria-controls="panel-quiz"
                aria-label="Quiz comprehension panel (Shortcut: 3)"
                onClick={() => setRightTab("quiz")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded transition-all font-mono",
                  rightTab === "quiz"
                    ? "bg-white/[0.08] text-amber-300"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>Quiz</span>
                {lesson.quiz.length > 0 && (
                  <span className="font-mono text-[10px] opacity-70">
                    ({lesson.quiz.length})
                  </span>
                )}
              </button>
            </div>

            {/* Active Tab Panel Content */}
            <div className="pt-1">
              {rightTab === "notes" && (
                <NotesPanel key={lesson.id} lesson={lesson} />
              )}

              {rightTab === "lab" && (
                <LabSlotPanel
                  key={lesson.id}
                  lesson={lesson}
                  customPrompt={customLabPrompt}
                />
              )}

              {rightTab === "quiz" && (
                <QuizCard
                  key={lesson.id}
                  questions={lesson.quiz}
                  lessonId={lesson.id}
                  lessonTitle={lesson.title}
                />
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Progress Export/Import Modal Dialog */}
      <ProgressModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
