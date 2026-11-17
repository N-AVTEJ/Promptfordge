"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, ShieldCheck, Terminal } from "lucide-react";

export function Footer() {
  const pathname = usePathname();

  // The landing page at "/" renders its dedicated Phase 2 Footer component
  if (pathname === "/") {
    return null;
  }
  return (
    <footer className="w-full border-t border-navy/10 bg-daylight py-16 text-navy/70">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-ultramarine/30 bg-ultramarine/10">
                <Flame className="h-4 w-4 text-ultramarine" />
              </div>
              <span className="font-sans text-lg font-bold tracking-tight text-navy">
                Prompt<span className="text-ultramarine">Forge</span>
              </span>
            </div>
            <p className="max-w-[65ch] text-sm leading-relaxed text-navy/70">
              Interactive prompt engineering academy and laboratory. Master tokenomics,
              decomposition chains, structured output contracts, and adversarial defense.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-mint/40 bg-mint/15 px-2.5 py-1 text-navy font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-mint-700" />
                Educational Simulation
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-md border border-ultramarine/30 bg-ultramarine/10 px-2.5 py-1 text-ultramarine font-medium">
                <Terminal className="h-3.5 w-3.5" />
                Zero Auth Wall
              </span>
            </div>
          </div>

          {/* Curriculum & Labs */}
          <div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-navy">
              Curriculum & Labs
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/academy"
                  className="transition-colors hover:text-ultramarine"
                >
                  Academy Modules (1–12)
                </Link>
              </li>
              <li>
                <Link
                  href="/labs/anatomy"
                  className="transition-colors hover:text-ultramarine"
                >
                  Prompt Anatomy Studio
                </Link>
              </li>
              <li>
                <Link
                  href="/labs/llm-simulator"
                  className="transition-colors hover:text-ultramarine"
                >
                  LLM Transformer Simulator
                </Link>
              </li>
              <li>
                <Link
                  href="/labs/playground"
                  className="transition-colors hover:text-ultramarine"
                >
                  Live Prompt Playground
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Access */}
          <div>
            <h3 className="font-sans text-xs font-bold uppercase tracking-wider text-navy">
              Quick Launch
            </h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1 font-semibold text-ultramarine transition-colors hover:text-ultramarine/80"
                >
                  <span>Go to Dashboard</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/evaluate"
                  className="transition-colors hover:text-ultramarine"
                >
                  Evaluation Engine
                </Link>
              </li>
              <li>
                <Link
                  href="/arena"
                  className="transition-colors hover:text-ultramarine"
                >
                  Model Benchmark Arena
                </Link>
              </li>
              <li>
                <Link
                  href="/challenges"
                  className="transition-colors hover:text-ultramarine"
                >
                  Defense Challenges
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-navy/10 pt-6 sm:flex-row text-xs text-navy/60 font-mono">
          <p>
            PromptForge Academy · Designed for engineers building reliable AI systems.
          </p>
          <p className="mt-2 sm:mt-0">
            Open-source architecture · Server-side execution
          </p>
        </div>
      </div>
    </footer>
  );
}
