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
  Film,
  Compass,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProgress } from "@/lib/storage/progress";
import { ProgressRing } from "@/components/academy/progress-ring";
import { YouTubeEmbed, type YouTubeEmbedRef } from "@/components/academy/youtube-embed";
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

  const playerRef = React.useRef<YouTubeEmbedRef>(null);
  const [currentPlaybackSecond, setCurrentPlaybackSecond] = React.useState(0);
  const [rightTab, setRightTab] = React.useState<"notes" | "lab" | "quiz">("notes");
  const [mobileTab, setMobileTab] = React.useState<"outline" | "center" | "right">("center");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [customLabPrompt, setCustomLabPrompt] = React.useState<string | undefined>(undefined);
  const [selectedVideoId, setSelectedVideoId] = React.useState<string | undefined>(undefined);
  const [showCheckAnswer, setShowCheckAnswer] = React.useState(false);

  // Videos sorted beginner first
  const sortedVideos = React.useMemo(() => {
    if (!lesson.videos) return [];
    const rank: Record<string, number> = {
      beginner: 1,
      intermediate: 2,
      advanced: 3,
    };
    return [...lesson.videos].sort((a, b) => {
      const rA = rank[a.level] ?? 2;
      const rB = rank[b.level] ?? 2;
      return rA - rB;
    });
  }, [lesson.videos]);

  // Active Video resolution
  const activeVideo = React.useMemo(() => {
    if (selectedVideoId && sortedVideos.length > 0) {
      const found = sortedVideos.find((v) => v.id === selectedVideoId);
      if (found) return found;
    }
    if (sortedVideos.length > 0) {
      const okVideo = sortedVideos.find((v) => v.status === "ok");
      if (okVideo) return okVideo;
      return sortedVideos[0];
    }
    return undefined;
  }, [selectedVideoId, sortedVideos]);

  const activeVideoId = activeVideo?.id ?? lesson.youtubeId;
  const activeVideoStatus = activeVideo?.status ?? lesson.status ?? (activeVideoId ? "ok" : "slot");

  // Keyboard navigation
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

  React.useEffect(() => {
    visitLesson(module.id, lesson.id);
    setCustomLabPrompt(undefined);
    setCurrentPlaybackSecond(0);
    setSelectedVideoId(undefined);
    setShowCheckAnswer(false);
  }, [module.id, lesson.id, visitLesson]);

  const handleSeek = (seconds: number) => {
    playerRef.current?.seekTo(seconds);
    setCurrentPlaybackSecond(seconds);
  };

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
    <div className="flex min-h-screen flex-col bg-cream text-indigo">
      {/* Studio Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-indigo-950/10 bg-cream/95 px-4 sm:px-6 backdrop-blur-md">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm min-w-0 flex-1 mr-2 sm:mr-4">
          <Link
            href="/academy"
            className="flex items-center gap-1.5 text-indigo-900/70 hover:text-indigo font-semibold shrink-0"
            title="Back to Academy"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Academy</span>
          </Link>
          <span className="text-indigo-900/30 shrink-0 hidden sm:inline">/</span>
          <span className="font-mono text-xs text-indigo-900/60 hidden md:inline shrink-0 font-bold">
            Mod {module.number.toString().padStart(2, "0")}
          </span>
          <span className="text-indigo-900/30 hidden md:inline shrink-0">/</span>
          <span className="font-bold text-indigo truncate max-w-[150px] sm:max-w-[280px]">
            {lesson.title}
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden xs:flex items-center gap-2">
            <ProgressRing
              percent={modulePercent}
              size={32}
              strokeWidth={3}
              accent="amber"
            />
            <span className="text-xs font-mono text-indigo-900/60 hidden md:inline">
              {completedInModule}/{module.lessons.length} done
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="h-8 px-2 sm:px-3 text-xs flex items-center gap-1.5"
            title="Export or Import Progress"
          >
            <FileJson className="h-3.5 w-3.5 text-coral" />
            <span className="hidden sm:inline">Progress sync</span>
          </Button>

          <Button
            variant={isCurrentLessonComplete ? "outline" : "default"}
            size="sm"
            onClick={() => toggleLesson(lesson.id)}
            className={cn(
              "h-8 px-2.5 sm:px-3 text-xs flex items-center gap-1.5 font-bold transition-all",
              isCurrentLessonComplete
                ? "border-teal/30 text-teal bg-teal/10 hover:bg-teal/20"
                : "bg-coral hover:bg-coral-600 text-white shadow-coral-glow"
            )}
          >
            <CheckCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="hidden sm:inline">{isCurrentLessonComplete ? "Completed" : "Mark complete"}</span>
          </Button>
        </div>
      </header>

      {/* Mobile Screen Tab Navigation (< 1024px) */}
      <div className="lg:hidden sticky top-16 z-20 flex border-b border-indigo-950/10 bg-white">
        <button
          type="button"
          onClick={() => setMobileTab("outline")}
          className={cn(
            "flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors",
            mobileTab === "outline"
              ? "border-coral text-coral bg-cream"
              : "border-transparent text-indigo-900/60 hover:text-indigo"
          )}
        >
          1. Outline
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("center")}
          className={cn(
            "flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors",
            mobileTab === "center"
              ? "border-coral text-coral bg-cream"
              : "border-transparent text-indigo-900/60 hover:text-indigo"
          )}
        >
          2. Lesson & Video
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("right")}
          className={cn(
            "flex-1 py-2.5 text-xs font-bold uppercase tracking-wider text-center border-b-2 transition-colors",
            mobileTab === "right"
              ? "border-coral text-coral bg-cream"
              : "border-transparent text-indigo-900/60 hover:text-indigo"
          )}
        >
          3. Lab & Notes
        </button>
      </div>

      {/* Main Studio Body: Three Panels */}
      <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* PANEL 1 (LEFT): Module Curriculum & Chapter List (Cols: 3/12) */}
          <aside
            className={cn(
              "lg:col-span-3 rounded-2xl border border-indigo-950/10 bg-white p-6 space-y-6 shadow-card lg:sticky lg:top-24",
              mobileTab !== "outline" && "hidden lg:block"
            )}
          >
            <div className="space-y-2 border-b border-indigo-950/10 pb-4">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-cream px-3 py-1 font-mono text-xs font-bold text-indigo border border-indigo-950/10">
                  Module {module.number}
                </span>
                <span className="text-xs font-mono text-indigo-900/60">
                  {module.duration}
                </span>
              </div>
              <h2 className="text-base font-bold text-indigo leading-snug">
                {module.title}
              </h2>
              <div className="flex items-center gap-2 pt-2">
                <div className="flex-1 h-2 bg-indigo-950/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-coral transition-all duration-500"
                    style={{ width: `${modulePercent}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-indigo-900/70 font-semibold">
                  {modulePercent}%
                </span>
              </div>
            </div>

            {/* Lessons List in Module */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-indigo-900/50 font-bold px-1">
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
                        "group flex items-center justify-between rounded-xl p-2.5 transition-all border",
                        isActive
                          ? "bg-coral/10 border-coral/40 text-coral font-bold shadow-sm"
                          : "bg-cream/40 border-indigo-950/5 hover:bg-cream hover:border-indigo-950/15"
                      )}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLesson(les.id);
                        }}
                        className="shrink-0 p-1 text-indigo-900/40 hover:text-teal transition-colors"
                        title={isComplete ? "Mark incomplete" : "Mark complete"}
                        aria-label={
                          isComplete
                            ? `Mark ${les.title} incomplete`
                            : `Mark ${les.title} complete`
                        }
                      >
                        {isComplete ? (
                          <CheckCircle className="h-4 w-4 text-teal" />
                        ) : (
                          <Circle className="h-4 w-4 text-indigo-900/30" />
                        )}
                      </button>

                      <Link
                        href={`/academy/${module.id}/${les.id}`}
                        className="flex-1 flex items-center justify-between min-w-0 px-2 group/link"
                      >
                        <div className="min-w-0 flex-1">
                          <div
                            className={cn(
                              "text-xs truncate leading-tight font-sans font-semibold",
                              isActive
                                ? "text-coral font-bold"
                                : "text-indigo group-hover/link:text-coral"
                            )}
                          >
                            {idx + 1}. {les.title}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-indigo-900/50 mt-0.5 font-mono">
                            <span>{les.chapters.length} chapters</span>
                            {score !== undefined && (
                              <span className="text-teal font-bold font-mono">
                                Quiz: {score}/{les.quiz.length}
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform ml-1",
                            isActive
                              ? "text-coral translate-x-0.5"
                              : "text-indigo-900/30 group-hover/link:text-coral"
                          )}
                        />
                      </Link>
                    </div>

                    {/* Expandable Chapters */}
                    {isActive && (
                      <div className="ml-6 border-l-2 border-coral/30 pl-3 py-1 space-y-1">
                        {les.chapters.map((chap, cIdx) => (
                          <button
                            key={cIdx}
                            type="button"
                            onClick={() => handleSeek(chap.time)}
                            className="flex w-full items-center justify-between text-left text-xs text-indigo-900/70 hover:text-coral py-1 transition-colors group"
                          >
                            <span className="truncate pr-1 group-hover:underline">
                              {chap.label}
                            </span>
                            <span className="font-mono text-[10px] text-indigo-900/50 shrink-0">
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

            {/* Progression Footer */}
            <div className="border-t border-indigo-950/10 pt-4 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-900/60 font-mono px-1">
                Progression
              </div>
              <div className="grid grid-cols-2 gap-2">
                {prevLesson ? (
                  <Link href={`/academy/${prevLesson.moduleId}/${prevLesson.lessonId}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-9 flex items-center justify-center gap-1"
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
                    className="w-full text-xs h-9 opacity-40"
                  >
                    <span className="truncate">Start</span>
                  </Button>
                )}

                {nextLesson ? (
                  <Link href={`/academy/${nextLesson.moduleId}/${nextLesson.lessonId}`}>
                    <Button
                      size="sm"
                      className="w-full text-xs h-9 flex items-center justify-center gap-1"
                    >
                      <span className="truncate">Next</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/academy">
                    <Button
                      size="sm"
                      className="w-full text-xs h-9 flex items-center justify-center gap-1 bg-teal hover:bg-teal-600 text-white"
                    >
                      <span>Completed</span>
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </aside>

          {/* PANEL 2 (CENTER): YouTube Embed & Video Studio (Cols: 5/12) */}
          <section
            className={cn(
              "lg:col-span-5 space-y-6",
              mobileTab !== "center" && "hidden lg:block"
            )}
          >
            {/* Lesson Title & Badges */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs font-mono font-semibold">
                  Module {module.number} · Lesson {module.lessons.findIndex((l) => l.id === lesson.id) + 1}
                </Badge>
                <Badge variant="secondary" className="text-xs font-bold">
                  {module.level}
                </Badge>
                {quizScore !== undefined && (
                  <Badge variant="secondary" className="text-xs font-mono">
                    Quiz Score: {quizScore}/{lesson.quiz.length}
                  </Badge>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-indigo font-sans">
                {lesson.title}
              </h1>
            </div>

            {/* Before you watch (2 plain-English lines, no jargon) */}
            {lesson.beforeYouWatch && lesson.beforeYouWatch.length > 0 && (
              <div className="rounded-2xl border border-indigo-950/10 bg-[#fdfbf7] p-5 shadow-card space-y-2.5">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-coral" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900/70 font-mono">
                    Before you watch
                  </h3>
                </div>
                <div className="space-y-1.5 text-xs sm:text-sm text-indigo-900/80 leading-[1.65]">
                  {lesson.beforeYouWatch.map((line, idx) => (
                    <p key={idx} className="flex items-start gap-2">
                      <span className="text-coral select-none font-bold text-sm leading-tight">•</span>
                      <span>{line}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Official YouTube Embed (using youtube-nocookie.com, lazy loaded, 16:9, rounded) */}
            <YouTubeEmbed
              ref={playerRef}
              youtubeId={activeVideoId}
              title={activeVideo?.title ?? lesson.title}
              status={activeVideoStatus}
              onTimeUpdate={(sec) => setCurrentPlaybackSecond(sec)}
            />

            {/* More videos for this lesson row (shown when lesson has multiple video options) */}
            {sortedVideos.length > 1 && (
              <div className="rounded-2xl border border-indigo-950/10 bg-white p-5 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Film className="h-4 w-4 text-coral" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900/70 font-mono">
                      More videos for this lesson ({sortedVideos.length})
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-900/50">
                    Click to switch video
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {sortedVideos.map((vid) => {
                    const isCurrent = vid.id === activeVideoId;
                    const isUnavailable = vid.status === "unavailable";
                    const thumbUrl =
                      vid.thumbnailUrl ||
                      `https://i.ytimg.com/vi/${vid.id}/hqdefault.jpg`;

                    return (
                      <button
                        key={vid.id}
                        type="button"
                        onClick={() => {
                          if (!isUnavailable) {
                            setSelectedVideoId(vid.id);
                            setCurrentPlaybackSecond(0);
                          }
                        }}
                        disabled={isUnavailable}
                        className={cn(
                          "group relative flex items-start gap-3 rounded-xl p-2.5 text-left transition-all border",
                          isCurrent
                            ? "bg-coral/5 border-coral/50 shadow-sm ring-1 ring-coral/20"
                            : isUnavailable
                            ? "opacity-60 bg-cream/30 border-indigo-950/5 cursor-not-allowed"
                            : "bg-cream/40 border-indigo-950/10 hover:bg-cream hover:border-indigo-950/20"
                        )}
                        title={
                          isUnavailable
                            ? "Video temporarily unavailable"
                            : `Switch to: ${vid.title}`
                        }
                      >
                        {/* Thumbnail */}
                        <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-lg bg-indigo-950/10 border border-indigo-950/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumbUrl}
                            alt={vid.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            loading="lazy"
                            onError={(e) => {
                              // Elegant fallback if ytimg is blocked
                              (e.currentTarget as HTMLImageElement).src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="120" height="68" viewBox="0 0 120 68" fill="%23f4efe6"><rect width="120" height="68" fill="%23f4efe6"/><polygon points="48,22 80,34 48,46" fill="%23e0684b"/></svg>`;
                            }}
                          />
                          {vid.minutes && (
                            <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[9px] font-mono font-bold text-white">
                              {vid.minutes}m
                            </span>
                          )}
                        </div>

                        {/* Meta */}
                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {/* Level badge */}
                            <span
                              className={cn(
                                "text-[10px] font-mono font-bold capitalize px-1.5 py-0.5 rounded",
                                vid.level === "beginner"
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : vid.level === "intermediate"
                                  ? "bg-sky-50 text-sky-800 border border-sky-200"
                                  : "bg-indigo-50 text-indigo-800 border border-indigo-200"
                              )}
                            >
                              {vid.level}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-mono font-bold text-coral">
                                • Active
                              </span>
                            )}
                            {isUnavailable && (
                              <span className="text-[10px] font-mono font-bold text-rose-600">
                                • Unavailable
                              </span>
                            )}
                          </div>
                          <p
                            className={cn(
                              "text-xs font-semibold leading-tight line-clamp-2",
                              isCurrent ? "text-coral font-bold" : "text-indigo"
                            )}
                          >
                            {vid.title}
                          </p>
                          {vid.channel && (
                            <p className="text-[10px] font-mono text-indigo-900/50 truncate">
                              {vid.channel}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Check yourself (1 question after the video) */}
            {lesson.checkYourself && (
              <div className="rounded-2xl border border-indigo-950/10 bg-white p-5 shadow-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-teal" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900/70 font-mono">
                      Check yourself
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-indigo-900/50">
                    Concept check
                  </span>
                </div>
                <p className="text-sm font-semibold text-indigo leading-snug">
                  {lesson.checkYourself.question}
                </p>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCheckAnswer(!showCheckAnswer)}
                    className="inline-flex items-center gap-1.5 py-1.5 px-2.5 -ml-2.5 rounded-lg text-xs font-mono font-semibold text-teal hover:text-teal/80 hover:bg-teal/5 transition-colors min-h-[36px]"
                  >
                    <span>{showCheckAnswer ? "Hide answer" : "Show answer"}</span>
                    <ChevronRight
                      className={cn("h-3.5 w-3.5 transition-transform", showCheckAnswer && "rotate-90")}
                    />
                  </button>

                  {showCheckAnswer && (
                    <div className="mt-2.5 rounded-xl bg-teal/5 border border-teal/20 p-3.5 text-xs text-indigo-900/80 space-y-1.5">
                      <p className="font-semibold text-indigo">{lesson.checkYourself.answer}</p>
                      {lesson.checkYourself.hint && (
                        <p className="text-[11px] text-indigo-900/60 font-sans italic">
                          Hint: {lesson.checkYourself.hint}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamp Chips that seek player */}
            <div className="rounded-2xl border border-indigo-950/10 bg-white p-6 shadow-card">
              <TimestampChips
                chapters={lesson.chapters}
                currentTime={currentPlaybackSecond}
                onSeek={handleSeek}
              />
            </div>

            {/* Lesson Summary */}
            <div className="rounded-2xl border border-indigo-950/10 bg-white p-6 shadow-card space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900/60 font-mono">
                Lesson Overview
              </h3>
              <p className="text-sm text-indigo-900/80 leading-[1.7]">
                {lesson.summary}
              </p>
            </div>

            {/* Key Concepts */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900/60 font-mono">
                Key Concepts
              </h3>
              <div className="flex flex-wrap gap-2">
                {lesson.keyConcepts.map((concept, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-xl border border-indigo-950/10 bg-white px-3 py-1.5 text-xs font-semibold text-indigo shadow-sm"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>

            {/* Practice Challenge Card */}
            <div className="rounded-2xl border border-indigo-950/10 bg-white p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-coral" />
                  <h3 className="text-sm font-bold text-indigo font-sans">
                    Practice Challenge: {lesson.practiceChallenge.title}
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Hands-on
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-indigo-900/75 leading-[1.7]">
                {lesson.practiceChallenge.instructions}
              </p>

              {lesson.practiceChallenge.starterPrompt && (
                <div className="rounded-xl bg-cream p-4 font-mono text-[11px] text-indigo border border-indigo-950/10 overflow-x-auto leading-relaxed">
                  {lesson.practiceChallenge.starterPrompt}
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-indigo-900/60 italic font-sans">
                  Execute inside right panel sandbox
                </span>
                <Button
                  size="sm"
                  onClick={handleSendToLab}
                  className="gap-1.5 text-xs font-bold"
                >
                  <Terminal className="h-3.5 w-3.5" />
                  <span>Open in Lab Studio</span>
                </Button>
              </div>
            </div>
          </section>

          {/* PANEL 3 (RIGHT): Tabbed Notes, Lab Slot & Quiz (Cols: 4/12) */}
          <aside
            className={cn(
              "lg:col-span-4 rounded-2xl border border-indigo-950/10 bg-white p-6 space-y-6 shadow-card lg:sticky lg:top-24",
              mobileTab !== "right" && "hidden lg:block"
            )}
          >
            {/* Panel Tabs Header */}
            <div
              className="flex border border-indigo-950/10 bg-cream rounded-xl p-1"
              role="tablist"
              aria-label="Lesson workspace panels"
            >
              <button
                type="button"
                role="tab"
                id="tab-notes"
                aria-selected={rightTab === "notes"}
                aria-controls="panel-notes"
                aria-label="Notes panel"
                onClick={() => setRightTab("notes")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all font-sans",
                  rightTab === "notes"
                    ? "bg-white text-indigo shadow-card"
                    : "text-indigo-900/60 hover:text-indigo"
                )}
              >
                <BookOpen className="h-3.5 w-3.5 text-violet" />
                <span>Notes</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-lab"
                aria-selected={rightTab === "lab"}
                aria-controls="panel-lab"
                aria-label="Interactive lab panel"
                onClick={() => setRightTab("lab")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all font-sans",
                  rightTab === "lab"
                    ? "bg-white text-indigo shadow-card"
                    : "text-indigo-900/60 hover:text-indigo"
                )}
              >
                <Terminal className="h-3.5 w-3.5 text-coral" />
                <span>Lab</span>
              </button>

              <button
                type="button"
                role="tab"
                id="tab-quiz"
                aria-selected={rightTab === "quiz"}
                aria-controls="panel-quiz"
                aria-label="Comprehension quiz panel"
                onClick={() => setRightTab("quiz")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all font-sans",
                  rightTab === "quiz"
                    ? "bg-white text-indigo shadow-card"
                    : "text-indigo-900/60 hover:text-indigo"
                )}
              >
                <HelpCircle className="h-3.5 w-3.5 text-teal" />
                <span>Quiz</span>
              </button>
            </div>

            {/* Active Panel View */}
            <div className="pt-2">
              {rightTab === "notes" && (
                <div id="panel-notes" role="tabpanel" aria-labelledby="tab-notes">
                  <NotesPanel lesson={lesson} />
                </div>
              )}

              {rightTab === "lab" && (
                <div id="panel-lab" role="tabpanel" aria-labelledby="tab-lab">
                  <LabSlotPanel lesson={lesson} customPrompt={customLabPrompt} />
                </div>
              )}

              {rightTab === "quiz" && (
                <div id="panel-quiz" role="tabpanel" aria-labelledby="tab-quiz">
                  <QuizCard
                    questions={lesson.quiz}
                    lessonId={lesson.id}
                    lessonTitle={lesson.title}
                  />
                </div>
              )}
            </div>
          </aside>
        </div>
      </main>

      {/* Progress Sync Modal */}
      <ProgressModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
