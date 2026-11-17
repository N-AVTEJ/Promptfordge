"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { curriculumStats, HERO_SEGMENTS } from "@/content/landing";

export function Hero() {
  const prefersReduced = useReducedMotion();
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-daylight text-navy overflow-hidden">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-3xl">
          {/* Main Headline — single uniform styling, no accented word */}
          <h1 className="font-sans text-4xl sm:text-5xl lg:text-[68px] font-bold tracking-tight text-navy leading-[1.08]">
            Learn to talk to AI by running the experiment.
          </h1>

          {/* Subline with strictly derived counts */}
          <p className="mt-6 font-sans text-lg sm:text-xl text-navy/80 leading-[1.65] max-w-[65ch]">
            {curriculumStats.totalModules} modules, {curriculumStats.totalVideos}{" "}
            hand-picked videos, and labs where you change one word and see what
            happens.
          </p>

          {/* Call to action buttons — no arrows */}
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-ultramarine px-6 py-3.5 font-sans text-base font-semibold text-white shadow-sm hover:bg-ultramarine/90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine focus-visible:ring-offset-2 focus-visible:ring-offset-daylight"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/academy/mod-01/mod-01-les-01"
              className="inline-flex items-center justify-center rounded-lg border border-navy/25 bg-white/60 px-6 py-3.5 font-sans text-base font-medium text-navy hover:bg-navy/5 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine focus-visible:ring-offset-2 focus-visible:ring-offset-daylight"
            >
              Watch the first lesson
            </Link>
          </div>
        </div>

        {/* The Sentence IS the Hero — Set huge in JetBrains Mono */}
        <div className="mt-16 md:mt-24">
          <div className="relative rounded-2xl border border-navy/15 bg-white p-6 sm:p-10 md:p-14 shadow-sm">
            <div
              className="font-mono text-2xl sm:text-3xl md:text-4xl lg:text-[44px] font-semibold text-navy leading-[1.5] tracking-tight selection:bg-ultramarine/20"
              aria-label="Example prompt decomposed into role, task, context, and constraint"
            >
              {HERO_SEGMENTS.map((seg, index) => {
                const isHovered = activeSegment === seg.id;
                // Stagger sweep animation on page load (one page-load sequence)
                const animationDelay = prefersReduced
                  ? "0s"
                  : `${0.15 + index * 0.25}s`;

                return (
                  <span
                    key={seg.id}
                    className="relative inline-block my-1.5 mr-3 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine rounded"
                    tabIndex={0}
                    role="button"
                    aria-label={`${seg.label}: ${seg.text}`}
                    onMouseEnter={() => setActiveSegment(seg.id)}
                    onMouseLeave={() => setActiveSegment(null)}
                    onFocus={() => setActiveSegment(seg.id)}
                    onBlur={() => setActiveSegment(null)}
                  >
                    {/* Plain label on hover or focus */}
                    <span
                      className={`absolute -top-7 left-0 rounded px-2 py-0.5 font-sans text-xs font-semibold shadow-sm transition-opacity pointer-events-none ${
                        seg.badgeClass
                      } ${
                        isHovered
                          ? "opacity-100"
                          : "opacity-0 group-hover:opacity-100 group-focus:opacity-100"
                      }`}
                      aria-hidden="true"
                    >
                      {seg.label}
                    </span>

                    {/* Text content */}
                    <span className="relative z-10">{seg.text}</span>

                    {/* Highlighter stripe sweeping under the text on load */}
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-[40%] -z-0 rounded-sm pointer-events-none ${seg.highlighterClass}`}
                      style={{
                        transformOrigin: "left center",
                        animation: prefersReduced
                          ? "none"
                          : `highlighterSweep 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${animationDelay} both`,
                      }}
                      aria-hidden="true"
                    />
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Highlighter sweep keyframes */}
      <style jsx global>{`
        @keyframes highlighterSweep {
          0% {
            transform: scaleX(0);
            opacity: 0.3;
          }
          100% {
            transform: scaleX(1);
            opacity: 1;
          }
        }
      `}</style>
    </section>
  );
}
