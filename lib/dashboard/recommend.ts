/**
 * PromptForge Deterministic Dashboard Recommendation Engine
 * Strictly rule-based recommendation logic based on incomplete lessons and low quiz scores.
 * Explicitly disclaims AI evaluation: operates on simple deterministic pedagogical heuristics.
 */

import { CURRICULUM_MODULES, CurriculumModule, Lesson } from "@/content/modules";
import type { ProgressData } from "@/lib/storage/index";

export interface RecommendationResult {
  module: CurriculumModule;
  lesson: Lesson;
  reason: string;
  isRemediation: boolean;
  scoreText?: string;
}

export interface CurriculumStats {
  completedLessons: number;
  totalLessons: number;
  completionPercentage: number;
  quizzesAttempted: number;
  quizzesPassed: number;
  quizzesPassPercentage: number;
}

/**
 * Computes deterministic curriculum stats across all 10 modules.
 */
export function getCurriculumStats(progress: ProgressData): CurriculumStats {
  const allLessons: Lesson[] = [];
  CURRICULUM_MODULES.forEach((m) => allLessons.push(...m.lessons));

  const totalLessons = allLessons.length;
  const completedLessons = progress.completedLessonIds.length;
  const completionPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const quizScores = progress.quizScores || {};
  const quizTotals = progress.quizTotalQuestions || {};
  const quizLessonIds = Object.keys(quizScores);

  const quizzesAttempted = quizLessonIds.length;
  let quizzesPassed = 0;

  quizLessonIds.forEach((id) => {
    const score = quizScores[id] || 0;
    const total = quizTotals[id] || 3;
    if (total > 0 && Math.round((score / total) * 100) >= 66) {
      quizzesPassed += 1;
    }
  });

  const quizzesPassPercentage =
    quizzesAttempted > 0 ? Math.round((quizzesPassed / quizzesAttempted) * 100) : 0;

  return {
    completedLessons,
    totalLessons,
    completionPercentage,
    quizzesAttempted,
    quizzesPassed,
    quizzesPassPercentage,
  };
}

/**
 * Deterministic Rule-Based Lesson Recommender:
 * 1. Low Quiz Score Remediation: If any quiz score is < 66%, recommend reviewing that lesson first.
 * 2. Next Sequential Incomplete: The first uncompleted lesson across modules in curriculum sequence.
 * 3. Fallback / Review: If 100% completed, recommend the foundational Module 1 Lesson 1 as a refresher.
 */
export function getSuggestedNextLesson(
  progress: ProgressData
): RecommendationResult {
  const completedSet = new Set(progress.completedLessonIds || []);
  const quizScores = progress.quizScores || {};
  const quizTotals = progress.quizTotalQuestions || {};

  // Rule 1: Low Quiz Remediation (score < 66%)
  for (const moduleItem of CURRICULUM_MODULES) {
    for (const lesson of moduleItem.lessons) {
      if (quizScores[lesson.id] !== undefined) {
        const score = quizScores[lesson.id];
        const total = quizTotals[lesson.id] || 3;
        const percent = total > 0 ? Math.round((score / total) * 100) : 100;
        if (percent < 66) {
          return {
            module: moduleItem,
            lesson,
            reason: `Remediation Priority: Comprehension quiz score was ${score}/${total} (${percent}%). Reviewing this material will reinforce core concepts before moving forward.`,
            isRemediation: true,
            scoreText: `${score}/${total} (${percent}%)`,
          };
        }
      }
    }
  }

  // Rule 2: Next Sequential Incomplete Lesson
  for (const moduleItem of CURRICULUM_MODULES) {
    for (const lesson of moduleItem.lessons) {
      if (!completedSet.has(lesson.id)) {
        return {
          module: moduleItem,
          lesson,
          reason: `Next Sequential Milestone: Incomplete lesson in Module ${moduleItem.number}: ${moduleItem.title}.`,
          isRemediation: false,
        };
      }
    }
  }

  // Rule 3: Complete Mastery Fallback
  const firstModule = CURRICULUM_MODULES[0];
  const firstLesson = firstModule.lessons[0];
  return {
    module: firstModule,
    lesson: firstLesson,
    reason: "Curriculum Complete: All 10 modules completed! Continue refining your skills in the Security Arena or Comparison Lab.",
    isRemediation: false,
  };
}
