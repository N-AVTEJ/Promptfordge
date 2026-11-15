"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function AcademyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[PromptForge Academy Error]:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center">
      <div className="rounded-xl border border-rose-500/30 bg-rose-950/10 p-8">
        <AlertTriangle className="mx-auto h-10 w-10 text-rose-400" />
        <h2 className="mt-4 text-xl font-bold text-white">Academy Lesson Studio Encountered an Issue</h2>
        <p className="mt-2 text-xs font-mono text-forge-muted max-w-md mx-auto">
          {error.message || "Failed to load curriculum module or lesson content."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-ember-500 px-4 py-2 text-xs font-semibold text-black hover:bg-ember-400"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reload Lesson</span>
          </button>
          <Link
            href="/academy"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-[#14171E] px-4 py-2 text-xs font-medium text-white hover:bg-[#1A1E27]"
          >
            <Home className="h-4 w-4" />
            <span>Academy Curriculum</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
