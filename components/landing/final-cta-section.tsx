"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, ArrowRight, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { fadeUpVariants, fadeUpReducedVariants } from "@/lib/motion";

export function FinalCtaSection() {
  const prefersReduced = useReducedMotion();
  const activeVariant = prefersReduced ? fadeUpReducedVariants : fadeUpVariants;

  return (
    <section className="relative overflow-hidden py-20 sm:py-32 bg-[#07080B] border-t border-white/[0.06]">
      {/* Precision hairline grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#14171d_1px,transparent_1px),linear-gradient(to_bottom,#14171d_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_60%,transparent_100%)] opacity-40"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          variants={activeVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-b from-[#11141A] to-[#0A0C0F] p-8 sm:p-14 shadow-2xl"
        >
          {/* Top Hairline Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none" />

          {/* Technical Tag */}
          <div className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-[#14171E] px-3 py-1 font-mono text-[11px] font-medium text-ember-400">
            <Flame className="h-3.5 w-3.5 text-ember-500" />
            <span>The Forge Awaits</span>
          </div>

          {/* Large Headline */}
          <h2 className="mt-6 font-mono text-3xl font-extrabold tracking-tight text-forge-text sm:text-5xl">
            Stop Guessing Prompts.
            <br />
            <span className="bg-gradient-to-r from-[#FF7A1A] via-[#FFA347] to-[#FF6600] bg-clip-text text-transparent">
              Start Engineering Systems.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-forge-muted sm:text-base">
            Ten comprehensive modules. Interactive browser-based token telemetry.
            Real evaluation assertions that protect your production pipelines.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-md border border-ember-400/30 bg-gradient-to-b from-[#FF7A1A] to-[#D94F00] px-6 font-mono text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-[#FF8A2E] hover:to-[#E65600] active:scale-[0.99]"
            >
              <Link href="/academy" className="inline-flex items-center gap-2">
                <span>Enter the Academy</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 rounded-md border border-white/[0.1] bg-gradient-to-b from-[#181B22] to-[#101216] px-6 font-mono text-xs font-semibold text-forge-text hover:border-white/[0.2] hover:bg-[#1A1E26] hover:text-white"
            >
              <Link href="/library" className="inline-flex items-center gap-2">
                <Library className="h-3.5 w-3.5 text-cyan-400" />
                <span>Browse Blueprints</span>
              </Link>
            </Button>
          </div>

          {/* Invariant Note */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5 border-t border-white/[0.06] pt-6 font-mono text-[11px] text-forge-muted">
            <span>Free & Open Sandbox</span>
            <span className="h-1 w-1 rounded-full bg-white/[0.2]" />
            <span>Zero Authentication Wall</span>
            <span className="h-1 w-1 rounded-full bg-white/[0.2]" />
            <span>Embedded Masterclasses</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
