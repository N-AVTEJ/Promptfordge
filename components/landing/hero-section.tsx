"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Flame, Terminal, ArrowRight, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { fadeUpVariants, fadeUpReducedVariants } from "@/lib/motion";

const STREAM_PROMPT =
  "System: You are a compiler architect. Optimize an async state machine in Rust with zero-alloc invariants.";

const STREAM_TOKENS = [
  { text: "System:", id: 1045, color: "text-ember-400 border-ember-500/30 bg-ember-500/[0.07]" },
  { text: " You", id: 284, color: "text-forge-text border-white/[0.08] bg-white/[0.03]" },
  { text: " are", id: 527, color: "text-forge-text border-white/[0.08] bg-white/[0.03]" },
  { text: " a", id: 264, color: "text-forge-text border-white/[0.08] bg-white/[0.03]" },
  { text: " compiler", id: 18452, color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/[0.07]" },
  { text: " architect.", id: 14210, color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/[0.07]" },
  { text: " Optimize", id: 31201, color: "text-ember-400 border-ember-500/30 bg-ember-500/[0.07]" },
  { text: " an", id: 459, color: "text-forge-text border-white/[0.08] bg-white/[0.03]" },
  { text: " async", id: 9811, color: "text-forge-text border-white/[0.08] bg-white/[0.03]" },
  { text: " state", id: 1782, color: "text-forge-text border-white/[0.08] bg-white/[0.03]" },
  { text: " machine", id: 6224, color: "text-forge-text border-white/[0.08] bg-white/[0.03]" },
  { text: " in", id: 304, color: "text-forge-text border-white/[0.08] bg-white/[0.03]" },
  { text: " Rust", id: 7421, color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/[0.07]" },
  { text: " with", id: 449, color: "text-forge-text border-white/[0.08] bg-white/[0.03]" },
  { text: " zero-", id: 1899, color: "text-ember-400 border-ember-500/30 bg-ember-500/[0.07]" },
  { text: "alloc", id: 24190, color: "text-ember-400 border-ember-500/30 bg-ember-500/[0.07]" },
  { text: " invariants.", id: 34182, color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/[0.07]" },
];

export function HeroSection() {
  const prefersReduced = useReducedMotion();
  const [typedChars, setTypedChars] = useState(prefersReduced ? STREAM_PROMPT.length : 0);
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

  // Ambient drifting token particles in canvas background (calm, precise)
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
    const particles = Array.from({ length: 24 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 1.5 + 1,
      color: Math.random() > 0.4 ? "rgba(255, 107, 0, 0.3)" : "rgba(0, 229, 255, 0.25)",
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
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(255, 107, 0, ${0.08 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
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
    <section className="relative overflow-hidden pt-14 pb-20 sm:pt-24 sm:pb-32">
      {/* Precision hairline grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#14171d_1px,transparent_1px),linear-gradient(to_bottom,#14171d_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_25%,#000_70%,transparent_100%)] opacity-60"
        aria-hidden="true"
      />

      {/* Subtle top illumination */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-72 w-[680px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,107,0,0.08),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={activeVariant}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          {/* Technical Tag Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-md border border-white/[0.08] bg-[#101216] px-3 py-1 font-mono text-[11px] font-medium text-ember-400">
            <Flame className="h-3.5 w-3.5 text-ember-500" />
            <span>Interactive Prompt Engineering Academy</span>
          </div>

          {/* Requirement 1 exact headline: "Understand AI. Master Prompts. Engineer Better Intelligence." */}
          <h1 className="mt-8 max-w-4xl font-mono text-3xl font-extrabold tracking-tight text-forge-text sm:text-5xl lg:text-6xl">
            Understand AI.
            <br />
            <span className="bg-gradient-to-r from-[#FF7A1A] via-[#FFA347] to-[#FF6600] bg-clip-text text-transparent">
              Master Prompts.
            </span>
            <br />
            <span className="text-forge-text">Engineer Better Intelligence.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-forge-muted sm:text-base">
            Deconstruct subword token splits, attention matrices, and latent steering vectors.
            Move from intuition to deterministic execution inside live browser laboratories.
          </p>

          {/* Primary CTA "Enter the Academy", secondary "Try a live lab" */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-md border border-ember-400/30 bg-gradient-to-b from-[#FF7A1A] to-[#D94F00] px-6 font-mono text-xs font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-[#FF8A2E] hover:to-[#E65600] active:scale-[0.99]"
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
              className="h-11 rounded-md border border-white/[0.1] bg-gradient-to-b from-[#181B22] to-[#101216] px-6 font-mono text-xs font-semibold text-forge-text hover:border-white/[0.2] hover:bg-[#1A1E26] hover:text-white"
            >
              <Link href="/labs" className="inline-flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
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
          className="relative mx-auto mt-14 max-w-4xl sm:mt-18"
        >
          {/* Ambient Canvas layer */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full rounded-xl opacity-60"
          />

          <div className="relative z-10 overflow-hidden rounded-xl border border-white/[0.08] bg-[#0C0E12] shadow-xl">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-[#111318] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/[0.12]" />
                <span className="ml-2 font-mono text-[11px] text-forge-muted">
                  token_stream_telemetry.forge
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-white/[0.08] bg-[#171920] px-2 py-0.5 font-mono text-[10px] text-forge-muted">
                  {isTokenized ? "BPE Tokenized · 17 tokens" : "Ingesting byte stream..."}
                </span>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6">
              <div className="flex items-center justify-between font-mono text-[11px] text-forge-muted mb-3">
                <span className="flex items-center gap-1.5 text-ember-400">
                  <Code2 className="h-3.5 w-3.5" /> Prompt Buffer
                </span>
                <span className="text-[10px] text-forge-muted">
                  Vocabulary: 32,768 · BPE Subwords
                </span>
              </div>

              {/* Streaming raw prompt vs split tokens */}
              <div className="min-h-[80px] rounded-lg border border-white/[0.06] bg-[#08090C] p-3.5 font-mono text-xs leading-relaxed sm:text-sm">
                {!isTokenized ? (
                  <p className="text-forge-text">
                    {STREAM_PROMPT.slice(0, typedChars)}
                    <span className="inline-block h-3.5 w-1.5 bg-ember-500 align-middle ml-1" />
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {STREAM_TOKENS.map((token, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-mono transition-colors hover:border-white/[0.25] ${token.color}`}
                        title={`Token ID: ${token.id}`}
                      >
                        {token.text}
                        <span className="ml-1 text-[9px] opacity-40">#{token.id}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Token Telemetry Footer */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-xs">
                <div className="rounded-md border border-white/[0.06] bg-[#0E1014] p-2.5">
                  <div className="text-[10px] text-forge-muted uppercase tracking-wider">Input Tokens</div>
                  <div className="mt-0.5 font-semibold text-forge-text">17 tokens</div>
                </div>
                <div className="rounded-md border border-white/[0.06] bg-[#0E1014] p-2.5">
                  <div className="text-[10px] text-forge-muted uppercase tracking-wider">Characters</div>
                  <div className="mt-0.5 font-semibold text-ember-400">102 chars</div>
                </div>
                <div className="rounded-md border border-white/[0.06] bg-[#0E1014] p-2.5">
                  <div className="text-[10px] text-forge-muted uppercase tracking-wider">Compression</div>
                  <div className="mt-0.5 font-semibold text-cyan-400">6.00 chars/tok</div>
                </div>
                <div className="rounded-md border border-white/[0.06] bg-[#0E1014] p-2.5">
                  <div className="text-[10px] text-forge-muted uppercase tracking-wider">Attention Matrix</div>
                  <div className="mt-0.5 font-semibold text-forge-text">17 × 17 rank</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
