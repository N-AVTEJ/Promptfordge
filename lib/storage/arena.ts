/**
 * PromptForge Security Arena Storage Helper
 * Persists level completions, attempt statistics, and Red vs Blue challenge scores.
 */

import { getStorageItem, setStorageItem, STORAGE_KEYS, STORAGE_DEFAULTS } from "./index";
import { ArenaProgress } from "@/lib/arena/types";

export function getArenaProgress(): ArenaProgress {
  const data = getStorageItem(STORAGE_KEYS.ARENA_PROGRESS);
  if (!data || !Array.isArray(data.completedLevels)) {
    return { ...STORAGE_DEFAULTS[STORAGE_KEYS.ARENA_PROGRESS] };
  }
  return data;
}

export function saveLevelSuccess(levelId: number): ArenaProgress {
  const current = getArenaProgress();
  const completed = Array.from(new Set([...current.completedLevels, levelId])).sort(
    (a, b) => a - b
  );

  const updated: ArenaProgress = {
    ...current,
    completedLevels: completed,
    updatedAt: Date.now(),
  };

  setStorageItem(STORAGE_KEYS.ARENA_PROGRESS, updated);
  return updated;
}

export function recordLevelAttempt(levelId: number): ArenaProgress {
  const current = getArenaProgress();
  const attempts = {
    ...current.levelAttempts,
    [levelId]: (current.levelAttempts[levelId] || 0) + 1,
  };

  const updated: ArenaProgress = {
    ...current,
    levelAttempts: attempts,
    updatedAt: Date.now(),
  };

  setStorageItem(STORAGE_KEYS.ARENA_PROGRESS, updated);
  return updated;
}

export function saveRedVsBlueResult(fractionScore: string): ArenaProgress {
  const current = getArenaProgress();

  // Parse fraction to compare (e.g. "7/8" vs "6/8")
  let isBest = false;
  if (!current.bestRedVsBlueFraction) {
    isBest = true;
  } else {
    const [currBlocked] = current.bestRedVsBlueFraction.split("/").map(Number);
    const [newBlocked] = fractionScore.split("/").map(Number);
    if (!isNaN(newBlocked) && (isNaN(currBlocked) || newBlocked > currBlocked)) {
      isBest = true;
    }
  }

  const updated: ArenaProgress = {
    ...current,
    bestRedVsBlueFraction: isBest ? fractionScore : current.bestRedVsBlueFraction,
    totalRedVsBlueRuns: (current.totalRedVsBlueRuns || 0) + 1,
    updatedAt: Date.now(),
  };

  setStorageItem(STORAGE_KEYS.ARENA_PROGRESS, updated);
  return updated;
}

export function setLastActiveArenaTab(
  tab: "levels" | "compare" | "red-vs-blue"
): ArenaProgress {
  const current = getArenaProgress();
  const updated: ArenaProgress = {
    ...current,
    lastActiveTab: tab,
    updatedAt: Date.now(),
  };
  setStorageItem(STORAGE_KEYS.ARENA_PROGRESS, updated);
  return updated;
}

export function resetArenaProgress(): ArenaProgress {
  const reset = { ...STORAGE_DEFAULTS[STORAGE_KEYS.ARENA_PROGRESS], updatedAt: Date.now() };
  setStorageItem(STORAGE_KEYS.ARENA_PROGRESS, reset);
  return reset;
}
