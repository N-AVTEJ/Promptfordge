"use client";

import React from "react";
import dynamic from "next/dynamic";
import { HeroSection } from "@/components/landing/hero-section";
import { PinnedStorySection } from "@/components/landing/pinned-story-section";

// Lazy-load below-the-fold sections per requirement: "Lazy-load below-the-fold sections."
const SplitComparisonSection = dynamic(
  () =>
    import("@/components/landing/split-comparison-section").then(
      (m) => m.SplitComparisonSection
    ),
  {
    ssr: false,
    loading: () => <SectionSkeleton height="min-h-[600px]" />,
  }
);

const TechniqueShowcaseSection = dynamic(
  () =>
    import("@/components/landing/technique-showcase-section").then(
      (m) => m.TechniqueShowcaseSection
    ),
  {
    ssr: false,
    loading: () => <SectionSkeleton height="min-h-[700px]" />,
  }
);

const ModulesHorizontalSection = dynamic(
  () =>
    import("@/components/landing/modules-horizontal-section").then(
      (m) => m.ModulesHorizontalSection
    ),
  {
    ssr: false,
    loading: () => <SectionSkeleton height="min-h-[650px]" />,
  }
);

const SecurityTeaserSection = dynamic(
  () =>
    import("@/components/landing/security-teaser-section").then(
      (m) => m.SecurityTeaserSection
    ),
  {
    ssr: false,
    loading: () => <SectionSkeleton height="min-h-[650px]" />,
  }
);

const FinalCtaSection = dynamic(
  () =>
    import("@/components/landing/final-cta-section").then(
      (m) => m.FinalCtaSection
    ),
  {
    ssr: false,
    loading: () => <SectionSkeleton height="min-h-[400px]" />,
  }
);

function SectionSkeleton({ height }: { height: string }) {
  return (
    <div
      aria-hidden="true"
      className={`w-full ${height} animate-pulse bg-forge-950/50 flex items-center justify-center`}
    >
      <div className="h-2 w-24 rounded-full bg-forge-border/40" />
    </div>
  );
}

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
