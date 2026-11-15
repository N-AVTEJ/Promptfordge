"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Chapter } from "@/content/modules";

export interface TimestampChipsProps {
  chapters: Chapter[];
  currentTime?: number;
  onSeek: (seconds: number) => void;
  className?: string;
}

export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export function TimestampChips({
  chapters,
  currentTime = 0,
  onSeek,
  className,
}: TimestampChipsProps) {
  const activeChapterIndex = React.useMemo(() => {
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentTime >= chapters[i].time) {
        return i;
      }
    }
    return 0;
  }, [chapters, currentTime]);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-900/60 font-mono">
        <Clock className="h-4 w-4 text-coral" />
        <span>Video Chapters & Jump Points</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {chapters.map((chap, idx) => {
          const isActive = idx === activeChapterIndex;
          const formatted = formatTimestamp(chap.time);

          return (
            <button
              key={`${chap.time}-${idx}`}
              type="button"
              onClick={() => onSeek(chap.time)}
              className={cn(
                "group inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-coral min-h-[36px]",
                isActive
                  ? "bg-coral text-white shadow-coral-glow"
                  : "bg-cream text-indigo-900/80 border border-indigo-950/10 hover:bg-white hover:text-indigo"
              )}
              title={`Seek video to ${formatted} (${chap.label})`}
            >
              <span className="font-mono text-[11px] opacity-80">{formatted}</span>
              <span className="truncate max-w-[150px]">{chap.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
