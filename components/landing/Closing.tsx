"use client";

import React from "react";
import Link from "next/link";

export function Closing() {
  return (
    <section
      className="py-24 md:py-32 bg-daylight text-navy border-t border-navy/10"
      aria-label="Call to action"
    >
      <div className="mx-auto max-w-6xl px-6 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Main Headline — Sentence case, plain verbs, no accented word */}
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy leading-tight">
            Open the dashboard and run your first experiment.
          </h2>

          <p className="font-sans text-lg text-navy/80 leading-[1.65] max-w-[60ch] mx-auto">
            Test variations side by side, measure token consumption, and build
            intuition for how large language models respond to instructions.
          </p>

          <div className="pt-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-ultramarine px-8 py-4 font-sans text-base font-semibold text-white shadow-sm hover:bg-ultramarine/90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine focus-visible:ring-offset-2 focus-visible:ring-offset-daylight"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
