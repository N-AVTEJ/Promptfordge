"use client";

import React from "react";
import Link from "next/link";
import { Video, ArrowRight, BookOpen, Clock, Sparkles } from "lucide-react";
import { YouTubeEmbed } from "@/components/academy/youtube-embed";
import { CURRICULUM_MODULES } from "@/content/modules";
import { CurvedDivider } from "@/components/ui/curved-divider";

export function FeaturedLessonSection() {
  const featuredModule = CURRICULUM_MODULES[0]; // Module 01
  const featuredLesson = featuredModule.lessons[0]; // Lesson 01

  return (
    <section className="relative overflow-hidden bg-lavender pt-0 pb-0">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet/30 bg-violet/10 px-4 py-1.5 text-xs font-bold text-violet shadow-card">
            <Video className="h-4 w-4" />
            <span>Featured Studio Lesson</span>
          </div>
          <h2 className="mt-4 font-sans text-3xl font-extrabold tracking-tight text-indigo sm:text-5xl">
            Watch a Lesson in Action
          </h2>
          <p className="mt-4 max-w-[65ch] mx-auto text-base sm:text-lg leading-[1.7] text-indigo-900/75">
            Every curriculum module pairs concise conceptual video breakdowns with
            interactive browser laboratories and empirical schema evaluations.
          </p>
        </div>

        {/* Featured Video Card Container */}
        <div className="mt-16 grid gap-8 lg:grid-cols-12 items-center">
          {/* Embedded YouTube Player / Coming Soon Card (7 columns) */}
          <div className="lg:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-indigo-950/10 bg-white p-4 sm:p-6 shadow-card">
              <YouTubeEmbed
                youtubeId={featuredModule.youtubeVideoId} // Real video "bZQun8Y4L2A"
                title={`${featuredModule.title} - ${featuredLesson.title}`}
                className="w-full"
              />
            </div>
          </div>

          {/* Lesson Metadata & Chapter Overview (5 columns) */}
          <div className="flex flex-col justify-between rounded-2xl border border-indigo-950/10 bg-white p-8 shadow-card lg:col-span-5">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-violet/10 px-3.5 py-1 font-sans text-xs font-bold text-violet border border-violet/30">
                  Module 01 · Lesson 01
                </span>
                <span className="font-mono text-xs text-teal font-medium flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> 12 mins
                </span>
              </div>

              <h3 className="mt-5 font-sans text-2xl font-bold text-indigo">
                {featuredLesson.title}
              </h3>

              <p className="mt-3 text-sm leading-[1.7] text-indigo-900/75">
                {featuredLesson.summary}
              </p>

              {/* Key Concept Chips */}
              <div className="mt-5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-900/50 block mb-2 font-mono">
                  Covered Architecture
                </span>
                <div className="flex flex-wrap gap-2">
                  {featuredLesson.keyConcepts.map((concept) => (
                    <span
                      key={concept}
                      className="rounded-lg bg-cream px-2.5 py-1 text-xs font-medium text-indigo border border-indigo-950/10"
                    >
                      {concept}
                    </span>
                  ))}
                </div>
              </div>

              {/* Chapter Timestamps */}
              <div className="mt-6 rounded-xl border border-indigo-950/10 bg-cream/50 p-4">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-900/60 block mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-coral" /> Key Chapters
                </span>
                <div className="space-y-1.5 font-mono text-xs text-indigo-900/80">
                  {featuredLesson.chapters.slice(0, 3).map((ch, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="line-clamp-1">{ch.label}</span>
                      <span className="text-teal font-medium">
                        {String(Math.floor(ch.time / 60)).padStart(2, "0")}:
                        {String(ch.time % 60).padStart(2, "0")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-indigo-950/10 flex flex-col sm:flex-row gap-3">
              <Link
                href={`/academy/${featuredModule.id}/${featuredLesson.id}`}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-coral px-5 py-3 text-xs font-bold text-white shadow-coral-glow transition-all hover:bg-coral-600"
              >
                <span>Open in Academy Studio</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/academy"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-indigo-950/15 bg-white px-4 py-3 text-xs font-bold text-indigo hover:bg-cream transition-colors"
              >
                <BookOpen className="h-3.5 w-3.5 text-violet" />
                <span>All Modules</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Curved Divider into Cream Band */}
      <CurvedDivider fillColor="text-cream" />
    </section>
  );
}
