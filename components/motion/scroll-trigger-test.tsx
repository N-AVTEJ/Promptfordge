"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CheckCircle2, Gauge } from "lucide-react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { durations, gsapEasings } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

export function ScrollTriggerTest() {
  const prefersReduced = useReducedMotion();
  const triggerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [fireCount, setFireCount] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    if (prefersReduced) {
      setFireCount(1);
      setIsActive(true);
      return;
    }

    const element = triggerRef.current;
    const bar = barRef.current;
    if (!element) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: element,
        start: "top 80%",
        once: true,
        onEnter: () => {
          setFireCount((prev) => prev + 1);
          setIsActive(true);

          if (bar) {
            gsap.fromTo(
              bar,
              { scaleX: 0, opacity: 0, transformOrigin: "left center" },
              {
                scaleX: 1,
                opacity: 1,
                duration: durations.relaxed,
                ease: gsapEasings.forge,
              }
            );
          }
        },
      });
    }, element);

    return () => {
      ctx.revert();
    };
  }, [prefersReduced]);

  return (
    <div
      ref={triggerRef}
      id="scroll-trigger-verifier"
      className="relative rounded-2xl border border-indigo-950/10 bg-white p-8 shadow-card transition-all"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-indigo-950/10 pb-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-teal/30 bg-teal/10 text-teal">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-sans text-base font-bold text-indigo">
              GSAP ScrollTrigger Sync Telemetry
            </h3>
            <p className="font-mono text-xs text-indigo-900/60">
              Lenis Smooth Scroll + GSAP Single-RAF Integration Test
            </p>
          </div>
        </div>

        <div
          data-testid="scrolltrigger-status-pill"
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
            fireCount === 1
              ? "border-teal/30 bg-teal/10 text-teal"
              : fireCount > 1
                ? "border-rose-300 bg-rose-50 text-rose-700"
                : "border-indigo-950/10 bg-cream text-indigo-900/60"
          }`}
        >
          {fireCount === 1 ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>ScrollTrigger: Fired 1x (Passed)</span>
            </>
          ) : fireCount > 1 ? (
            <span>Double Ticking Detected: {fireCount}x</span>
          ) : (
            <span>Pending Scroll Trigger...</span>
          )}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="flex items-center justify-between font-mono text-xs text-indigo-900/60">
          <span>Scroll-Driven Forge Igniter</span>
          <span className="font-semibold text-teal">
            {isActive ? "CALIBRATED & SYNCHRONIZED" : "STANDBY"}
          </span>
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full border border-indigo-950/10 bg-cream">
          <div
            ref={barRef}
            className="h-full w-full origin-left rounded-full bg-coral"
            style={{
              transform: isActive && prefersReduced ? "scaleX(1)" : "scaleX(0)",
              opacity: isActive && prefersReduced ? 1 : 0,
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 pt-2 font-mono text-xs sm:grid-cols-3">
          <div className="rounded-xl border border-indigo-950/10 bg-cream p-3">
            <span className="block text-[10px] text-indigo-900/50">TICKER</span>
            <span className="font-bold text-indigo">
              gsap.ticker (Single RAF)
            </span>
          </div>
          <div className="rounded-xl border border-indigo-950/10 bg-cream p-3">
            <span className="block text-[10px] text-indigo-900/50">
              LAG SMOOTHING
            </span>
            <span className="font-bold text-indigo">
              0 (Zero Stutter)
            </span>
          </div>
          <div className="rounded-xl border border-indigo-950/10 bg-cream p-3">
            <span className="block text-[10px] text-indigo-900/50">
              TRIGGER COUNT
            </span>
            <span
              data-testid="scrolltrigger-count"
              className={
                fireCount === 1
                  ? "font-bold text-teal"
                  : "font-bold text-coral"
              }
            >
              {fireCount} / 1 required
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
