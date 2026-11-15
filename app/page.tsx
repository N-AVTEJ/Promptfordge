import React from "react";
import { HeroSection } from "@/components/landing/hero-section";
import { PinnedStorySection } from "@/components/landing/pinned-story-section";
import { SplitComparisonSection } from "@/components/landing/split-comparison-section";
import { TechniqueShowcaseSection } from "@/components/landing/technique-showcase-section";
import { ModulesHorizontalSection } from "@/components/landing/modules-horizontal-section";
import { SecurityTeaserSection } from "@/components/landing/security-teaser-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-x-clip bg-forge-950">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Pinned Scroll Story (Centerpiece, 5 Stages) */}
      <PinnedStorySection />

      {/* 3. Experiment, Don't Watch: Split Comparison */}
      <SplitComparisonSection />

      {/* 4. Technique Showcase: 6 Technique Cards */}
      <TechniqueShowcaseSection />

      {/* 5. The 10 Modules: Horizontal Scroll Track Pinned Vertically */}
      <ModulesHorizontalSection />

      {/* 6. Security Teaser: Red vs Blue Split */}
      <SecurityTeaserSection />

      {/* 7. Final CTA Section */}
      <FinalCtaSection />
    </main>
  );
}
