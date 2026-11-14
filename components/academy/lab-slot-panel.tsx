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

  return (
    <div className={cn("space-y-4", className)}>
      {/* Lab Header */}
      <div className="flex items-center justify-between border-b border-forge-border pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-ember-500/10 text-ember-400">
            <Terminal className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-forge-muted">
              Interactive Lab Studio
            </span>
            <span className="ml-2 font-mono text-[10px] text-cyan-400">
              [{lesson.relatedLab}]
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChallenge}
            className="h-7 text-xs flex items-center gap-1 border-forge-border"
            title="Reset prompt to lesson starter"
          >
            <RotateCcw className="h-3 w-3" />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          <Link href="/labs" target="_blank">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs text-forge-muted hover:text-forge-text"
              title="Open full labs playground in new tab"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Challenge Objective Banner */}
      <div className="rounded-forge-md border border-forge-border bg-forge-surface p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-forge-text flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-ember-400" />
            {lesson.practiceChallenge.title}
          </span>
          <Badge variant="outline" className="text-[10px] font-mono">
            Lab Exercise
          </Badge>
        </div>
        <p className="text-xs text-forge-muted leading-relaxed">
          {lesson.practiceChallenge.instructions}
        </p>
        {lesson.practiceChallenge.hint && (
          <div className="rounded-forge bg-forge-elevated/70 p-2 text-[11px] text-forge-subtle border border-forge-border">
            <strong className="text-cyan-400">Hint:</strong> {lesson.practiceChallenge.hint}
          </div>
        )}
      </div>

      {/* Live PromptPlayground Component Slot */}
      <div className="rounded-forge-lg border border-forge-border bg-forge-elevated/30 p-1">
        <PromptPlayground
          initialPrompt={activePrompt}
          initialSystem={`You are an expert AI engineering assistant specializing in ${lesson.title}. Follow strict schema contracts and negative constraints.`}
          compact={true}
        />
      </div>
    </div>
  );
}
