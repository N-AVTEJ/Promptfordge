"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Construction,
  Sparkles,
  Layers,
  ChevronRight,
  GraduationCap,
  FlaskConical,
  GitFork,
  BarChart3,
  Swords,
  Library,
  Trophy,
} from "lucide-react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { fadeUpVariants, fadeUpReducedVariants } from "@/lib/motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type PhaseIconKey =
  | "academy"
  | "labs"
  | "workflow"
  | "evaluate"
  | "arena"
  | "library"
  | "challenges";

const ICON_MAP: Record<
  PhaseIconKey,
  React.ComponentType<{ className?: string }>
> = {
  academy: GraduationCap,
  labs: FlaskConical,
  workflow: GitFork,
  evaluate: BarChart3,
  arena: Swords,
  library: Library,
  challenges: Trophy,
};

interface PhaseStubProps {
  moduleName: string;
  phaseLabel: string;
  iconType: PhaseIconKey;
  description: string;
  plannedFeatures: string[];
  nextRoute?: { label: string; href: string };
}

export function PhaseStub({
  moduleName,
  phaseLabel,
  iconType,
  description,
  plannedFeatures,
  nextRoute,
}: PhaseStubProps) {
  const prefersReduced = useReducedMotion();
  const variants = prefersReduced ? fadeUpReducedVariants : fadeUpVariants;
  const Icon = ICON_MAP[iconType] ?? Construction;

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <motion.div
        variants={variants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl rounded-2xl border border-forge-border bg-forge-surface p-8 shadow-forge sm:p-10"
      >
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-forge-border pb-6">
          <Badge
            variant="default"
            className="gap-2 px-3 py-1 font-mono text-xs"
          >
            <Construction className="h-3.5 w-3.5" />
            <span>{phaseLabel} · Coming Soon</span>
          </Badge>

          <Badge
            variant="secondary"
            className="gap-1.5 px-2.5 py-1 font-mono text-xs"
          >
            <Sparkles className="h-3 w-3" />
            <span>Educational simulation</span>
          </Badge>
        </div>

        {/* Icon & Title */}
        <div className="mt-8 flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-ember-500/30 bg-ember-500/10 text-ember-500">
            <Icon className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-mono text-2xl font-bold tracking-tight text-forge-text sm:text-3xl">
              {moduleName}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-forge-muted sm:text-base">
              {description}
            </p>
          </div>
        </div>

        {/* Planned Features Blueprint */}
        <div className="mt-8 rounded-xl border border-forge-border bg-forge-elevated p-5">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-forge-muted">
            <Layers className="h-4 w-4 text-ember-500" />
            <span>Planned Architectural Capabilities</span>
          </div>
          <ul className="mt-3 space-y-2">
            {plannedFeatures.map((feat, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 font-mono text-xs text-forge-text sm:text-sm"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Navigation & Controls */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-forge-border pt-6 sm:flex-row">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="w-full font-mono text-xs sm:w-auto"
          >
            <Link href="/">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Overview</span>
            </Link>
          </Button>

          {nextRoute && (
            <Button
              variant="default"
              size="sm"
              asChild
              className="w-full font-mono text-xs sm:w-auto"
            >
              <Link href={nextRoute.href}>
                <span>Explore {nextRoute.label}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
