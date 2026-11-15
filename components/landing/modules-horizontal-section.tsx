"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock, BookOpen, Flame, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CURRICULUM_MODULES, CurriculumModule } from "@/content/modules";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

gsap.registerPlugin(ScrollTrigger);

export function ModulesHorizontalSection() {
  const prefersReduced = useReducedMotion();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const [activeModuleIdx, setActiveModuleIdx] = useState<number>(0);

  useEffect(() => {
    if (prefersReduced) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    const cards = cardsRef.current;
    if (!section || !track || !cards) return;

    const ctx = gsap.context(() => {
      // Calculate total horizontal scroll distance
      const getScrollAmount = () => {
        const cardsWidth = cards.scrollWidth;
        const windowWidth = window.innerWidth;
        return -(cardsWidth - windowWidth + 96);
      };

      const horizontalTween = gsap.to(cards, {
        x: getScrollAmount,
        ease: "none",
      });

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () =>
          `+=${Math.max(2400, cards.scrollWidth - window.innerWidth + 800)}`,
        pin: track,
        pinSpacing: true,
        scrub: 0.8,
        animation: horizontalTween,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(
            CURRICULUM_MODULES.length - 1,
            Math.floor(self.progress * CURRICULUM_MODULES.length)
          );
          setActiveModuleIdx(idx);
        },
      });
    }, section);

    const handleResize = () => {
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      ctx.revert();
      window.removeEventListener("resize", handleResize);
    };
  }, [prefersReduced]);

  // Reduced motion fallback: responsive standard grid
  if (prefersReduced) {
    return (
      <section className="relative mx-auto max-w-7xl bg-forge-950 px-4 py-24 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-md border border-white/[0.1] bg-white/[0.04] px-3 py-1 font-mono text-xs text-zinc-300">
            <span>Complete 10-module curriculum</span>
          </div>
          <h2 className="mt-4 font-mono text-3xl font-extrabold text-forge-text sm:text-5xl">
            From Token Splits to Autonomous Swarms
          </h2>
          <p className="mt-3 text-forge-muted">
            The full pedagogical pathway spanning every layer of the prompt
            engineering stack.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CURRICULUM_MODULES.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative z-10 bg-forge-950">
      <div
        ref={trackRef}
        className="flex min-h-screen flex-col justify-center overflow-hidden py-12"
      >
        {/* Pinned Header Controls */}
        <div className="mx-auto mb-8 w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/[0.08] pb-6">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-ember-400">
                <Flame className="h-4 w-4" />
                <span>The 10 curriculum modules</span>
              </div>
              <h2 className="mt-2 font-mono text-3xl font-extrabold text-forge-text sm:text-4xl">
                Master the Full Architecture
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-forge-muted">
                Module{" "}
                <strong className="text-ember-400">
                  {activeModuleIdx + 1}
                </strong>{" "}
                of {CURRICULUM_MODULES.length}
              </span>
              {/* Progress mini indicator */}
              <div className="flex h-1.5 w-32 overflow-hidden rounded-full bg-white/[0.08]">
                <div
                  className="bg-ember-500 transition-all duration-150"
                  style={{
                    width: `${((activeModuleIdx + 1) / CURRICULUM_MODULES.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Sliding Track */}
        <div className="w-full pl-4 sm:pl-8 lg:pl-16">
          <div
            ref={cardsRef}
            className="flex gap-6 pr-12 will-change-transform"
            style={{ width: "max-content" }}
          >
            {CURRICULUM_MODULES.map((module) => (
              <div key={module.id} className="w-[340px] shrink-0 sm:w-[400px]">
                <ModuleCard module={module} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ModuleCard({ module }: { module: CurriculumModule }) {
  const isAmber = module.accent === "amber";

  return (
    <div
      className={`group relative flex h-full flex-col justify-between rounded-xl border border-white/[0.08] bg-gradient-to-b from-[#13161F] to-[#0A0C0F] p-6 transition-all duration-200 hover:border-white/[0.2] sm:p-7 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/[0.12] before:to-transparent`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span
            className={`font-mono text-2xl font-bold ${
              isAmber ? "text-ember-400" : "text-cyan-400"
            }`}
          >
            {module.number < 10 ? `0${module.number}` : module.number}
          </span>
          <Badge
            variant="outline"
            className="border-white/[0.1] bg-white/[0.04] font-mono text-[11px] text-zinc-300"
          >
            {module.level}
          </Badge>
        </div>

        {/* Title & Subtitle */}
        <h3 className="mt-4 font-mono text-xl font-bold text-forge-text group-hover:text-white transition-colors">
          {module.title}
        </h3>
        <p className="mt-1 font-mono text-xs text-forge-muted">
          {module.subtitle}
        </p>

        {/* Description */}
        <p className="mt-3 text-xs leading-relaxed text-zinc-400 sm:text-sm">
          {module.description}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {module.tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-white/[0.06] bg-black/30 px-2 py-0.5 font-mono text-[10px] text-zinc-400"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Takeaway Box */}
        <div className="mt-4 rounded-lg border border-white/[0.06] bg-black/40 p-3 font-mono text-xs text-zinc-300">
          <span className="mb-0.5 block text-[10px] uppercase tracking-wider text-ember-400 font-semibold">
            Core invariant:
          </span>
          &ldquo;{module.keyTakeaway}&rdquo;
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="mt-6 border-t border-white/[0.06] pt-4">
        <div className="mb-4 flex items-center justify-between font-mono text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> {module.lessonCount} Lessons
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {module.duration}
          </span>
        </div>

        <Button
          asChild
          variant="outline"
          className="w-full justify-between border-white/[0.08] bg-white/[0.03] font-mono text-xs text-zinc-200 hover:border-white/[0.2] hover:bg-white/[0.06] hover:text-white"
        >
          <Link href="/academy">
            <span>Explore curriculum</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
