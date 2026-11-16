"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Clock, BookOpen, ChevronRight, Layers } from "lucide-react";
import { CURRICULUM_MODULES, CurriculumModule } from "@/content/modules";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { CurvedDivider } from "@/components/ui/curved-divider";

gsap.registerPlugin(ScrollTrigger);

function ModuleCard({
  module,
  isActive = false,
}: {
  module: CurriculumModule;
  isActive?: boolean;
}) {
  const firstLesson = module.lessons[0];
  const targetHref = firstLesson
    ? `/academy/${module.id}/${firstLesson.id}`
    : `/academy/${module.id}`;

  return (
    <div
      className={`hover-lift flex h-full flex-col justify-between rounded-2xl border bg-white p-8 shadow-card transition-all ${
        isActive
          ? "border-coral/50 shadow-card-hover"
          : "border-indigo-950/10 hover:border-indigo-950/20"
      }`}
    >
      <div>
        {/* Module Number & Level */}
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-butter px-3 py-1 font-mono text-xs font-bold text-indigo border border-indigo-950/10">
            Module {String(module.number).padStart(2, "0")}
          </span>
          <span className="font-mono text-xs font-semibold text-teal">
            {module.level}
          </span>
        </div>

        {/* Title */}
        <h3 className="mt-5 font-sans text-xl font-bold text-indigo">
          {module.title}
        </h3>

        <p className="mt-1 text-xs font-bold uppercase tracking-wider text-coral">
          {module.subtitle}
        </p>

        <p className="mt-3 text-sm leading-[1.7] text-indigo-900/75">
          {module.description}
        </p>

        {/* Tags */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {module.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-cream px-2 py-0.5 font-mono text-[11px] text-indigo-900/70 border border-indigo-950/5"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-indigo-950/10">
        <div className="flex items-center justify-between text-xs font-mono text-indigo-900/60 mb-4">
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5 text-violet" />
            {module.lessonCount} Lessons
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5 text-teal" />
            {module.duration}
          </span>
        </div>

        <Link
          href={targetHref}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-coral/10 py-2.5 text-xs font-bold text-coral transition-colors hover:bg-coral hover:text-white"
        >
          <span>Open Module Studio</span>
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function ModulesHorizontalSection() {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState<boolean>(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const cardsRef = useRef<HTMLDivElement | null>(null);
  const [activeIdx, setActiveIdx] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (prefersReduced) return;

    const section = sectionRef.current;
    const track = trackRef.current;
    const cards = cardsRef.current;
    if (!section || !track || !cards) return;

    const ctx = gsap.context(() => {
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
        end: () => `+=${Math.max(1800, cards.scrollWidth - window.innerWidth + 400)}`,
        pin: track,
        pinSpacing: true,
        scrub: 0.3,
        animation: horizontalTween,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const idx = Math.min(
            CURRICULUM_MODULES.length - 1,
            Math.floor(self.progress * CURRICULUM_MODULES.length)
          );
          setActiveIdx(idx);
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

  // Reduced motion static fallback
  if (mounted && prefersReduced) {
    return (
      <section className="relative overflow-hidden bg-butter py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-950/15 bg-white px-4 py-1.5 text-xs font-bold text-indigo shadow-card">
              <Layers className="h-4 w-4 text-coral" />
              <span>Complete 10-Module Curriculum</span>
            </div>
            <h2 className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-indigo sm:text-5xl">
              From Token Splits to Autonomous Agents
            </h2>
            <p className="mt-4 max-w-[65ch] mx-auto text-base sm:text-lg leading-[1.7] text-indigo-900/75">
              The full pedagogical pathway spanning every layer of modern prompt architecture.
            </p>
          </div>

          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {CURRICULUM_MODULES.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </div>
        <CurvedDivider fillColor="text-lavender" />
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="relative bg-butter pt-0 pb-0">
      <div
        ref={trackRef}
        className="relative flex min-h-screen flex-col justify-center py-20 lg:py-28 overflow-hidden"
      >
        <div className="mx-auto w-full max-w-6xl px-6">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end mb-10">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-950/15 bg-white px-4 py-1.5 text-xs font-bold text-indigo shadow-card">
                <Layers className="h-4 w-4 text-coral" />
                <span>Horizontal Track · {CURRICULUM_MODULES.length} Modules</span>
              </div>
              <h2 className="mt-3 font-sans text-3xl font-extrabold tracking-tight text-indigo sm:text-5xl">
                From Token Splits to Autonomous Agents
              </h2>
            </div>
            <div className="font-mono text-xs font-semibold text-indigo-900/60">
              Module {activeIdx + 1} of {CURRICULUM_MODULES.length} · Scroll to advance track
            </div>
          </div>
        </div>

        {/* Pinned horizontal scrolling cards container */}
        <div className="w-full overflow-hidden px-6">
          <div
            ref={cardsRef}
            className="flex gap-8 will-change-transform pb-4"
            style={{ width: "max-content" }}
          >
            {CURRICULUM_MODULES.map((module, i) => (
              <div
                key={module.id}
                className="w-[340px] sm:w-[380px] shrink-0"
              >
                <ModuleCard module={module} isActive={i === activeIdx} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Curved Divider into Lavender Band */}
      <CurvedDivider fillColor="text-lavender" />
    </section>
  );
}
