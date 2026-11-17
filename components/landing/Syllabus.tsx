"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { CURRICULUM_MODULES } from "@/content/modules";

export function Syllabus() {
  const prefersReduced = useReducedMotion();
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setOpenModuleId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      className="py-20 md:py-28 bg-daylight text-navy border-t border-navy/10"
      aria-label="Curriculum syllabus"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Heading — Sentence case, no accenting a single word */}
        <div className="max-w-3xl mb-14">
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy">
            Curriculum syllabus
          </h2>
          <p className="mt-4 font-sans text-lg text-navy/80 leading-[1.65]">
            Twelve comprehensive modules designed to take you from foundational
            token mechanics to production-grade agent reasoning.
          </p>
        </div>

        {/* Large Accordion Rows (Only one open at a time) */}
        <div className="divide-y divide-navy/15 border-y border-navy/15">
          {CURRICULUM_MODULES.map((mod) => {
            const isOpen = openModuleId === mod.id;
            const formattedNumber = String(mod.number).padStart(2, "0");

            return (
              <div key={mod.id} className="transition-colors">
                {/* Clickable Header Row */}
                <button
                  type="button"
                  onClick={() => toggleRow(mod.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      toggleRow(mod.id);
                    }
                  }}
                  aria-expanded={isOpen}
                  aria-controls={`syllabus-content-${mod.id}`}
                  className="w-full py-6 text-left flex flex-col md:flex-row md:items-center justify-between gap-4 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine focus-visible:ring-inset"
                >
                  {/* Left: Module Number & Title */}
                  <div className="flex items-baseline gap-4 md:gap-6 min-w-0">
                    <span className="font-mono text-sm sm:text-base font-semibold text-ultramarine shrink-0">
                      {formattedNumber}
                    </span>
                    <span className="font-sans text-xl sm:text-2xl font-bold text-navy group-hover:text-ultramarine transition-colors truncate">
                      {mod.title}
                    </span>
                  </div>

                  {/* Right: Metrics & Expand State */}
                  <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs sm:text-sm text-navy/70 shrink-0">
                    <span>{mod.lessonCount} lessons</span>
                    <span className="text-navy/30">·</span>
                    <span>{mod.videoCount} videos</span>
                    <span className="text-navy/30">·</span>
                    <span>{mod.duration || mod.totalWatchTime || "45 mins"}</span>
                    <span
                      className={`ml-2 text-base font-sans font-bold text-ultramarine transition-transform duration-200 ${
                        isOpen ? "rotate-45" : ""
                      }`}
                      aria-hidden="true"
                    >
                      +
                    </span>
                  </div>
                </button>

                {/* Expanded Topic List (Smooth height via Framer motion) */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`syllabus-content-${mod.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={
                        prefersReduced
                          ? { duration: 0 }
                          : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }
                      }
                      className="overflow-hidden"
                    >
                      <div className="pb-8 pt-2 pl-8 md:pl-12 pr-4 space-y-6">
                        <p className="font-sans text-base text-navy/80 leading-[1.65] max-w-[65ch]">
                          {mod.summary || mod.description}
                        </p>

                        {/* Topics / Key Concepts */}
                        {mod.keyConcepts && mod.keyConcepts.length > 0 && (
                          <div>
                            <h4 className="font-sans text-sm font-semibold text-navy/90 mb-2">
                              Core topics covered:
                            </h4>
                            <ul className="space-y-1.5 font-sans text-sm text-navy/75 list-disc pl-5">
                              {mod.keyConcepts.map((concept, i) => (
                                <li key={i}>{concept}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Direct link to module in academy */}
                        <div className="pt-2">
                          <Link
                            href={`/academy/${mod.id}`}
                            className="inline-flex items-center justify-center rounded-md border border-navy/20 bg-white px-4 py-2 font-sans text-sm font-medium text-navy hover:bg-navy/5 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
                          >
                            Explore module
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
