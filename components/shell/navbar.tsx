"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, Flame, ArrowRight, BookOpen } from "lucide-react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { MobileDrawer } from "./mobile-drawer";

export interface NavItem {
  label: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Academy", href: "/academy" },
  { label: "Labs", href: "/labs" },
  { label: "Workflow", href: "/workflow" },
  { label: "Evaluate", href: "/evaluate" },
  { label: "Arena", href: "/arena" },
  { label: "Library", href: "/library" },
  { label: "Challenges", href: "/challenges" },
];

export function Navbar() {
  const pathname = usePathname();
  const prefersReduced = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // The landing page at "/" renders its dedicated Phase 2 Nav component
  if (pathname === "/") {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-navy/10 bg-daylight/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          {/* Brand Logo */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 py-1 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
            aria-label="PromptForge Home"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-ultramarine/30 bg-ultramarine/10 shadow-xs transition-transform group-hover:scale-105">
              <Flame className="h-5 w-5 text-ultramarine" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans text-lg font-bold tracking-tight text-navy">
                Prompt<span className="text-ultramarine">Forge</span>
              </span>
              <span className="hidden font-mono text-[11px] text-navy/60 sm:inline-block">
                / v1.0
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav
            className="hidden items-center space-x-1 lg:flex"
            aria-label="Main Navigation"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine ${
                    isActive
                      ? "text-navy font-bold"
                      : "text-navy/70 hover:text-navy hover:bg-navy/5"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId={
                        prefersReduced ? undefined : "active-nav-indicator"
                      }
                      className="absolute inset-0 rounded-lg bg-navy/[0.06]"
                      transition={
                        prefersReduced
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 400, damping: 32 }
                      }
                      aria-hidden="true"
                    >
                      <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-ultramarine rounded-full" />
                    </motion.div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action: Go to Dashboard button (No auth anywhere) */}
          <div className="flex items-center gap-3">
            <Link
              href="/academy"
              className="hidden items-center gap-1.5 rounded-lg border border-navy/15 bg-white px-3 py-2 text-xs font-semibold text-navy shadow-xs transition-colors hover:bg-navy/5 hover:border-navy/25 sm:inline-flex"
            >
              <BookOpen className="h-3.5 w-3.5 text-ultramarine" />
              <span>Academy</span>
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-lg bg-ultramarine px-4 py-2 text-xs font-bold text-white shadow-xs transition-all hover:bg-ultramarine/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            {/* Mobile Drawer Trigger */}
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="inline-flex items-center justify-center rounded-lg p-2 text-navy/70 hover:bg-navy/5 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine lg:hidden"
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
