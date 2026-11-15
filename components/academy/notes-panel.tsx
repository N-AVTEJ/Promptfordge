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
      <div className="flex items-center justify-between border-b border-indigo-950/10 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-violet" />
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-900/60 font-mono">
            Lesson Notes & Study Guide
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyNotes}
          className="h-8 text-xs flex items-center gap-1.5"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-teal" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy Notes</span>
            </>
          )}
        </Button>
      </div>

      {/* Key Concepts Grid */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900/70 font-mono">
          <Key className="h-3.5 w-3.5 text-coral" />
          <span>Core Architectural Principles</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {lesson.keyConcepts.map((concept, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 rounded-xl bg-cream p-3 border border-indigo-950/10"
            >
              <div className="mt-1 h-2 w-2 rounded-full bg-violet shrink-0" />
              <span className="text-xs text-indigo font-medium leading-relaxed">
                {concept}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Notes Markdown Render */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900/70 font-mono">
          <FileText className="h-3.5 w-3.5 text-teal" />
          <span>Technical Reference</span>
        </div>

        <div className="rounded-xl border border-indigo-950/10 bg-cream/50 p-4 text-xs leading-relaxed space-y-3 text-indigo-900/80 whitespace-pre-wrap font-sans">
          {lesson.notesMarkdown || lesson.summary}
        </div>
      </div>

      {/* Starter Template Snippet */}
      {lesson.practiceChallenge.starterPrompt && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-indigo-900/70 font-mono">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-coral" />
              <span>Starter Blueprint</span>
            </span>
          </div>
          <pre className="overflow-x-auto rounded-xl border border-indigo-950/10 bg-white p-4 font-mono text-[11px] leading-relaxed text-indigo select-all shadow-card">
            {lesson.practiceChallenge.starterPrompt}
          </pre>
        </div>
      )}
    </div>
  );
}
