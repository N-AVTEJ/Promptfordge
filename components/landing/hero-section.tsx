"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Terminal, ArrowRight, Sparkles, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { fadeUpVariants, fadeUpReducedVariants } from "@/lib/motion";

const STREAM_PROMPT =
  "System: You are a compiler architect. Optimize an async state machine in Rust with zero-alloc invariants.";

const STREAM_TOKENS = [
  {
    text: "System:",
    id: 1045,
    color: "text-ember-400 border-ember-500/40 bg-ember-500/10",
  },
  {
    text: " You",
    id: 284,
    color: "text-forge-text border-forge-border bg-forge-elevated",
  },
  {
    text: " are",
    id: 527,
    color: "text-forge-text border-forge-border bg-forge-elevated",
  },
  {
    text: " a",
    id: 264,
    color: "text-forge-text border-forge-border bg-forge-elevated",
  },
  {
    text: " compiler",
    id: 18452,
    color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  },
  {
    text: " architect.",
    id: 14210,
    color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  },
  {
    text: " Optimize",
    id: 31201,
    color: "text-ember-400 border-ember-500/40 bg-ember-500/10",
  },
  {
    text: " an",
    id: 459,
    color: "text-forge-text border-forge-border bg-forge-elevated",
  },
  {
    text: " async",
    id: 9811,
    color: "text-forge-text border-forge-border bg-forge-elevated",
  },
  {
    text: " state",
    id: 1782,
    color: "text-forge-text border-forge-border bg-forge-elevated",
  },
  {
    text: " machine",
    id: 6224,
    color: "text-forge-text border-forge-border bg-forge-elevated",
  },
  {
    text: " in",
    id: 304,
    color: "text-forge-text border-forge-border bg-forge-elevated",
  },
  {
    text: " Rust",
    id: 7421,
    color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  },
  {
    text: " with",
    id: 449,
    color: "text-forge-text border-forge-border bg-forge-elevated",
  },
  {
    text: " zero-",
    id: 1899,
    color: "text-ember-400 border-ember-500/40 bg-ember-500/10",
  },
  {
    text: "alloc",
    id: 24190,
    color: "text-ember-400 border-ember-500/40 bg-ember-500/10",
  },
  {
    text: " invariants.",
    id: 34182,
    color: "text-cyan-400 border-cyan-500/40 bg-cyan-500/10",
  },
];

export function HeroSection() {
  const prefersReduced = useReducedMotion();
  const [typedChars, setTypedChars] = useState(
    prefersReduced ? STREAM_PROMPT.length : 0
  );
  const [isTokenized, setIsTokenized] = useState(Boolean(prefersReduced));
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Typing stream simulation
  useEffect(() => {
    if (prefersReduced) {
      setTypedChars(STREAM_PROMPT.length);
      setIsTokenized(true);
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      if (current >= STREAM_PROMPT.length) {
        setTypedChars(STREAM_PROMPT.length);
        setIsTokenized(true);
        clearInterval(interval);
      } else {
        setTypedChars(current);
      }
    }, 28);

    return () => clearInterval(interval);
  }, [prefersReduced]);

  // Ambient drifting token particles in canvas background
  useEffect(() => {
    if (prefersReduced) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 400);

    const resizeHandler = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener("resize", resizeHandler);

    // Subtle drifting token nodes
    const particles = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 2 + 1,
      color:
        Math.random() > 0.4
          ? "rgba(255, 107, 0, 0.4)"
          : "rgba(0, 229, 255, 0.35)",
      idStr: `T${Math.floor(Math.random() * 9000 + 1000)}`,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        // Draw node
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Connect nearby nodes with faint attention lines
        for (let j = i + 1; j < particles.length; j++) {
          const other = particles[j];
          const dx = other.x - p.x;
          const dy = other.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(255, 107, 0, ${0.12 * (1 - dist / 110)})`;
            ctx.lineWidth = 0.75;
            ctx.stroke();
          }
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeHandler);
    };
  }, [prefersReduced]);

  const activeVariant = prefersReduced ? fadeUpReducedVariants : fadeUpVariants;

  return (
    <section className="relative overflow-hidden pb-20 pt-12 sm:pb-32 sm:pt-20">
      {/* Background Ambience */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_50%_-10%,rgba(255,107,0,0.18),rgba(11,12,14,0))]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/[0.04] blur-3xl"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={activeVariant}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-ember-500/30 bg-ember-500/10 px-4 py-1.5 font-mono text-xs font-semibold text-ember-400 backdrop-blur-sm">
            <Flame className="h-4 w-4 animate-pulse-glow" />
            <span>THE INTERACTIVE PROMPT ACADEMY</span>
          </div>

          {/* Requirement 1 exact headline: "Understand AI. Master Prompts. Engineer Better Intelligence." */}
          <h1 className="mt-8 max-w-5xl font-mono text-4xl font-extrabold tracking-tight text-forge-text sm:text-6xl lg:text-7xl">
            Understand AI.
            <br />
            <span className="bg-gradient-to-r from-ember-400 via-amber-500 to-amber-600 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,107,0,0.35)]">
              Master Prompts.
            </span>
            <br />
            <span className="text-forge-text">
              Engineer Better Intelligence.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-forge-muted sm:text-lg lg:text-xl">
            Move past naive intuition. Deconstruct subword token splits,
            attention matrices, and latent steering vectors inside live
            interactive sandboxes.
          </p>

          {/* Primary CTA "Enter the Academy", secondary "Try a live lab" */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 font-mono text-sm font-bold shadow-ember-glow"
            >
              <Link href="/academy" className="inline-flex items-center gap-2">
                <span>Enter the Academy</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 border-forge-border bg-forge-surface px-8 font-mono text-sm font-semibold text-forge-text hover:border-cyan-500 hover:text-cyan-400"
            >
              <Link href="/labs" className="inline-flex items-center gap-2">
                <Terminal className="h-4 w-4 text-cyan-400" />
                <span>Try a live lab</span>
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Live Token Streaming Terminal & Ambient Drift Field */}
        <motion.div
          variants={activeVariant}
          initial="hidden"
          animate="visible"
          className="relative mx-auto mt-16 max-w-4xl sm:mt-20"
        >
          {/* Ambient Canvas layer */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full rounded-2xl opacity-75"
          />

          <div className="bg-forge-900/90 relative z-10 overflow-hidden rounded-2xl border border-forge-border shadow-2xl backdrop-blur-md">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-forge-border bg-forge-elevated/70 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-forge-border" />
                <span className="h-3 w-3 rounded-full bg-forge-border" />
                <span className="h-3 w-3 rounded-full bg-forge-border" />
                <span className="ml-2 font-mono text-xs text-forge-muted">
                  token_stream_telemetry.forge
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-ember-500/40 font-mono text-[10px] text-ember-400"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  {isTokenized
                    ? "BPE Tokenized (17 tokens)"
                    : "Ingesting Byte Stream..."}
                </Badge>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between font-mono text-xs text-forge-muted">
                <span className="flex items-center gap-1.5 text-ember-400">
                  <Code2 className="h-3.5 w-3.5" /> Prompt Buffer
                </span>
                <span className="text-[11px] text-forge-muted">
                  BPE Vocabulary: 32,768 · Vocab Split
                </span>
              </div>

              {/* Streaming raw prompt vs split tokens */}
              <div className="mt-4 min-h-[90px] rounded-lg border border-forge-border/60 bg-forge-surface/90 p-4 font-mono text-sm leading-relaxed sm:text-base">
                {!isTokenized ? (
                  <p className="text-forge-text">
                    {STREAM_PROMPT.slice(0, typedChars)}
                    <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-ember-500 align-middle" />
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {STREAM_TOKENS.map((token, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center rounded border px-2 py-0.5 font-mono text-xs transition-transform hover:scale-105 ${token.color}`}
                        title={`Token ID: ${token.id}`}
                      >
                        {token.text}
                        <span className="ml-1 text-[9px] opacity-40">
                          #{token.id}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Token Telemetry Footer */}
              <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-xs sm:grid-cols-4">
                <div className="rounded-lg border border-forge-border/40 bg-forge-surface/50 p-2.5">
                  <div className="text-[10px] uppercase text-forge-muted">
                    Input Tokens
                  </div>
                  <div className="mt-1 font-bold text-forge-text">
                    17 tokens
                  </div>
                </div>
                <div className="rounded-lg border border-forge-border/40 bg-forge-surface/50 p-2.5">
                  <div className="text-[10px] uppercase text-forge-muted">
                    Characters
                  </div>
                  <div className="mt-1 font-bold text-ember-400">102 chars</div>
                </div>
                <div className="rounded-lg border border-forge-border/40 bg-forge-surface/50 p-2.5">
                  <div className="text-[10px] uppercase text-forge-muted">
                    Compression Ratio
                  </div>
                  <div className="mt-1 font-bold text-cyan-400">
                    6.00 chars/tok
                  </div>
                </div>
                <div className="rounded-lg border border-forge-border/40 bg-forge-surface/50 p-2.5">
                  <div className="text-[10px] uppercase text-forge-muted">
                    Attention Density
                  </div>
                  <div className="mt-1 font-bold text-forge-text">
                    100% full-rank
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
