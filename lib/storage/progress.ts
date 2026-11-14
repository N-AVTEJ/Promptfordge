import {
  STORAGE_KEYS,
  STORAGE_DEFAULTS,
  getStorageItem,
  setStorageItem,
  type ProgressData,
  type LastVisitedLesson,
} from "./index";
import { useEffect, useState, useCallback } from "react";

export const PROGRESS_CHANGE_EVENT = "promptforge:progress-updated";

export interface ProgressExportPayload {
  app: "promptforge";
  version: number;
  exportedAt: number;
  data: ProgressData;
}

/**
 * Dispatch cross-component event so all mounted hooks update synchronously.
 */
function emitProgressChange(data: ProgressData) {
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent(PROGRESS_CHANGE_EVENT, { detail: data })
      );
    } catch {
      // Ignore in non-browser or test runner environments
    }
  }
}

/**
 * Retrieve current progress from storage with fallback defaults.
 */
export function getStoredProgress(): ProgressData {
  const current = getStorageItem(STORAGE_KEYS.PROGRESS);
  return {
    ...STORAGE_DEFAULTS[STORAGE_KEYS.PROGRESS],
    ...current,
    completedLessonIds: Array.isArray(current?.completedLessonIds)
      ? current.completedLessonIds
      : [],
    completedLabIds: Array.isArray(current?.completedLabIds)
      ? current.completedLabIds
      : [],
    challengeScores: current?.challengeScores || {},
    quizScores: current?.quizScores || {},
    quizTotalQuestions: current?.quizTotalQuestions || {},
    lastVisited: current?.lastVisited || null,
  };
}

/**
 * Mark a lesson complete or incomplete.
 */
export function markLessonComplete(
  lessonId: string,
  completed = true
): ProgressData {
  const current = getStoredProgress();
  const set = new Set(current.completedLessonIds);

  if (completed) {
    set.add(lessonId);
  } else {
    set.delete(lessonId);
  }

  const updated: ProgressData = {
    ...current,
    completedLessonIds: Array.from(set),
    lastActiveTimestamp: Date.now(),
  };

  setStorageItem(STORAGE_KEYS.PROGRESS, updated);
  emitProgressChange(updated);
  return updated;
}

/**
 * Save the best quiz score for a lesson.
 */
export function saveQuizScore(
  lessonId: string,
  score: number,
  totalQuestions: number
): ProgressData {
  const current = getStoredProgress();
  const existingBest = current.quizScores?.[lessonId] ?? 0;
  const newBest = Math.max(existingBest, score);

  const updatedQuizScores = {
    ...(current.quizScores || {}),
    [lessonId]: newBest,
  };

  const updatedQuizTotals = {
    ...(current.quizTotalQuestions || {}),
    [lessonId]: totalQuestions,
  };

  // Auto-mark complete if score is 100% or passing (>= 66% e.g. 2/3, 1/1, 2/2)
  const completedLessons = new Set(current.completedLessonIds);
  if (totalQuestions > 0 && Math.round((score / totalQuestions) * 100) >= 66) {
    completedLessons.add(lessonId);
  }

  const updated: ProgressData = {
    ...current,
    completedLessonIds: Array.from(completedLessons),
    quizScores: updatedQuizScores,
    quizTotalQuestions: updatedQuizTotals,
    lastActiveTimestamp: Date.now(),
  };

  setStorageItem(STORAGE_KEYS.PROGRESS, updated);
  emitProgressChange(updated);
  return updated;
}

/**
 * Save the last visited module & lesson.
 */
export function setLastVisited(
  moduleId: string,
  lessonId: string
): ProgressData {
  const current = getStoredProgress();
  const lastVisited: LastVisitedLesson = {
    moduleId,
    lessonId,
    timestamp: Date.now(),
  };

  const updated: ProgressData = {
    ...current,
    lastVisited,
    lastActiveTimestamp: Date.now(),
  };

  setStorageItem(STORAGE_KEYS.PROGRESS, updated);
  emitProgressChange(updated);
  return updated;
}

/**
 * Retrieve the last visited lesson.
 */
export function getLastVisited(): LastVisitedLesson | null {
  const progress = getStoredProgress();
  return progress.lastVisited ?? null;
}

/**
 * Export current progress as a clean, versioned JSON string.
 */
export function exportProgressToJson(): string {
  const progress = getStoredProgress();
  const payload: ProgressExportPayload = {
    app: "promptforge",
    version: 1,
    exportedAt: Date.now(),
    data: progress,
  };
  return JSON.stringify(payload, null, 2);
}

/**
 * Trigger browser file download of progress JSON.
 */
export function downloadProgressFile(): void {
  if (typeof window === "undefined") return;
  try {
    const jsonStr = exportProgressToJson();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promptforge-progress-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("[PromptForge] Failed to trigger file download:", err);
  }
}

/**
 * Import progress from a JSON string with rigorous validation.
 * Accepts both wrapped `{ app: 'promptforge', data: { ... } }` and raw ProgressData.
 */
export function importProgressFromJson(rawJson: string): {
  success: boolean;
  error?: string;
  progress?: ProgressData;
} {
  if (!rawJson || typeof rawJson !== "string" || !rawJson.trim()) {
    return { success: false, error: "Empty JSON content." };
  }

  try {
    const parsed = JSON.parse(rawJson) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return { success: false, error: "Invalid JSON format: expected an object." };
    }

    let progressObj: unknown = parsed;
    // Check if wrapped in export payload
    if ("app" in parsed && "data" in parsed) {
      progressObj = (parsed as { data: unknown }).data;
    }

    if (!progressObj || typeof progressObj !== "object" || Array.isArray(progressObj)) {
      return { success: false, error: "Missing or malformed progress data payload." };
    }

    const candidate = progressObj as Partial<ProgressData>;

    // Validate completedLessonIds and deduplicate
    const completedLessonIds = Array.isArray(candidate.completedLessonIds)
      ? Array.from(
          new Set(
            candidate.completedLessonIds.filter(
              (id): id is string => typeof id === "string" && id.trim().length > 0
            )
          )
        )
      : [];

    const completedLabIds = Array.isArray(candidate.completedLabIds)
      ? Array.from(
          new Set(
            candidate.completedLabIds.filter(
              (id): id is string => typeof id === "string" && id.trim().length > 0
            )
          )
        )
      : [];

    const challengeScores: Record<string, number> = {};
    if (candidate.challengeScores && typeof candidate.challengeScores === "object") {
      for (const [k, v] of Object.entries(candidate.challengeScores)) {
        const num = typeof v === "number" ? v : Number(v);
        if (Number.isFinite(num)) {
          challengeScores[k] = num;
        }
      }
    }

    const quizScores: Record<string, number> = {};
    if (candidate.quizScores && typeof candidate.quizScores === "object") {
      for (const [k, v] of Object.entries(candidate.quizScores)) {
        const num = typeof v === "number" ? v : Number(v);
        if (Number.isFinite(num)) {
          quizScores[k] = num;
        }
      }
    }

    const quizTotalQuestions: Record<string, number> = {};
    if (candidate.quizTotalQuestions && typeof candidate.quizTotalQuestions === "object") {
      for (const [k, v] of Object.entries(candidate.quizTotalQuestions)) {
        const num = typeof v === "number" ? v : Number(v);
        if (Number.isFinite(num)) {
          quizTotalQuestions[k] = num;
        }
      }
    }

    let lastVisited: LastVisitedLesson | null = null;
    if (
      candidate.lastVisited &&
      typeof candidate.lastVisited === "object" &&
      typeof candidate.lastVisited.moduleId === "string" &&
      typeof candidate.lastVisited.lessonId === "string"
    ) {
      lastVisited = {
        moduleId: candidate.lastVisited.moduleId,
        lessonId: candidate.lastVisited.lessonId,
        timestamp: typeof candidate.lastVisited.timestamp === "number"
          ? candidate.lastVisited.timestamp
          : Date.now(),
      };
    }

    const restored: ProgressData = {
      completedLessonIds,
      completedLabIds,
      challengeScores,
      quizScores,
      quizTotalQuestions,
      lastVisited,
      streakDays: typeof candidate.streakDays === "number" ? candidate.streakDays : 0,
      lastActiveTimestamp: Date.now(),
    };

    setStorageItem(STORAGE_KEYS.PROGRESS, restored);
    emitProgressChange(restored);

    return { success: true, progress: restored };
  } catch (err) {
    return {
      success: false,
      error: `JSON parse error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

/**
 * Reset all progress to fresh state.
 */
export function resetAllProgress(): ProgressData {
  const defaults = { ...STORAGE_DEFAULTS[STORAGE_KEYS.PROGRESS] };
  setStorageItem(STORAGE_KEYS.PROGRESS, defaults);
  emitProgressChange(defaults);
  return defaults;
}

/**
 * React Hook for reactive progress tracking across all Academy components.
 */
export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>(
    STORAGE_DEFAULTS[STORAGE_KEYS.PROGRESS]
  );
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    setProgress(getStoredProgress());

    const handleCustomEvent = (e: Event) => {
      const customEvent = e as CustomEvent<ProgressData>;
      if (customEvent.detail) {
        setProgress(customEvent.detail);
      } else {
        setProgress(getStoredProgress());
      }
    };

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PROGRESS || !e.key) {
        setProgress(getStoredProgress());
      }
    };

    window.addEventListener(PROGRESS_CHANGE_EVENT, handleCustomEvent);
    window.addEventListener("storage", handleStorageEvent);

    return () => {
      window.removeEventListener(PROGRESS_CHANGE_EVENT, handleCustomEvent);
      window.removeEventListener("storage", handleStorageEvent);
    };
  }, []);

  const toggleLesson = useCallback((lessonId: string, completed?: boolean) => {
    const isCurrentlyComplete = progress.completedLessonIds.includes(lessonId);
    const targetState = completed !== undefined ? completed : !isCurrentlyComplete;
    const updated = markLessonComplete(lessonId, targetState);
    setProgress(updated);
  }, [progress.completedLessonIds]);

  const saveQuiz = useCallback((lessonId: string, score: number, total: number) => {
    const updated = saveQuizScore(lessonId, score, total);
    setProgress(updated);
  }, []);

  const visitLesson = useCallback((moduleId: string, lessonId: string) => {
    const updated = setLastVisited(moduleId, lessonId);
    setProgress(updated);
  }, []);

  const reset = useCallback(() => {
    const fresh = resetAllProgress();
    setProgress(fresh);
  }, []);

  const importJson = useCallback((raw: string) => {
    const res = importProgressFromJson(raw);
    if (res.success && res.progress) {
      setProgress(res.progress);
    }
    return res;
  }, []);

  return {
    progress,
    isHydrated,
    toggleLesson,
    saveQuiz,
    visitLesson,
    reset,
    importJson,
    exportJson: exportProgressToJson,
    downloadFile: downloadProgressFile,
  };
}
