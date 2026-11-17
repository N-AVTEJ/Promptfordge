"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Play } from "lucide-react";
import { CURRICULUM_MODULES } from "@/content/modules";

export function LessonPreview() {
  const [isPlaying, setIsPlaying] = useState(false);

  // Lesson 1 of Module 1
  const mod1 = CURRICULUM_MODULES[0];
  const lesson = mod1?.lessons[0];
  const videoId = "LPZh9BOjkQs";

  const chapters = lesson?.chapters || [
    { time: 0, label: "From Rules to Probabilities: The AI Timeline" },
    { time: 65, label: "From Symbolic AI to Neural Networks" },
    { time: 140, label: "Scaling Laws and In-Context Reasoning" },
    { time: 245, label: "Modern Foundation Model Breakthroughs" },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <section
      className="py-20 md:py-28 bg-daylight text-navy border-t border-navy/10"
      aria-label="Interactive lesson studio preview"
    >
      <div className="mx-auto max-w-6xl px-6">
        {/* Section Headline — Sentence case, no accented word, no eyebrow */}
        <div className="max-w-3xl mb-14">
          <h2 className="font-sans text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-navy">
            Inside the lesson studio
          </h2>
          <p className="mt-4 font-sans text-lg text-navy/80 leading-[1.65]">
            Every lesson pairs a curated technical breakdown with interactive
            checkpoints, timestamped chapters, and verifiable labs.
          </p>
        </div>

        {/* Studio Mock Container */}
        <div className="rounded-2xl border border-navy/15 bg-white p-6 lg:p-8 shadow-sm">
          {/* Studio Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-navy/10 gap-3">
            <div>
              <h3 className="font-sans text-xl font-bold text-navy">
                {lesson?.title || "Evolution of AI and LLMs"}
              </h3>
              <p className="font-mono text-xs text-navy/60 mt-1">
                Module 01 · Lesson 01
              </p>
            </div>
            <Link
              href="/academy/mod-01/mod-01-les-01"
              className="inline-flex items-center justify-center rounded-lg bg-ultramarine px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm hover:bg-ultramarine/90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
            >
              Open this lesson
            </Link>
          </div>

          {/* Studio 3-Column Work Area */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Chapters */}
            <div className="lg:col-span-3 rounded-xl border border-navy/10 bg-daylight/50 p-4 space-y-3">
              <h4 className="font-sans text-xs font-semibold text-navy/70">
                Lesson Chapters
              </h4>
              <div className="space-y-1.5">
                {chapters.map((ch, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-navy/5 text-left transition-colors"
                  >
                    <span className="font-mono text-xs font-semibold text-ultramarine shrink-0 mt-0.5">
                      {formatTime(ch.time)}
                    </span>
                    <span className="font-sans text-xs text-navy/85 leading-snug">
                      {ch.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Center Column: Video Player with Thumbnail Facade */}
            <div className="lg:col-span-6">
              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-navy/15 bg-navy shadow-inner flex items-center justify-center">
                {isPlaying ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
                    title="Large Language Models explained briefly by 3Blue1Brown"
                    className="h-full w-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="relative h-full w-full group">
                    {/* Thumbnail Image */}
                    <Image
                      src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
                      alt="Lesson video preview thumbnail"
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {/* Overlay scrim */}
                    <div className="absolute inset-0 bg-navy/40 transition-opacity group-hover:bg-navy/30" />

                    {/* Centered Play Button Facade */}
                    <button
                      type="button"
                      onClick={() => setIsPlaying(true)}
                      aria-label="Play video: Large Language Models explained briefly"
                      className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-ultramarine text-white shadow-lg transition-transform hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white"
                    >
                      <Play className="h-7 w-7 text-white fill-white ml-0.5" />
                    </button>

                    {/* Video meta pill */}
                    <div className="absolute bottom-3 left-3 rounded bg-navy/80 px-2.5 py-1 font-sans text-xs text-white backdrop-blur-sm">
                      3Blue1Brown · 8 mins
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Lesson Notes */}
            <div className="lg:col-span-3 rounded-xl border border-navy/10 bg-daylight/50 p-4 space-y-4">
              <div>
                <h4 className="font-sans text-xs font-semibold text-navy/70 mb-1.5">
                  Core concept
                </h4>
                <p className="font-sans text-xs text-navy/80 leading-relaxed">
                  Prompts are conditional prefixes steering high-dimensional
                  probability distributions across subword tokens.
                </p>
              </div>

              <div>
                <h4 className="font-sans text-xs font-semibold text-navy/70 mb-1.5">
                  Before you watch
                </h4>
                <ul className="space-y-1 font-sans text-xs text-navy/80 list-disc pl-4">
                  <li>Notice how next-token prediction works mathematically.</li>
                  <li>Observe the difference between words and subwords.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
