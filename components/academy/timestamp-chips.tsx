"use client";

import * as React from "react";
import { Clock, Play } from "lucide-react";
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
  // Determine active chapter based on current playback second
  const activeChapterIndex = React.useMemo(() => {
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentTime >= chapters[i].time) {
        return i;
      }
    }
    return 0;
  }, [chapters, currentTime]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5 text-xs font-semibold text-forge-muted uppercase tracking-wider">
        <Clock className="h-3.5 w-3.5 text-cyan-400" />
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
                "group inline-flex items-center gap-2 rounded-forge px-3 py-1.5 text-xs font-medium transition-all focus:outline-none focus:ring-1 focus:ring-ember-500 min-h-[36px]",
                isActive
                  ? "bg-ember-500/20 text-ember-300 border border-ember-500/50 shadow-ember-sm"
                  : "bg-forge-elevated text-forge-muted border border-forge-border hover:bg-forge-overlay hover:text-forge-text hover:border-forge-border-bright"
              )}
              title={`Seek video to ${formatted} (${chap.label})`}
              aria-label={`Jump to ${formatted}: ${chap.label}`}
            >
              <span
                className={cn(
                  "font-mono font-bold text-[11px] px-1.5 py-0.5 rounded",
                  isActive
                    ? "bg-ember-500/30 text-ember-200"
                    : "bg-forge-surface text-forge-subtle group-hover:text-forge-muted"
                )}
              >
                {formatted}
              </span>
              <span className="truncate max-w-[160px] sm:max-w-[220px]">
                {chap.label}
              </span>
              <Play
                className={cn(
                  "h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100",
                  isActive && "opacity-100 text-ember-400"
                )}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
