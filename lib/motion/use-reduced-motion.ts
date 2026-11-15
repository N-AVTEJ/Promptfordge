"use client";

import { useEffect, useState } from "react";

/**
 * SSR-safe hook to detect user prefers-reduced-motion setting.
 * Always returns false on initial render (both SSR and client hydration) to guarantee
 * zero hydration mismatches (React errors #425, #422).
 * Safely updates to true after mounting if the user's OS prefers reduced motion.
 */
export function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) {
      setPrefersReduced(true);
    }

    const handler = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReduced;
}
