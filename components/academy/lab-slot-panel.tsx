"use client";

import * as React from "react";
import { Terminal, Sparkles, RotateCcw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PromptPlayground } from "@/components/labs/playground";
import type { Lesson } from "@/content/modules";
import Link from "next/link";

export interface LabSlotPanelProps {
  lesson: Lesson;
  className?: string;
  customPrompt?: string;
}

function resolveLabTarget(relatedLab?: string): { href: string; label: string } {
  if (!relatedLab) return { href: "/labs", label: "Labs Hub" };
  const lab = relatedLab.toLowerCase().trim();

  if (lab.includes("anatomy")) return { href: "/labs/anatomy", label: "Anatomy Lab" };
  if (lab.includes("simulator") || lab.includes("llm-simulator"))
    return { href: "/labs/llm-simulator", label: "Simulator Lab" };
  if (lab.includes("compare")) return { href: "/labs/compare", label: "Comparison Lab" };
  if (lab.includes("optimize") || lab.includes("optimizer"))
    return { href: "/labs/optimize", label: "Optimizer Lab" };
  if (lab.includes("reasoning")) return { href: "/labs/reasoning", label: "Reasoning Lab" };
  if (lab.includes("workflow")) return { href: "/workflow", label: "Workflow Builder" };
  if (lab.includes("security") || lab.includes("arena"))
    return { href: "/arena", label: "Security Arena" };
  if (lab.includes("library")) return { href: "/library", label: "Prompt Library" };
  if (lab.includes("evaluate")) return { href: "/evaluate", label: "Evaluation Hub" };
  if (lab.includes("playground")) return { href: "/labs/playground", label: "Prompt Playground" };
  if (lab.startsWith("/")) return { href: lab, label: "Open Lab" };

  return { href: "/labs", label: "Labs Hub" };
}

export function LabSlotPanel({
  lesson,
  className,
  customPrompt,
}: LabSlotPanelProps) {
  const [activePrompt, setActivePrompt] = React.useState<string>(
    customPrompt || lesson.practiceChallenge.starterPrompt
  );

  React.useEffect(() => {
    setActivePrompt(customPrompt || lesson.practiceChallenge.starterPrompt);
  }, [customPrompt, lesson.practiceChallenge.starterPrompt]);

  const handleResetChallenge = () => {
    setActivePrompt(lesson.practiceChallenge.starterPrompt);
  };

  const labTarget = resolveLabTarget(lesson.relatedLab);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Lab Header */}
      <div className="flex items-center justify-between border-b border-indigo-950/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-coral/10 text-coral">
            <Terminal className="h-4 w-4" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-900/60 font-mono">
              Interactive Lab Studio
            </span>
            <span className="ml-2 font-mono text-xs text-teal font-semibold">
              [{labTarget.href}]
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChallenge}
            className="h-8 text-xs flex items-center gap-1"
            title="Reset prompt to lesson starter"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          <Link href={labTarget.href} target="_blank">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2.5 text-xs text-indigo-900/70 hover:text-indigo flex items-center gap-1"
            >
              <span className="hidden sm:inline">{labTarget.label}</span>
              <ExternalLink className="h-3.5 w-3.5 text-teal" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Challenge Objective Banner */}
      <div className="rounded-xl border border-indigo-950/10 bg-cream p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-indigo flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-coral" />
            {lesson.practiceChallenge.title}
          </span>
          <Badge variant="outline" className="text-[10px] font-mono">
            Lab Exercise
          </Badge>
        </div>
        <p className="text-xs text-indigo-900/75 leading-relaxed">
          {lesson.practiceChallenge.instructions}
        </p>
        {lesson.practiceChallenge.hint && (
          <div className="rounded-lg bg-white p-2.5 text-[11px] text-indigo-900/80 border border-indigo-950/10">
            <strong className="text-teal font-bold">Hint:</strong> {lesson.practiceChallenge.hint}
          </div>
        )}
      </div>

      {/* Live PromptPlayground Component Slot */}
      <div className="rounded-2xl border border-indigo-950/10 bg-white p-2 shadow-card">
        <PromptPlayground
          initialPrompt={activePrompt}
          initialSystem={`You are an expert AI engineering assistant specializing in ${lesson.title}. Follow strict schema contracts and negative constraints.`}
          compact={true}
        />
      </div>
    </div>
  );
}
