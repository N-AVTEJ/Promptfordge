"use client";

import React, { useState, useEffect } from "react";
import { Terminal, ShieldAlert, Sparkles, Check } from "lucide-react";

interface GlitchRevealProps {
  flag: string;
  onCopy?: () => void;
  title?: string;
}

export function GlitchReveal({
  flag,
  title = "TARGET FLAG EXTRACTED",
}: GlitchRevealProps) {
  const [displayText, setDisplayText] = useState("");
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let iteration = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*<>[]{}";
    setIsDecrypted(false);

    const interval = setInterval(() => {
      setDisplayText(
        flag
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return flag[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );

      if (iteration >= flag.length) {
        clearInterval(interval);
        setIsDecrypted(true);
      }

      iteration += 1 / 2;
    }, 30);

    return () => clearInterval(interval);
  }, [flag]);

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(flag);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-red-500/40 bg-gradient-to-r from-red-950/40 via-red-900/20 to-black p-4 shadow-lg backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-red-500/20 pb-2.5">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-red-400 animate-pulse" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-400">
            {title}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded bg-red-500/20 px-2 py-0.5 font-mono text-[10px] font-medium text-red-300">
            <Sparkles className="h-3 w-3" />
            CRACKED
          </span>
          <button
            onClick={handleCopy}
            type="button"
            className="flex items-center gap-1 rounded border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-forge-muted hover:border-white/30 hover:text-white transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400">COPIED</span>
              </>
            ) : (
              <>
                <Terminal className="h-3 w-3" />
                <span>COPY FLAG</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="font-mono text-sm sm:text-base font-extrabold tracking-wider text-red-200 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]">
          {displayText || flag}
        </div>
        {isDecrypted && (
          <span className="font-mono text-[10px] uppercase text-emerald-400 tracking-wider">
            DECRYPTED
          </span>
        )}
      </div>
    </div>
  );
}
