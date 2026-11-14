"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Award,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { QuizQuestion } from "@/content/modules";
import { useProgress } from "@/lib/storage/progress";

export interface QuizCardProps {
  questions: QuizQuestion[];
  lessonId: string;
  lessonTitle?: string;
  onComplete?: (score: number, total: number) => void;
  className?: string;
}

export function QuizCard({
  questions,
  lessonId,
  lessonTitle,
  onComplete,
  className,
}: QuizCardProps) {
  const { progress, saveQuiz } = useProgress();

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedOption, setSelectedOption] = React.useState<number | null>(null);
  const [isAnswered, setIsAnswered] = React.useState(false);
  const [userAnswers, setUserAnswers] = React.useState<
    Array<{ selected: number; isCorrect: boolean }>
  >([]);
  const [isCompleted, setIsCompleted] = React.useState(false);
  const [finalScore, setFinalScore] = React.useState(0);

  const currentQ = questions[currentIndex] || questions[0];
  const bestScore = progress.quizScores?.[lessonId];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;

    setSelectedOption(idx);
    setIsAnswered(true);

    const isCorrect = idx === currentQ.answerIndex;
    const updatedAnswers = [...userAnswers, { selected: idx, isCorrect }];
    setUserAnswers(updatedAnswers);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      // Quiz finished
      const correctCount = userAnswers.filter((a) => a.isCorrect).length;
      setFinalScore(correctCount);
      setIsCompleted(true);

      // Save to localStorage progress store
      saveQuiz(lessonId, correctCount, questions.length);
      onComplete?.(correctCount, questions.length);
    }
  };

  const handleRetake = React.useCallback(() => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setUserAnswers([]);
    setIsCompleted(false);
    setFinalScore(0);
  }, []);

  // Reset quiz state when switching lessons
  React.useEffect(() => {
    handleRetake();
  }, [lessonId, handleRetake]);

  if (!questions || questions.length === 0) {
    return (
      <div className="rounded-forge-lg border border-forge-border bg-forge-elevated p-6 text-center text-sm text-forge-muted">
        No quiz available for this lesson.
      </div>
    );
  }

  // Final Score View
  if (isCompleted) {
    const percent = Math.round((finalScore / questions.length) * 100);
    const passed = percent >= 66;

    return (
      <div
        className={cn(
          "rounded-forge-lg border border-forge-border bg-forge-surface p-6 shadow-forge text-center space-y-6",
          className
        )}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ember-500/10 text-ember-400 border border-ember-500/30">
          <Award className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <Badge
            variant={passed ? "cyan" : "outline"}
            className="px-3 py-1 text-xs uppercase tracking-wider font-mono"
          >
            {passed ? "Assessment Passed" : "Knowledge Check Complete"}
          </Badge>
          <h3 className="text-xl font-bold text-forge-text">
            {passed ? "Excellent Work!" : "Keep Honing Your Instincts"}
          </h3>
          <p className="text-xs text-forge-muted">
            {lessonTitle ? `Knowledge check for "${lessonTitle}"` : "Lesson Quiz"}
          </p>
        </div>

        {/* Score Ring / Metric */}
        <div className="mx-auto flex flex-col items-center justify-center rounded-forge-md bg-forge-elevated p-4 border border-forge-border max-w-xs">
          <div className="font-mono text-3xl font-extrabold text-forge-text">
            {finalScore} <span className="text-forge-subtle">/</span> {questions.length}
          </div>
          <div className="text-xs font-medium text-forge-muted mt-1">
            Score: <span className={cn("font-bold font-mono", passed ? "text-cyan-400" : "text-ember-400")}>{percent}%</span>
          </div>
          {bestScore !== undefined && (
            <div className="mt-2 text-[11px] font-mono text-forge-subtle">
              Best Saved Score: {bestScore} / {questions.length}
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetake}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Retake Quiz</span>
          </Button>
        </div>
      </div>
    );
  }

  // Active Question View
  return (
    <div
      className={cn(
        "rounded-forge-lg border border-forge-border bg-forge-surface p-5 sm:p-6 shadow-forge space-y-5",
        className
      )}
    >
      {/* Header & Progress */}
      <div className="flex items-center justify-between border-b border-forge-border pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold text-forge-muted uppercase tracking-wider">
            Knowledge Check
          </span>
        </div>
        <div className="font-mono text-xs text-forge-muted">
          Question <span className="text-forge-text font-bold">{currentIndex + 1}</span> of{" "}
          <span>{questions.length}</span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="h-1 w-full bg-forge-border rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-ember-500 to-cyan-400 transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question Text */}
      <div className="space-y-1">
        <h4 className="text-sm sm:text-base font-semibold text-forge-text leading-snug">
          {currentQ.question}
        </h4>
      </div>

      {/* Options List */}
      <div className="space-y-2.5">
        {currentQ.options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentQ.answerIndex;

          let optionStyle =
            "bg-forge-elevated text-forge-muted border-forge-border hover:bg-forge-overlay hover:text-forge-text hover:border-forge-border-bright";

          if (isAnswered) {
            if (isCorrect) {
              optionStyle =
                "bg-emerald-950/40 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_-2px_rgba(16,185,129,0.3)]";
            } else if (isSelected && !isCorrect) {
              optionStyle =
                "bg-red-950/40 text-red-300 border-red-500/60 shadow-[0_0_12px_-2px_rgba(239,68,68,0.3)]";
            } else {
              optionStyle = "bg-forge-elevated/40 text-forge-subtle border-forge-border/40 opacity-50";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(idx)}
              className={cn(
                "group flex w-full items-start gap-3 rounded-forge-md border p-3 text-left text-xs sm:text-sm font-medium transition-all focus:outline-none min-h-[44px]",
                optionStyle
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded font-mono text-xs font-bold transition-colors",
                  isAnswered && isCorrect
                    ? "bg-emerald-500 text-black"
                    : isAnswered && isSelected && !isCorrect
                    ? "bg-red-500 text-white"
                    : "bg-forge-surface text-forge-muted group-hover:text-forge-text"
                )}
              >
                {letter}
              </span>

              <span className="flex-1 pt-0.5 leading-relaxed">{option}</span>

              {isAnswered && (
                <span className="shrink-0 pt-0.5">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : isSelected ? (
                    <XCircle className="h-5 w-5 text-red-400" />
                  ) : null}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Explanation Box (Animated Reveal) */}
      {isAnswered && (
        <div
          className={cn(
            "rounded-forge-md p-3.5 text-xs border leading-relaxed transition-all duration-300",
            selectedOption === currentQ.answerIndex
              ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
              : "bg-forge-elevated border-ember-500/30 text-forge-text"
          )}
        >
          <div className="font-semibold text-xs mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Explanation:</span>
          </div>
          <p>{currentQ.explanation}</p>
        </div>
      )}

      {/* Footer Navigation */}
      {isAnswered && (
        <div className="flex justify-end pt-1">
          <Button
            size="sm"
            onClick={handleNext}
            className="flex items-center gap-2 bg-ember-500 hover:bg-ember-600 text-white shadow-ember-sm"
          >
            <span>
              {currentIndex < questions.length - 1 ? "Next Question" : "Complete Quiz"}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
