import React from "react";
import { HeroSection } from "@/components/landing/hero-section";
import { PinnedStorySection } from "@/components/landing/pinned-story-section";
import { SplitComparisonSection } from "@/components/landing/split-comparison-section";
import { TechniqueShowcaseSection } from "@/components/landing/technique-showcase-section";
import { ModulesHorizontalSection } from "@/components/landing/modules-horizontal-section";
import { FeaturedLessonSection } from "@/components/landing/featured-lesson-section";
import { FinalCtaSection } from "@/components/landing/final-cta-section";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-x-clip bg-cream text-indigo">
      {/* 1. Hero: Big headline, short subline, prompt that types then splits into floating tokens, CTAs */}
      <HeroSection />

      {/* 2. Pinned scroll story: Five stages scrubbed by scroll */}
      <PinnedStorySection />

      {/* 3. Experiment, don't just watch: Split comparison */}
      <SplitComparisonSection />

      {/* 4. Six technique cards: Staggered reveal, hover lift */}
      <TechniqueShowcaseSection />

      {/* 5. Ten modules: Horizontal pinned track */}
      <ModulesHorizontalSection />

      {/* 6. Embedded YouTube preview of a featured lesson */}
      <FeaturedLessonSection />

      {/* 7. Final CTA band */}
      <FinalCtaSection />
    </div>
  );
}
