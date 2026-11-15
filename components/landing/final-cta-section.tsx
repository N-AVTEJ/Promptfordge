"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, ArrowRight, BookOpen } from "lucide-react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

export function FinalCtaSection() {
  const prefersReduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-cream py-20 lg:py-28">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={prefersReduced ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={
            prefersReduced
              ? { duration: 0 }
              : { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
          }
          className="relative rounded-3xl border border-indigo-950/10 bg-white p-8 sm:p-14 shadow-card"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-coral/30 bg-coral/10 px-4 py-1.5 text-xs font-bold text-coral">
            <Flame className="h-4 w-4 text-coral" />
            <span>The Forge Awaits</span>
          </div>

          {/* Large Headline */}
          <h2 className="mt-6 font-sans text-3xl font-black tracking-tight text-indigo sm:text-5xl">
            Stop Guessing Prompts.
            <br />
            <span className="text-coral">Start Engineering Systems.</span>
          </h2>

          <p className="mx-auto mt-4 max-w-[65ch] text-base leading-[1.7] text-indigo-900/75">
            Ten comprehensive curriculum modules. Interactive browser-based token telemetry.
            Real evaluation assertions that protect your production pipelines from hallucination.
          </p>

          {/* Action CTAs: Go to Dashboard priority */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-coral px-8 py-4 font-sans text-sm font-bold text-white shadow-coral-glow transition-all hover:bg-coral-600 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/academy"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-950/15 bg-cream px-7 py-4 font-sans text-sm font-bold text-indigo shadow-card transition-all hover:bg-white hover:border-violet/40 hover:text-violet"
            >
              <BookOpen className="h-4 w-4 text-violet" />
              <span>Enter Academy</span>
            </Link>
          </div>

          {/* Invariant Note */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 border-t border-indigo-950/10 pt-6 font-mono text-xs text-indigo-900/60">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-teal inline-block" />
              Free & Open Sandbox
            </span>
            <span className="h-1 w-1 rounded-full bg-indigo-950/20" />
            <span>Zero Authentication Wall</span>
            <span className="h-1 w-1 rounded-full bg-indigo-950/20" />
            <span>Lightweight Client Architecture</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
