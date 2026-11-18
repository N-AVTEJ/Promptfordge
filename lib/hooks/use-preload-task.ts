import { useEffect } from "react";

/**
 * Safely extracts the preloaded task string from the URL search query parameter `?task=...`
 * without de-opting Next.js App Router pages during static generation.
 */
export function getPreloadedTask(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const task = params.get("task");
  if (!task) return null;
  try {
    const parsed = JSON.parse(task);
    if (typeof parsed === "string") return parsed;
    if (typeof parsed === "object" && parsed !== null) {
      return (
        parsed.prompt ||
        parsed.task ||
        parsed.starterPrompt ||
        parsed.inputPrompt ||
        JSON.stringify(parsed)
      );
    }
  } catch {
    // Plain string
  }
  return task;
}

/**
 * Hook that calls `onTaskFound(task)` on mount if a valid `?task=` param is present.
 */
export function usePreloadTask(onTaskFound: (task: string) => void) {
  useEffect(() => {
    const task = getPreloadedTask();
    if (task && task.trim()) {
      onTaskFound(task.trim());
    }
  }, [onTaskFound]);
}
