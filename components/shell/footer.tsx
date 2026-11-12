import React from "react";
import Link from "next/link";
import { Flame, ShieldCheck, Terminal, Cpu } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-forge-border bg-forge-950 py-12 text-forge-muted">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded border border-ember-500/30 bg-ember-500/10">
                <Flame className="h-4 w-4 text-ember-500" />
              </div>
              <span className="font-mono text-lg font-bold tracking-tight text-forge-text">
                PROMPT<span className="text-ember-500">FORGE</span>
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-forge-muted">
              An interactive prompt engineering academy. Learners experiment
              with prompts in live labs with embedded YouTube lessons.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-forge-border bg-forge-surface px-2.5 py-1 font-mono text-xs text-cyan-400">
                <ShieldCheck className="h-3.5 w-3.5" />
                Educational simulation
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-forge-border bg-forge-surface px-2.5 py-1 font-mono text-xs text-ember-400">
                <Terminal className="h-3.5 w-3.5" />
                Phase 1 Foundation
              </span>
            </div>
          </div>

          {/* Academy Modules */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-forge-text">
              Curriculum & Tools
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/academy"
                  className="transition-colors hover:text-forge-text"
                >
                  Academy
                </Link>
              </li>
              <li>
                <Link
                  href="/labs"
                  className="transition-colors hover:text-forge-text"
                >
                  Interactive Labs
                </Link>
              </li>
              <li>
                <Link
                  href="/workflow"
                  className="transition-colors hover:text-forge-text"
                >
                  Workflow Studio
                </Link>
              </li>
              <li>
                <Link
                  href="/evaluate"
                  className="transition-colors hover:text-forge-text"
                >
                  Evaluation Engine
                </Link>
              </li>
              <li>
                <Link
                  href="/arena"
                  className="transition-colors hover:text-forge-text"
                >
                  Model Arena
                </Link>
              </li>
            </ul>
          </div>

          {/* System & Architecture */}
          <div>
            <h3 className="font-mono text-xs uppercase tracking-wider text-forge-text">
              Architecture
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/library"
                  className="transition-colors hover:text-forge-text"
                >
                  Prompt Library
                </Link>
              </li>
              <li>
                <Link
                  href="/challenges"
                  className="transition-colors hover:text-forge-text"
                >
                  Challenges
                </Link>
              </li>
              <li className="flex items-center gap-1.5 pt-2 font-mono text-xs text-forge-subtle">
                <Cpu className="h-3.5 w-3.5 text-cyan-400" />
                <span>Next.js 14 App Router</span>
              </li>
              <li className="font-mono text-xs text-forge-subtle">
                Lenis + GSAP ScrollTrigger
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-forge-border pt-6 font-mono text-xs text-forge-subtle sm:flex-row">
          <p>© {new Date().getFullYear()} PromptForge. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Theme: The Forge</span>
            <span>•</span>
            <span>Zero AI Provider Browser Exposure</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
