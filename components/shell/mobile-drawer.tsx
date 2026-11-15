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
            className="fixed inset-0 bg-indigo-950/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <motion.div
            ref={drawerRef}
            variants={activeDrawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative z-10 flex h-full w-[85%] max-w-sm flex-col border-l border-indigo-950/10 bg-cream p-6 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-indigo-950/10 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-coral/30 bg-coral/10">
                  <Flame className="h-4 w-4 text-coral" />
                </div>
                <span className="font-sans text-sm font-bold tracking-tight text-indigo">
                  Prompt<span className="text-coral">Forge</span>
                </span>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="rounded-lg p-1.5 text-indigo-900/60 hover:bg-indigo-950/5 hover:text-indigo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
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
                className="flex items-center justify-center gap-2 rounded-lg bg-coral px-4 py-2.5 text-xs font-bold text-white shadow-coral-glow hover:bg-coral-600 transition-colors"
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
                    ? "border-l-2 border-coral bg-white pl-3 font-semibold text-coral shadow-card"
                    : "text-indigo-900/70 hover:bg-white hover:text-indigo"
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
                        ? "border-l-2 border-coral bg-white pl-3 font-semibold text-coral shadow-card"
                        : "text-indigo-900/70 hover:bg-white hover:text-indigo"
                    }`}
                    aria-current={isActive ? "page" : undefined}
                  >
                    <div className="flex flex-col">
                      <span>{item.label}</span>
                      <span className="font-mono text-[10px] text-indigo-900/50">
                        {item.phase}
                      </span>
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-50" />
                  </Link>
                );
              })}
            </nav>

            {/* Footer inside Drawer */}
            <div className="border-t border-indigo-950/10 pt-4">
              <div className="flex items-center justify-between font-mono text-xs text-indigo-900/60">
                <span>Free & Open Sandbox</span>
                <span className="text-teal font-medium">No Auth Required</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
