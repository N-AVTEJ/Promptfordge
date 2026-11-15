"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Flame, ArrowRight, Play, Sparkles } from "lucide-react";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { CurvedDivider } from "@/components/ui/curved-divider";

const STREAM_PROMPT =
  "System: You are an expert prompt engineer. Optimize an autonomous reasoning agent with strict JSON output.";

const STREAM_TOKENS = [
  { text: "System:", id: 1045, color: "bg-coral/15 text-coral border-coral/30" },
  { text: " You", id: 284, color: "bg-white text-indigo border-indigo-950/10" },
  { text: " are", id: 527, color: "bg-white text-indigo border-indigo-950/10" },
  { text: " an", id: 459, color: "bg-white text-indigo border-indigo-950/10" },
  { text: " expert", id: 18452, color: "bg-violet/15 text-violet border-violet/30" },
  { text: " prompt", id: 14210, color: "bg-teal/15 text-teal border-teal/30" },
  { text: " engineer.", id: 31201, color: "bg-violet/15 text-violet border-violet/30" },
  { text: " Optimize", id: 9811, color: "bg-coral/15 text-coral border-coral/30" },
  { text: " an", id: 304, color: "bg-white text-indigo border-indigo-950/10" },
  { text: " autonomous", id: 1782, color: "bg-butter text-indigo border-indigo-950/10" },
  { text: " reasoning", id: 6224, color: "bg-mint text-indigo border-indigo-950/10" },
  { text: " agent", id: 7421, color: "bg-teal/15 text-teal border-teal/30" },
  { text: " with", id: 449, color: "bg-white text-indigo border-indigo-950/10" },
  { text: " strict", id: 1899, color: "bg-lavender text-violet border-violet/30" },
  { text: " JSON", id: 24190, color: "bg-coral/15 text-coral border-coral/30" },
  { text: " output.", id: 34182, color: "bg-teal/15 text-teal border-teal/30" },
];

export function HeroSection() {
  const prefersReduced = useReducedMotion();
  const [typedChars, setTypedChars] = useState(0);
  const [isTokenized, setIsTokenized] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Typing stream animation
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

  // Floating ambient tokens in background canvas
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

    const particles = Array.from({ length: 18 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 2 + 1.5,
      color:
        Math.random() > 0.5
          ? "rgba(255, 107, 74, 0.25)"
          : Math.random() > 0.5
          ? "rgba(124, 92, 255, 0.2)"
          : "rgba(18, 181, 166, 0.2)",
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
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
    <section className="relative overflow-hidden bg-cream pt-16 pb-0">
      <div className="mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="flex flex-col items-center text-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-coral/30 bg-coral/10 px-4 py-1.5 text-xs font-bold text-coral shadow-card">
            <Flame className="h-4 w-4 text-coral" />
            <span>Interactive Prompt Engineering Academy</span>
          </div>

          {/* Big Headline (64 to 88px on desktop) */}
          <h1 className="mt-8 max-w-4xl font-sans text-4xl sm:text-6xl lg:text-[76px] font-black tracking-tight text-indigo leading-[1.08]">
            Understand AI.
            <br />
            <span className="text-coral">Master Prompts.</span>
            <br />
            <span>Engineer Better Systems.</span>
          </h1>

          {/* Short Subline (max 65 chars, 18px base text) */}
          <p className="mt-6 max-w-[65ch] text-base sm:text-lg leading-[1.7] text-indigo-900/75">
            Deconstruct subword token splits, attention matrices, and latent steering vectors.
            Move from intuition to deterministic execution inside live browser laboratories.
          </p>

          {/* CTAs: "Go to Dashboard", "Watch a lesson" */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-coral px-8 py-4 font-sans text-sm font-bold text-white shadow-coral-glow transition-all hover:bg-coral-600 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral"
            >
              <span>Go to Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/academy/mod-01/mod-01-les-01"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-950/15 bg-white px-7 py-4 font-sans text-sm font-bold text-indigo shadow-card transition-all hover:border-violet/40 hover:bg-white hover:text-violet hover:shadow-card-hover"
            >
              <Play className="h-4 w-4 text-violet" />
              <span>Watch a lesson</span>
            </Link>
          </div>
        </div>

        {/* Prompt that types in then splits into floating colored tokens */}
        <div className="relative mx-auto mt-16 max-w-4xl">
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 h-full w-full rounded-2xl opacity-60"
          />

          <div className="relative z-10 overflow-hidden rounded-2xl border border-indigo-950/10 bg-white p-8 shadow-card">
            {/* Terminal Top Bar */}
            <div className="flex items-center justify-between border-b border-indigo-950/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-coral/80" />
                <span className="h-3 w-3 rounded-full bg-butter/80 border border-indigo-950/10" />
                <span className="h-3 w-3 rounded-full bg-teal/80" />
                <span className="ml-2 font-mono text-xs font-semibold text-indigo-900/60">
                  token_stream_telemetry.forge
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-teal/30 bg-teal/10 px-3 py-0.5 font-mono text-xs font-semibold text-teal">
                  <Sparkles className="h-3 w-3" />
                  {isTokenized ? "16 Discrete BPE Tokens" : "Tokenizing byte stream..."}
                </span>
              </div>
            </div>

            {/* Prompt Content */}
            <div className="mt-6">
              <div className="text-xs font-mono font-semibold uppercase tracking-wider text-indigo-900/50 mb-3">
                Live Subword Tokenization Preview
              </div>

              {!isTokenized ? (
                <div className="min-h-[96px] rounded-xl border border-indigo-950/10 bg-cream/70 p-5 font-mono text-sm leading-relaxed text-indigo">
                  {STREAM_PROMPT.slice(0, typedChars)}
                  <span className="inline-block h-4 w-1.5 ml-1 bg-coral animate-pulse" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 min-h-[96px] rounded-xl border border-indigo-950/10 bg-cream/70 p-5 items-center">
                  {STREAM_TOKENS.map((token, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 font-mono text-xs font-medium shadow-sm transition-transform hover:-translate-y-1 ${token.color}`}
                    >
                      <span>{token.text}</span>
                      <span className="text-[10px] opacity-60 font-mono">
                        #{token.id}
                      </span>
                    </span>
                  ))}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-xs font-mono text-indigo-900/60">
                <span>Model: GPT-4 / Gemini 1.5 BPE Table</span>
                <span>Byte Compression Ratio: 3.8:1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Curved Divider into Lavender Band */}
      <CurvedDivider fillColor="text-lavender" />
    </section>
  );
}
