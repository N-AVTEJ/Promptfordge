"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, ArrowRight, Library, Sparkles, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { fadeUpVariants, fadeUpReducedVariants } from "@/lib/motion";

export function FinalCtaSection() {
  const prefersReduced = useReducedMotion();
  const activeVariant = prefersReduced ? fadeUpReducedVariants : fadeUpVariants;

  return (
    <section className="relative overflow-hidden py-24 sm:py-36 bg-forge-950 border-t border-forge-border/40">
      {/* Molten Amber Forge Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(255,107,0,0.18),rgba(11,12,14,0))]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          variants={activeVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-ember-500/30 bg-ember-500/10 px-4 py-1.5 font-mono text-xs font-semibold text-ember-400">
            <Flame className="h-4 w-4 animate-pulse-glow" />
            <span>THE FORGE AWAITS</span>
          </div>

          {/* Large Animated Headline */}
          <h2 className="mt-8 font-mono text-4xl font-black tracking-tight text-forge-text sm:text-6xl lg:text-7xl">
            Stop Guessing Prompts.
            <br />
            <span className="bg-gradient-to-r from-ember-400 via-amber-500 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(255,107,0,0.4)]">
              Start Engineering Systems.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-forge-muted sm:text-lg">
            Ten comprehensive modules. Interactive browser-based token telemetry.
            Real evaluation assertions that protect your production pipelines.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-14 px-8 font-mono text-base font-bold shadow-[0_0_30px_rgba(255,107,0,0.35)] hover:shadow-[0_0_45px_rgba(255,107,0,0.5)] transition-all"
            >
              <Link href="/academy" className="inline-flex items-center gap-2.5">
                <span>Enter the Academy</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-14 border-forge-border bg-forge-surface px-8 font-mono text-sm font-semibold text-forge-text hover:border-cyan-500 hover:text-cyan-400"
            >
              <Link href="/library" className="inline-flex items-center gap-2.5">
                <Library className="h-4 w-4 text-cyan-400" />
                <span>Browse Prompt Blueprints</span>
              </Link>
            </Button>
          </div>

          {/* Invariant Note */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 font-mono text-xs text-forge-muted">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-ember-400" /> 100% Free & Open Sandbox
            </span>
            <span className="h-1 w-1 rounded-full bg-forge-border" />
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" /> Zero Authentication Wall
            </span>
            <span className="h-1 w-1 rounded-full bg-forge-border" />
            <span className="flex items-center gap-1.5">
              <Flame className="h-3.5 w-3.5 text-ember-400" /> Embedded Video Masterclasses
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
