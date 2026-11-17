"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { TECHNIQUE_ROWS } from "@/content/landing";

export function TechniqueRows() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasEntered, setHasEntered] = useState(false);

  useEffect(() => {
    if (prefersReduced) {
      setHasEntered(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasEntered(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [prefersReduced]);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 bg-daylight text-navy border-t border-navy/10"
      aria-label="Prompting techniques comparison"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Header — Sentence case, no accented word, no eyebrow */}
        <div className="max-w-3xl mb-14">
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy">
            Run it, don&apos;t just watch it
          </h2>
          <p className="mt-4 font-sans text-lg text-navy/80 leading-[1.65]">
            Each technique trades token count for precision. Compare them side
            by side in live runs.
          </p>
        </div>

        {/* Six Flat Rows — No cards */}
        <div className="divide-y divide-navy/10 border-y border-navy/10">
          {TECHNIQUE_ROWS.map((row) => {
            const barPercentage = Math.round(
              (row.tokensUsed / row.maxTokens) * 100
            );

            return (
              <div
                key={row.id}
                className="py-5 sm:py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center"
              >
                {/* Technique Name & One-line Plain Explanation */}
                <div className="md:col-span-4">
                  <h3 className="font-sans text-lg font-bold text-navy">
                    {row.name}
                  </h3>
                  <p className="font-sans text-sm text-navy/70 mt-1 leading-normal">
                    {row.explanation}
                  </p>
                </div>

                {/* Sample Run Label & Prompt Snippet */}
                <div className="md:col-span-5 bg-white/70 rounded-lg p-3 border border-navy/10">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-navy/60">
                      Sample run
                    </span>
                  </div>
                  <p className="font-mono text-xs text-navy/90 mt-1 truncate">
                    {row.samplePrompt}
                  </p>
                </div>

                {/* Animated Token Bar (draws once on entry) */}
                <div className="md:col-span-3 space-y-1.5">
                  <div className="flex items-center justify-between font-mono text-xs text-navy/70">
                    <span>Tokens</span>
                    <span className="font-semibold text-navy">
                      {row.tokensUsed}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-navy/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-ultramarine transition-all duration-1000 ease-out"
                      style={{
                        width: hasEntered ? `${barPercentage}%` : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Single Button — No arrows */}
        <div className="mt-12">
          <Link
            href="/labs/compare"
            className="inline-flex items-center justify-center rounded-lg bg-ultramarine px-6 py-3.5 font-sans text-base font-semibold text-white shadow-sm hover:bg-ultramarine/90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine focus-visible:ring-offset-2 focus-visible:ring-offset-daylight"
          >
            Try a comparison
          </Link>
        </div>
      </div>
    </section>
  );
}
