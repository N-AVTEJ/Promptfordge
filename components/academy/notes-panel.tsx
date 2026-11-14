"use client";

import * as React from "react";
import { Copy, Check, BookOpen, Key, Sparkles, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Lesson } from "@/content/modules";

export interface NotesPanelProps {
  lesson: Lesson;
  className?: string;
}

export function NotesPanel({ lesson, className }: NotesPanelProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyNotes = () => {
    const textToCopy = `Lesson: ${lesson.title}\n\nSummary:\n${lesson.summary}\n\nKey Concepts:\n${lesson.keyConcepts.map((k) => `- ${k}`).join("\n")}\n\nNotes:\n${lesson.notesMarkdown || ""}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("space-y-6 text-sm", className)}>
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-forge-border pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-forge-muted">
            Lesson Notes & Study Guide
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyNotes}
          className="h-7 text-xs flex items-center gap-1.5 border-forge-border hover:bg-forge-elevated"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy Notes</span>
            </>
          )}
        </Button>
      </div>

      {/* Key Concepts Grid */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-forge-muted">
          <Key className="h-3.5 w-3.5 text-ember-400" />
          <span>Core Architectural Principles</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {lesson.keyConcepts.map((concept, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 rounded-forge bg-forge-elevated p-2.5 border border-forge-border"
            >
              <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shrink-0" />
              <span className="text-xs text-forge-text font-medium leading-relaxed">
                {concept}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Notes Markdown Render */}
      <div className="space-y-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-forge-muted">
          <FileText className="h-3.5 w-3.5 text-cyan-400" />
          <span>Technical Reference</span>
        </div>

        <div className="rounded-forge-md border border-forge-border bg-forge-surface p-4 text-xs leading-relaxed space-y-3 text-forge-muted whitespace-pre-wrap font-sans">
          {lesson.notesMarkdown || lesson.summary}
        </div>
      </div>

      {/* Starter Template Snippet */}
      {lesson.practiceChallenge.starterPrompt && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-forge-muted">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-ember-400" />
              <span>Starter Blueprint</span>
            </span>
          </div>
          <pre className="overflow-x-auto rounded-forge border border-forge-border bg-forge-black p-3 font-mono text-[11px] leading-relaxed text-forge-text select-all">
            {lesson.practiceChallenge.starterPrompt}
          </pre>
        </div>
      )}
    </div>
  );
}
