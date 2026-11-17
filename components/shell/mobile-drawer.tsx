"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X, Flame, ArrowRight } from "lucide-react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import {
  backdropVariants,
  backdropReducedVariants,
  drawerVariants,
  drawerReducedVariants,
} from "@/lib/motion";
import { type NavItem } from "./navbar";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  navItems: NavItem[];
  currentPath: string;
}

export function MobileDrawer({
  isOpen,
  onClose,
  navItems,
  currentPath,
}: MobileDrawerProps) {
  const prefersReduced = useReducedMotion();
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key press and trap focus inside drawer
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab" && drawerRef.current) {
        const focusableElements =
          drawerRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const activeDrawerVariants = prefersReduced
    ? drawerReducedVariants
    : drawerVariants;
  const activeBackdropVariants = prefersReduced
    ? backdropReducedVariants
    : backdropVariants;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-50 flex justify-end lg:hidden"
        >
          {/* Backdrop */}
          <motion.div
            variants={activeBackdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-navy/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <motion.div
            ref={drawerRef}
            variants={activeDrawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 flex h-full w-[85%] max-w-sm flex-col border-l border-navy/10 bg-daylight p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-navy/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-ultramarine/30 bg-ultramarine/10">
                  <Flame className="h-4 w-4 text-ultramarine" />
                </div>
                <span className="font-sans text-sm font-bold tracking-tight text-navy">
                  Prompt<span className="text-ultramarine">Forge</span>
                </span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-navy/60 hover:bg-navy/5 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Quick Go to Dashboard Button */}
            <div className="mt-4">
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-lg bg-ultramarine px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-ultramarine/90 transition-colors"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Navigation links */}
            <nav className="mt-6 flex flex-1 flex-col space-y-1 overflow-y-auto">
              <Link
                href="/"
                onClick={onClose}
                className={`flex items-center justify-between rounded-lg px-3.5 py-3 text-sm font-medium transition-colors ${
                  currentPath === "/"
                    ? "border-l-2 border-ultramarine bg-white pl-3 font-semibold text-ultramarine shadow-xs"
                    : "text-navy/70 hover:bg-white hover:text-navy"
                }`}
              >
                <span>Landing Page</span>
                <ArrowRight className="h-4 w-4 opacity-50" />
              </Link>

              {navItems.map((item) => {
                const isActive = currentPath.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    className={`flex items-center justify-between rounded-lg px-3.5 py-3 text-sm font-medium transition-colors ${
                      isActive
                        ? "border-l-2 border-ultramarine bg-white pl-3 font-semibold text-ultramarine shadow-xs"
                        : "text-navy/70 hover:bg-white hover:text-navy"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </Link>
                );
              })}
            </nav>

            {/* Footer inside Drawer */}
            <div className="border-t border-navy/10 pt-4">
              <div className="flex items-center justify-between font-mono text-xs text-navy/60">
                <span>Free & Open Sandbox</span>
                <span className="text-navy font-semibold">No Auth Required</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
