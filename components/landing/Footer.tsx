import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-navy/10 bg-daylight py-12 text-navy">
      <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-6 px-6">
        {/* Brand Wordmark */}
        <Link
          href="/"
          className="font-sans text-lg font-bold tracking-tight text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine rounded-sm"
          aria-label="PromptForge Home"
        >
          PromptForge
        </Link>

        {/* Three Primary Links */}
        <nav
          className="flex items-center gap-8 font-sans text-sm text-navy/75"
          aria-label="Footer navigation"
        >
          <Link
            href="/academy"
            className="hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine rounded-sm"
          >
            Academy
          </Link>
          <Link
            href="/labs"
            className="hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine rounded-sm"
          >
            Labs
          </Link>
          <Link
            href="/library"
            className="hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ultramarine rounded-sm"
          >
            Library
          </Link>
        </nav>

        {/* Quiet disclaimer */}
        <p className="font-mono text-xs text-navy/60">
          Educational simulation. Zero login required.
        </p>
      </div>
    </footer>
  );
}
