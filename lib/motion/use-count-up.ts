import { useState, useEffect } from "react";
import { useReducedMotion } from "./use-reduced-motion";

/**
 * useCountUp hook: Animates a numeric counter smoothly over durationMs.
 * Completely respects prefers-reduced-motion (resolves immediately).
 */
export function useCountUp(target: number, durationMs = 800): number {
  const prefersReduced = useReducedMotion();
  const [current, setCurrent] = useState<number>(() => (prefersReduced ? target : 0));

  useEffect(() => {
    if (prefersReduced) {
      setCurrent(target);
      return;
    }

    if (target === 0) {
      setCurrent(0);
      return;
    }

    let frameId: number;
    const startTime = performance.now();
    const startVal = 0;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // easeOutExpo curve
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const val = Math.round(startVal + (target - startVal) * eased);
      setCurrent(val);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [target, durationMs, prefersReduced]);

  return current;
}

export const countUp = useCountUp;
