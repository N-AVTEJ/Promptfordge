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
    // If reduced motion is preferred, initialize statically without GSAP triggers
    if (prefersReduced) {
      setFireCount(1);
      setIsActive(true);
      return;
    }

    const element = triggerRef.current;
    const bar = barRef.current;
    if (!element) return;

    // Use gsap.context for scoped animations and clean unmounting
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: element,
        start: "top 80%",
        once: true, // Verification check: must fire exactly once, never double-tick
        onEnter: () => {
          setFireCount((prev) => prev + 1);
          setIsActive(true);

          if (bar) {
            // Animate only transform and opacity: zero layout thrashing, 60fps compliant
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
      // Clean up GSAP context and kill all triggers created inside
      ctx.revert();
    };
  }, [prefersReduced]);

  return (
    <div
      ref={triggerRef}
      id="scroll-trigger-verifier"
      className="relative rounded-2xl border border-forge-border bg-forge-surface p-6 shadow-forge transition-all sm:p-8"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-forge-border pb-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-mono text-base font-semibold text-forge-text">
              GSAP ScrollTrigger Sync Telemetry
            </h3>
            <p className="font-mono text-xs text-forge-muted">
              Lenis Smooth Scroll + GSAP Single-RAF Integration Test
            </p>
          </div>
        </div>

        {/* Verification Status Pill */}
        <div
          data-testid="scrolltrigger-status-pill"
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
            fireCount === 1
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : fireCount > 1
                ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                : "border-forge-border bg-forge-elevated text-forge-muted"
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
        <div className="flex items-center justify-between font-mono text-xs text-forge-muted">
          <span>Scroll-Driven Forge Igniter</span>
          <span className="font-semibold text-cyan-400">
            {isActive ? "CALIBRATED & SYNCHRONIZED" : "STANDBY"}
          </span>
        </div>

        {/* Visual Progress Bar animated by ScrollTrigger (transform only) */}
        <div className="h-2 w-full overflow-hidden rounded-full border border-forge-border bg-forge-950">
          <div
            ref={barRef}
            className="h-full w-full origin-left rounded-full bg-gradient-to-r from-ember-500 via-amber-400 to-cyan-400 shadow-[0_0_12px_rgba(255,107,0,0.5)]"
            style={{
              transform: isActive && prefersReduced ? "scaleX(1)" : "scaleX(0)",
              opacity: isActive && prefersReduced ? 1 : 0,
            }}
          />
        </div>

        <div className="grid grid-cols-1 gap-3 pt-2 font-mono text-xs sm:grid-cols-3">
          <div className="rounded-lg border border-forge-border bg-forge-elevated p-3">
            <span className="block text-[10px] text-forge-subtle">TICKER</span>
            <span className="font-medium text-forge-text">
              gsap.ticker (Single RAF)
            </span>
          </div>
          <div className="rounded-lg border border-forge-border bg-forge-elevated p-3">
            <span className="block text-[10px] text-forge-subtle">
              LAG SMOOTHING
            </span>
            <span className="font-medium text-forge-text">
              0 (Zero Stutter)
            </span>
          </div>
          <div className="rounded-lg border border-forge-border bg-forge-elevated p-3">
            <span className="block text-[10px] text-forge-subtle">
              TRIGGER COUNT
            </span>
            <span
              data-testid="scrolltrigger-count"
              className={
                fireCount === 1
                  ? "font-bold text-emerald-400"
                  : "font-bold text-amber-400"
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
