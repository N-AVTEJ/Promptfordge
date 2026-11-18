"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShortcutsModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input/textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const shortcuts = [
    { key: "Cmd/Ctrl + Enter", desc: "Execute / Run active lab or prompt" },
    { key: "?", desc: "Open this keyboard shortcut reference" },
    { key: "Esc", desc: "Close dialogs, sheets, or cancel execution" },
    { key: "Arrow Left / Right", desc: "Navigate previous / next lesson in Academy" },
    { key: "Space / K", desc: "Play or pause current video lecture" },
    { key: "J / L", desc: "Seek video backward or forward 10 seconds" },
  ];

  return (
    <>
      {/* Floating Shortcut Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="View keyboard shortcuts (?)"
        className="fixed bottom-5 right-5 z-40 hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-navy/20 bg-white/90 text-navy shadow-md backdrop-blur-md hover:border-ultramarine hover:text-ultramarine transition-all"
        title="Keyboard Shortcuts (?)"
      >
        <span className="font-mono text-xs font-bold">?</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-navy/40 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-md rounded-2xl border border-navy/15 bg-white p-6 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Keyboard Shortcuts"
            >
              <div className="flex items-center justify-between border-b border-navy/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ultramarine/10 text-ultramarine">
                    <Keyboard className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-sans text-base font-bold text-navy">
                      Keyboard Shortcuts
                    </h3>
                    <p className="font-mono text-[11px] text-navy/60">
                      Productivity power keys across PromptForge
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 text-navy/60 hover:text-navy"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-4 divide-y divide-navy/10">
                {shortcuts.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2.5 text-xs"
                  >
                    <span className="text-navy/80">{s.desc}</span>
                    <kbd className="rounded border border-navy/20 bg-daylight px-2 py-0.5 font-mono text-[11px] font-semibold text-navy shadow-2xs">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-xl bg-daylight p-3 text-center">
                <p className="text-[11px] text-navy/70">
                  Press <kbd className="font-mono font-bold text-navy">Esc</kbd> anytime to dismiss this sheet.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
