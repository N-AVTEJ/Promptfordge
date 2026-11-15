"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Flame, Terminal } from "lucide-react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { MobileDrawer } from "./mobile-drawer";

export interface NavItem {
  label: string;
  href: string;
  phase: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Academy", href: "/academy", phase: "Curriculum" },
  { label: "Labs", href: "/labs", phase: "Interactive" },
  { label: "Workflow", href: "/workflow", phase: "Studio" },
  { label: "Evaluate", href: "/evaluate", phase: "Evals" },
  { label: "Arena", href: "/arena", phase: "Security" },
  { label: "Library", href: "/library", phase: "Blueprints" },
  { label: "Challenges", href: "/challenges", phase: "Sandbox" },
];

export function Navbar() {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#08090C]/90 backdrop-blur-md">
        {/* Subtle top hairline highlight */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.12] to-transparent pointer-events-none" />

        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 rounded-md py-1 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500"
            aria-label="PromptForge Home"
          >
            <div className="relative flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.08] bg-gradient-to-b from-[#1E222B] to-[#121418] shadow-sm transition-colors group-hover:border-ember-500/50">
              <Flame className="h-4 w-4 text-ember-500 transition-colors group-hover:text-ember-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono text-sm font-bold tracking-tight text-forge-text">
                PROMPT<span className="bg-gradient-to-r from-ember-400 to-amber-500 bg-clip-text text-transparent">FORGE</span>
              </span>
              <span className="hidden font-mono text-[10px] text-forge-muted sm:inline-block">
                / v1.0
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav
            className="hidden items-center space-x-1 md:flex"
            aria-label="Main Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500 ${
                    isActive
                      ? "text-forge-text font-semibold"
                      : "text-forge-muted hover:text-forge-text"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId={
                        prefersReduced ? undefined : "active-nav-indicator"
                      }
                      className="absolute inset-0 rounded-md border border-white/[0.08] bg-white/[0.04]"
                      transition={
                        prefersReduced
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 400, damping: 32 }
                      }
                      aria-hidden="true"
                    >
                      <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-gradient-to-r from-ember-500 via-amber-400 to-ember-500" />
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Status Indicator & Quick Launch */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/labs/playground"
              className="hidden items-center gap-1.5 rounded-md border border-white/[0.08] bg-gradient-to-b from-[#181B22] to-[#101216] px-2.5 py-1 font-mono text-[11px] text-forge-text transition-colors hover:border-white/[0.18] hover:text-white sm:flex"
            >
              <Terminal className="h-3 w-3 text-cyan-400" />
              <span>Playground</span>
            </Link>

            <div className="hidden items-center gap-1.5 rounded-md border border-white/[0.06] bg-[#0E1013] px-2.5 py-1 font-mono text-[11px] text-forge-muted sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
              <span>Sim Active</span>
            </div>

            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center justify-center rounded-md p-1.5 text-forge-muted hover:bg-forge-surface hover:text-forge-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500 md:hidden"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-navigation-drawer"
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        navItems={NAV_ITEMS}
        currentPath={pathname}
      />
    </>
  );
}
