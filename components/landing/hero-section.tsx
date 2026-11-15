"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Flame, Terminal, ArrowRight, Code2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

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

  return (
    <section className="relative overflow-hidden pt-14 pb-20 sm:pt-24 sm:pb-32">
      {/* Precision hairline grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,#14171d_1px,transparent_1px),linear-gradient(to_bottom,#14171d_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_25%,#000_70%,transparent_100%)] opacity-60"
        aria-hidden="true"
      />

      {/* Ambient glowing forge backdrop */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -z-10 h-96 w-[900px] -translate-x-1/2 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,107,0,0.22),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-48 left-1/2 -z-10 h-64 w-[600px] -translate-x-1/2 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(0,229,255,0.08),transparent_70%)]"
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center">
          {/* Technical Tag Eyebrow */}
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 font-mono text-xs font-semibold text-amber-400 shadow-[0_0_15px_rgba(255,107,0,0.15)]">
            <Flame className="h-3.5 w-3.5 text-ember-500" />
            <span>Interactive Prompt Engineering Academy</span>
          </div>

          {/* Requirement 1 exact headline: "Understand AI. Master Prompts. Engineer Better Intelligence." */}
          <h1 className="mt-8 max-w-4xl font-mono text-3xl font-extrabold tracking-tight text-forge-text sm:text-5xl lg:text-6xl">
            Understand AI.
            <br />
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(255,107,0,0.35)]">
              Master Prompts.
            </span>
            <br />
            <span className="text-forge-text">Engineer Better Intelligence.</span>
          </h1>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-zinc-400 sm:text-base">
            Deconstruct subword token splits, attention matrices, and latent steering vectors.
            Move from intuition to deterministic execution inside live browser laboratories.
          </p>

          {/* Primary CTA "Enter the Academy", secondary "Try a live lab" */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-lg border border-amber-400/40 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-7 font-mono text-xs font-bold text-black shadow-[0_0_25px_rgba(255,107,0,0.35)] hover:from-amber-400 hover:to-orange-500 hover:shadow-[0_0_35px_rgba(255,107,0,0.5)] transition-all active:scale-[0.99]"
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
              className="h-11 rounded-lg border border-cyan-500/40 bg-cyan-950/20 px-6 font-mono text-xs font-semibold text-cyan-300 shadow-[0_0_15px_rgba(0,229,255,0.12)] hover:border-cyan-400 hover:bg-cyan-900/30 hover:text-white hover:shadow-[0_0_25px_rgba(0,229,255,0.25)] transition-all"
            >
              <Link href="/labs" className="inline-flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                <span>Try a live lab</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Live Token Streaming Terminal & Ambient Drift Field */}
        <div className="relative mx-auto mt-14 max-w-4xl sm:mt-18">
          {/* Ambient Canvas layer */}
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full rounded-xl opacity-60"
          />

          <div className="relative z-10 overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-b from-[#131722] via-[#0E1016] to-[#08090C] shadow-[0_20px_50px_rgba(0,0,0,0.7)] before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-amber-400/40 before:to-transparent">
            {/* Terminal Header */}
            <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#11141B] px-4 py-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                <span className="ml-2 font-mono text-[11px] text-zinc-400">
                  token_stream_telemetry.forge
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] text-amber-300">
                  {isTokenized ? "BPE Tokenized · 17 tokens" : "Ingesting byte stream..."}
                </span>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6">
              <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400 mb-3">
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Code2 className="h-3.5 w-3.5 text-amber-500" /> Prompt Buffer
                </span>
                <span className="text-[10px] font-mono text-cyan-400">
                  Vocabulary: 32,768 · BPE Subwords
                </span>
              </div>

              {/* Streaming raw prompt vs split tokens */}
              <div className="min-h-[84px] rounded-lg border border-white/[0.08] bg-black/60 p-4 font-mono text-xs leading-relaxed sm:text-sm shadow-inner">
                {!isTokenized ? (
                  <p className="text-zinc-200">
                    {STREAM_PROMPT.slice(0, typedChars)}
                    <span className="inline-block h-3.5 w-1.5 bg-amber-400 align-middle ml-1 animate-pulse" />
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {STREAM_TOKENS.map((token, index) => (
                      <span
                        key={index}
                        className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-mono transition-all hover:scale-105 ${token.color}`}
                        title={`Token ID: ${token.id}`}
                      >
                        {token.text}
                        <span className="ml-1 text-[9px] opacity-50">#{token.id}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Live Token Telemetry Footer */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 font-mono text-xs">
                <div className="rounded-lg border border-white/[0.08] bg-[#0E1118] p-2.5">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Input Tokens</div>
                  <div className="mt-0.5 font-bold text-white">17 tokens</div>
                </div>
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-2.5">
                  <div className="text-[10px] text-amber-400/80 uppercase tracking-wider">Characters</div>
                  <div className="mt-0.5 font-bold text-amber-300">102 chars</div>
                </div>
                <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/[0.04] p-2.5">
                  <div className="text-[10px] text-cyan-400/80 uppercase tracking-wider">Compression</div>
                  <div className="mt-0.5 font-bold text-cyan-300">6.00 chars/tok</div>
                </div>
                <div className="rounded-lg border border-white/[0.08] bg-[#0E1118] p-2.5">
                  <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Attention Matrix</div>
                  <div className="mt-0.5 font-bold text-emerald-400">17 × 17 rank</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
