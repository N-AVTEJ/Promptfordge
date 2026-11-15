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
      {/* Ambient Molten Forge Glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[420px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-amber-500/10 via-orange-600/10 to-amber-500/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          variants={activeVariant}
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="relative rounded-2xl border border-amber-500/20 bg-gradient-to-b from-[#141822] via-[#0E1017] to-[#0A0C0F] p-8 sm:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(255,107,0,0.08)]"
        >
          {/* Top Hairline Highlight */}
          <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent pointer-events-none" />

          {/* Technical Tag */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-950/40 px-3.5 py-1 font-mono text-[11px] font-medium text-amber-300 shadow-[0_0_15px_rgba(255,107,0,0.15)]">
            <Flame className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>The Forge Awaits</span>
          </div>

          {/* Large Headline */}
          <h2 className="mt-6 font-mono text-3xl font-extrabold tracking-tight text-forge-text sm:text-5xl">
            Stop Guessing Prompts.
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,122,26,0.3)]">
              Start Engineering Systems.
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-zinc-300 sm:text-base">
            Ten comprehensive modules. Interactive browser-based token telemetry.
            Real evaluation assertions that protect your production pipelines.
          </p>

          {/* Action CTAs: Landing Page -> Dashboard priority */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="group h-12 rounded-lg border border-amber-400/50 bg-gradient-to-r from-[#FF7A1A] via-[#FF8F33] to-[#E65100] px-7 font-mono text-sm font-bold text-white shadow-[0_0_25px_rgba(255,107,0,0.35),inset_0_1px_0_rgba(255,255,255,0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_0_35px_rgba(255,107,0,0.55)] active:scale-[0.99]"
            >
              <Link href="/dashboard" className="inline-flex items-center gap-2.5">
                <span>Launch Dashboard</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-lg border border-amber-500/30 bg-[#16120E] px-7 font-mono text-sm font-semibold text-amber-300 shadow-[0_0_15px_rgba(255,107,0,0.08)] transition-all hover:border-amber-400/60 hover:bg-[#201812] hover:text-amber-200"
            >
              <Link href="/academy" className="inline-flex items-center gap-2">
                <span>Enter Academy</span>
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-lg border border-cyan-500/30 bg-[#0E1520] px-7 font-mono text-sm font-semibold text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.08)] transition-all hover:border-cyan-400/60 hover:bg-[#121E2C] hover:text-cyan-200"
            >
              <Link href="/library" className="inline-flex items-center gap-2">
                <Library className="h-4 w-4 text-cyan-400" />
                <span>Browse Blueprints</span>
              </Link>
            </Button>
          </div>

          {/* Invariant Note */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-5 border-t border-white/[0.08] pt-6 font-mono text-xs text-zinc-400">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block"></span>Free & Open Sandbox</span>
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
