"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Award,
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

  React.useEffect(() => {
    handleRetake();
  }, [lessonId, handleRetake]);

  if (!questions || questions.length === 0) {
    return (
      <div className="rounded-2xl border border-indigo-950/10 bg-white p-6 text-center text-sm text-indigo-900/60 shadow-card">
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
          "rounded-2xl border border-indigo-950/10 bg-white p-6 sm:p-8 shadow-card text-center space-y-6",
          className
        )}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-coral/10 text-coral border border-coral/30">
          <Award className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <Badge
            variant={passed ? "secondary" : "outline"}
            className="px-3 py-1 text-xs uppercase tracking-wider font-mono font-bold"
          >
            {passed ? "Assessment Passed" : "Knowledge Check Complete"}
          </Badge>
          <h3 className="text-xl font-bold text-indigo">
            {passed ? "Excellent Comprehension!" : "Keep Honing Your Knowledge"}
          </h3>
          <p className="text-xs text-indigo-900/70">
            {lessonTitle ? `Knowledge check for "${lessonTitle}"` : "Lesson Quiz"}
          </p>
        </div>

        {/* Score Metric */}
        <div className="mx-auto flex flex-col items-center justify-center rounded-xl bg-cream p-4 border border-indigo-950/10 max-w-xs">
          <div className="font-mono text-3xl font-extrabold text-indigo">
            {finalScore} <span className="opacity-40">/</span> {questions.length}
          </div>
          <div className="text-xs font-semibold text-indigo-900/70 mt-1">
            Score: <span className={cn("font-bold font-mono", passed ? "text-teal" : "text-coral")}>{percent}%</span>
          </div>
          {bestScore !== undefined && (
            <div className="mt-2 text-[11px] font-mono text-indigo-900/50">
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
        "rounded-2xl border border-indigo-950/10 bg-white p-6 shadow-card space-y-5",
        className
      )}
    >
      {/* Header & Progress */}
      <div className="flex items-center justify-between border-b border-indigo-950/10 pb-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4 text-violet" />
          <span className="text-xs font-bold text-indigo-900/60 uppercase tracking-wider font-mono">
            Knowledge Check
          </span>
        </div>
        <div className="font-mono text-xs text-indigo-900/60">
          Question <span className="text-indigo font-bold">{currentIndex + 1}</span> of{" "}
          <span>{questions.length}</span>
        </div>
      </div>

      {/* Progress Line */}
      <div className="h-1.5 w-full bg-indigo-950/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-coral transition-all duration-300"
          style={{
            width: `${((currentIndex + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {/* Question Text */}
      <div className="space-y-1">
        <h4 className="text-base font-bold text-indigo leading-snug">
          {currentQ.question}
        </h4>
      </div>

      {/* Options List */}
      <div className="space-y-2.5">
        {currentQ.options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelected = selectedOption === idx;
          const isCorrect = idx === currentQ.answerIndex;

          let optionStyle =
            "bg-cream text-indigo border-indigo-950/10 hover:bg-white hover:border-indigo-950/20";

          if (isAnswered) {
            if (isCorrect) {
              optionStyle = "bg-teal/10 text-teal border-teal/40 font-semibold";
            } else if (isSelected && !isCorrect) {
              optionStyle = "bg-rose-50 text-rose-700 border-rose-300 font-semibold";
            } else {
              optionStyle = "bg-cream/40 text-indigo-900/40 border-indigo-950/5 opacity-60";
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isAnswered}
              onClick={() => handleSelectOption(idx)}
              className={cn(
                "group flex w-full items-start gap-3 rounded-xl border p-3.5 text-left text-xs sm:text-sm font-medium transition-all focus:outline-none min-h-[44px]",
                optionStyle
              )}
            >
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors",
                  isAnswered && isCorrect
                    ? "bg-teal text-white"
                    : isAnswered && isSelected && !isCorrect
                    ? "bg-rose-500 text-white"
                    : "bg-white text-indigo-900/70 border border-indigo-950/10"
                )}
              >
                {letter}
              </span>

              <span className="flex-1 pt-0.5 leading-relaxed">{option}</span>

              {isAnswered && (
                <span className="shrink-0 pt-0.5">
                  {isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-teal" />
                  ) : isSelected ? (
                    <XCircle className="h-5 w-5 text-rose-500" />
                  ) : null}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Answer Explanation & Next Button */}
      {isAnswered && (
        <div className="rounded-xl border border-indigo-950/10 bg-cream p-4 space-y-3">
          <div className="text-xs font-semibold text-indigo-900/80 leading-relaxed">
            <strong className="text-indigo font-bold block mb-1">
              Explanation:
            </strong>
            {currentQ.explanation}
          </div>

          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1.5 text-xs"
            >
              <span>
                {currentIndex < questions.length - 1 ? "Next Question" : "See Final Score"}
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
