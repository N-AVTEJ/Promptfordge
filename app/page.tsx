import React from "react";
import { Metadata } from "next";
import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { TokenStory } from "@/components/landing/TokenStory";
import { TechniqueRows } from "@/components/landing/TechniqueRows";
import { Syllabus } from "@/components/landing/Syllabus";
import { LessonPreview } from "@/components/landing/LessonPreview";
import { Closing } from "@/components/landing/Closing";
import { Footer } from "@/components/landing/Footer";

export const metadata: Metadata = {
  title: "PromptForge | Interactive Prompt Engineering Academy",
  description:
    "Learn to talk to AI by running the experiment. Master tokenomics, attention routing, and decomposition with zero login required.",
};

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-daylight text-navy overflow-x-clip">
      {/* 1. Header Navigation */}
      <Nav />

      {/* Main Content Area (Target for Skip Link) */}
      <main id="main-content" tabIndex={-1} className="outline-none">
        {/* 2. Hero Section */}
        <Hero />

        {/* 3. Pinned Scroll Story (Full-bleed Ultramarine field) */}
        <TokenStory />

        {/* 4. Run it, don't just watch it (Technique Rows) */}
        <TechniqueRows />

        {/* 5. Syllabus (All 12 Modules) */}
        <Syllabus />

        {/* 6. Lesson Preview (Lesson Studio Mock) */}
        <LessonPreview />

        {/* 7. Closing Call-to-Action */}
        <Closing />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
