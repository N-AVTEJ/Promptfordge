"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Clock,
  BookOpen,
  Flame,
  ChevronRight,
} from "lucide-react";
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
        end: () => `+=${Math.max(2400, cards.scrollWidth - window.innerWidth + 800)}`,
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
      <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 bg-forge-950">
        <div className="mb-12 text-center">
          <Badge
            variant="outline"
            className="border-ember-500/40 bg-ember-500/10 font-mono text-xs text-ember-400"
          >
            COMPLETE 10-MODULE CURRICULUM
          </Badge>
          <h2 className="mt-4 font-mono text-3xl font-extrabold text-forge-text sm:text-5xl">
            From Token Splits to Autonomous Swarms
          </h2>
          <p className="mt-3 text-forge-muted">
            The full pedagogical pathway spanning every layer of the prompt engineering stack.
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
      <div ref={trackRef} className="flex min-h-screen flex-col justify-center overflow-hidden py-12">
        {/* Pinned Header Controls */}
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mb-8">
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-forge-border/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-ember-400">
                <Flame className="h-4 w-4" />
                <span>THE 10 FORGE MODULES</span>
              </div>
              <h2 className="mt-2 font-mono text-3xl font-extrabold text-forge-text sm:text-4xl">
                Master the Full Architecture
              </h2>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-mono text-xs text-forge-muted">
                Showing Module <strong className="text-ember-400">{activeModuleIdx + 1}</strong> of {CURRICULUM_MODULES.length}
              </span>
              {/* Progress mini indicator */}
              <div className="flex h-2 w-32 overflow-hidden rounded-full bg-forge-border">
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
              <div key={module.id} className="w-[340px] sm:w-[400px] shrink-0">
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
      className={`group flex h-full flex-col justify-between rounded-2xl border p-6 sm:p-7 bg-forge-900/90 shadow-xl transition-all duration-300 hover:scale-[1.01] ${
        isAmber
          ? "border-ember-500/30 hover:border-ember-500/70 hover:shadow-[0_0_25px_rgba(255,107,0,0.15)]"
          : "border-cyan-500/30 hover:border-cyan-500/70 hover:shadow-[0_0_25px_rgba(0,229,255,0.15)]"
      }`}
    >
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <span
            className={`font-mono text-2xl font-black ${
              isAmber ? "text-ember-400" : "text-cyan-400"
            }`}
          >
            {module.number < 10 ? `0${module.number}` : module.number}
          </span>
          <Badge
            variant="outline"
            className={`font-mono text-xs ${
              isAmber
                ? "border-ember-500/40 text-ember-400"
                : "border-cyan-500/40 text-cyan-400"
            }`}
          >
            {module.level}
          </Badge>
        </div>

        {/* Title & Subtitle */}
        <h3 className="mt-4 font-mono text-xl font-bold text-forge-text group-hover:text-forge-50">
          {module.title}
        </h3>
        <p className="mt-1 font-mono text-xs text-forge-muted">{module.subtitle}</p>

        {/* Description */}
        <p className="mt-3 text-xs leading-relaxed text-forge-muted sm:text-sm">
          {module.description}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {module.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-forge-surface px-2 py-0.5 font-mono text-[10px] text-forge-text/80 border border-forge-border"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Takeaway Box */}
        <div className="mt-4 rounded-lg border border-forge-border/40 bg-forge-surface/60 p-3 font-mono text-xs text-forge-text/90">
          <span className="text-[10px] uppercase text-ember-400 block mb-0.5">Core Invariant:</span>
          &ldquo;{module.keyTakeaway}&rdquo;
        </div>
      </div>

      {/* Footer Info & Action */}
      <div className="mt-6 border-t border-forge-border/60 pt-4">
        <div className="flex items-center justify-between font-mono text-xs text-forge-muted mb-4">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> {module.lessonCount} Lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {module.duration}
          </span>
        </div>

        <Button
          asChild
          variant="outline"
          className="w-full justify-between font-mono text-xs border-forge-border hover:border-ember-500 hover:text-ember-400"
        >
          <Link href="/academy">
            <span>Explore Curriculum</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
