"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSmoothScroll } from "@/components/providers/smooth-scroll-provider";

export function Nav() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { lenis } = useSmoothScroll();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    if (lenis) {
      lenis.on("scroll", (e: { scroll: number }) => {
        setIsScrolled(e.scroll > 80);
      });
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lenis]);

  return (
    <>
      {/* Accessible Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-ultramarine focus:px-4 focus:py-2 focus:font-sans focus:text-sm focus:font-medium focus:text-white focus:shadow-md focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-200 ${
          isScrolled
            ? "border-b border-navy/10 bg-daylight shadow-xs"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          {/* Brand Wordmark */}
          <Link
            href="/"
            className="font-sans text-xl font-bold tracking-tight text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine focus-visible:ring-offset-2 focus-visible:ring-offset-daylight rounded-sm"
            aria-label="PromptForge Home"
          >
            PromptForge
          </Link>

          {/* Desktop Navigation Links */}
          <nav
            className="flex items-center gap-8"
            aria-label="Primary navigation"
          >
            <div className="hidden sm:flex items-center gap-7">
              <Link
                href="/academy"
                className="font-sans text-base text-navy/80 hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine rounded-sm"
              >
                Academy
              </Link>
              <Link
                href="/labs"
                className="font-sans text-base text-navy/80 hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine rounded-sm"
              >
                Labs
              </Link>
              <Link
                href="/library"
                className="font-sans text-base text-navy/80 hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine rounded-sm"
              >
                Library
              </Link>
            </div>

            {/* Primary Action Button */}
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-ultramarine px-5 py-2.5 font-sans text-sm font-semibold text-white shadow-sm hover:bg-ultramarine/90 active:scale-[0.98] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine focus-visible:ring-offset-2 focus-visible:ring-offset-daylight"
            >
              Go to Dashboard
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
