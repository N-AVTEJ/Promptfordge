"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Flame } from "lucide-react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { MobileDrawer } from "./mobile-drawer";

export interface NavItem {
  label: string;
  href: string;
  phase: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Academy", href: "/academy", phase: "Phase 2" },
  { label: "Labs", href: "/labs", phase: "Phase 3" },
  { label: "Workflow", href: "/workflow", phase: "Phase 4" },
  { label: "Evaluate", href: "/evaluate", phase: "Phase 5" },
  { label: "Arena", href: "/arena", phase: "Phase 6" },
  { label: "Library", href: "/library", phase: "Phase 7" },
  { label: "Challenges", href: "/challenges", phase: "Phase 8" },
];

export function Navbar() {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-forge-border bg-forge-black/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-3 rounded-md p-1 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500"
            aria-label="PromptForge Home"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-ember-500/30 bg-ember-500/10 transition-colors group-hover:border-ember-500/60">
              <Flame className="h-5 w-5 text-ember-500 transition-transform duration-300 group-hover:scale-110" />
            </div>
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 font-mono text-base font-bold tracking-tight text-forge-text">
                PROMPT<span className="text-ember-500">FORGE</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-forge-muted">
                v0.1 · Foundation
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
                  className={`relative rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500 ${
                    isActive
                      ? "text-forge-text"
                      : "text-forge-muted hover:bg-forge-surface/60 hover:text-forge-text"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId={
                        prefersReduced ? undefined : "active-nav-indicator"
                      }
                      className="absolute inset-0 rounded-md border border-ember-500/30 bg-forge-surface"
                      transition={
                        prefersReduced
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 30 }
                      }
                      aria-hidden="true"
                    >
                      <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-ember-500 shadow-[0_0_8px_#ff6b00]" />
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Status Badge & Mobile Hamburger */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-forge-border bg-forge-surface px-3 py-1 font-mono text-xs text-cyan-400 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-500"></span>
              </span>
              <span>Edu Sim</span>
            </div>

            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center justify-center rounded-md p-2 text-forge-muted hover:bg-forge-surface hover:text-forge-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-500 md:hidden"
              aria-label="Open navigation menu"
              aria-expanded={drawerOpen}
              aria-controls="mobile-navigation-drawer"
            >
              <Menu className="h-6 w-6" aria-hidden="true" />
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
