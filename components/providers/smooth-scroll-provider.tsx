"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

if (typeof window !== "undefined") {
  (window as unknown as { ScrollTrigger: typeof ScrollTrigger }).ScrollTrigger =
    ScrollTrigger;
}

interface SmoothScrollContextType {
  lenis: Lenis | null;
}

const SmoothScrollContext = createContext<SmoothScrollContextType>({
  lenis: null,
});

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const prefersReduced = useReducedMotion();
  const [lenisInstance, setLenisInstance] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // If user prefers reduced motion, do not intercept natural browser scroll
    if (prefersReduced) {
      ScrollTrigger.refresh();
      const nativeScrollHandler = () => {
        ScrollTrigger.update();
      };
      window.addEventListener("scroll", nativeScrollHandler, { passive: true });
      return () => {
        window.removeEventListener("scroll", nativeScrollHandler);
      };
    }

    const lenis = new Lenis({
      duration: 0.85,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
      autoRaf: false,
    });

    lenisRef.current = lenis;
    setLenisInstance(lenis);

    // Connect Lenis scroll event to ScrollTrigger update
    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    // Also connect window scroll listener for safety
    const onWindowScroll = () => {
      ScrollTrigger.update();
    };
    window.addEventListener("scroll", onWindowScroll, { passive: true });

    // Single RAF loop: drive Lenis updates exclusively via GSAP ticker
    // Prevents double-ticking and keeps GSAP and Lenis perfectly in sync
    const tickerUpdate = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerUpdate);

    // Disable GSAP lag smoothing to avoid jumps during heavy scroll
    gsap.ticker.lagSmoothing(0);

    // Recalculate ScrollTrigger pins after layout settlements
    const refreshTrigger = () => {
      ScrollTrigger.refresh();
    };

    if (typeof document !== "undefined" && document.fonts?.ready) {
      document.fonts.ready.then(refreshTrigger);
    }

    window.addEventListener("load", refreshTrigger);
    window.addEventListener("resize", refreshTrigger);

    const t1 = setTimeout(refreshTrigger, 100);
    const t2 = setTimeout(refreshTrigger, 500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("load", refreshTrigger);
      window.removeEventListener("resize", refreshTrigger);
      window.removeEventListener("scroll", onWindowScroll);
      gsap.ticker.remove(tickerUpdate);
      lenis.destroy();
      lenisRef.current = null;
      setLenisInstance(null);
      // Restore standard GSAP lag smoothing default
      gsap.ticker.lagSmoothing(500, 33);
      ScrollTrigger.refresh();
    };
  }, [prefersReduced]);

  return (
    <SmoothScrollContext.Provider value={{ lenis: lenisInstance }}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
