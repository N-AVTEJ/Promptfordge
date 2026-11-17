"use client";

import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import {
  DESKTOP_TOKENS,
  MOBILE_TOKENS,
  OUTPUT_TOKENS,
  SIMULATION_BADGE,
  STORY_STAGES,
} from "@/content/landing";

gsap.registerPlugin(ScrollTrigger);

export function TokenStory() {
  const prefersReduced = useReducedMotion();
  const [forceInteractive, setForceInteractive] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState(0);

  const isInteractive = !prefersReduced || forceInteractive;

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { ScrollTrigger: typeof ScrollTrigger }).ScrollTrigger =
        ScrollTrigger;
    }

    if (!isInteractive) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      // =======================================================================
      // DESKTOP BREAKPOINT (min-width: 769px) — 12 Tokens, 5 Stages, 1 GSAP Timeline
      // =======================================================================
      mm.add("(min-width: 769px)", () => {
        const cw = canvas.clientWidth || 640;
        const ch = canvas.clientHeight || 480;

        // Stage 2 Grid Coordinates (4 columns x 3 rows percentages)
        const gridCols = [15, 38, 62, 85];
        const gridRows = [22, 50, 78];

        // 1. Initial GSAP setup for all desktop elements
        gsap.set(".desktop-sentence-card", {
          opacity: 1,
          scale: 1,
          transformOrigin: "center center",
        });

        // Set initial positions for each token at Stage 2 Grid
        DESKTOP_TOKENS.forEach((token, idx) => {
          const gx = gridCols[idx % 4];
          const gy = gridRows[Math.floor(idx / 4)];
          const el = document.querySelector(`.desktop-token-${token.id}`);
          if (el) {
            // Position base at grid slot
            gsap.set(el, {
              left: `${gx}%`,
              top: `${gy}%`,
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0.75,
            });
          }
        });

        gsap.set(".desktop-token-chip", { opacity: 0, y: 6 });
        gsap.set(".desktop-attn-line", { opacity: 0 });
        gsap.set(".desktop-attn-label", { opacity: 0, scale: 0.8 });
        gsap.set(".desktop-output-console", { opacity: 0, y: 30, scale: 0.95 });
        gsap.set(".desktop-output-word", { opacity: 0, y: 6 });

        // Captions initial states
        gsap.set(".stage-caption", { opacity: 0, y: 16, pointerEvents: "none" });
        gsap.set("#stage-caption-0", { opacity: 1, y: 0, pointerEvents: "auto" });

        // 2. Master Scrubbed GSAP Timeline (Duration 100 for percentage scrubbing)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "+=400%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              if (p < 0.15) setActiveStageIndex(0);
              else if (p < 0.35) setActiveStageIndex(1);
              else if (p < 0.6) setActiveStageIndex(2);
              else if (p < 0.85) setActiveStageIndex(3);
              else setActiveStageIndex(4);
            },
          },
        });

        // Track Progress Line across 0 -> 100
        tl.to(".progress-rail-fill", { scaleX: 1, ease: "none", duration: 100 }, 0);

        // ---------------------------------------------------------------------
        // STAGE 1 -> STAGE 2 Transition (time 12 to 24)
        // ---------------------------------------------------------------------
        // Crossfade Captions 0 -> 1
        tl.to("#stage-caption-0", { opacity: 0, y: -16, duration: 4, ease: "power2.in" }, 12);
        tl.to("#stage-caption-1", { opacity: 1, y: 0, duration: 4, ease: "power2.out" }, 15);

        // Fade sentence card out
        tl.to(".desktop-sentence-card", { opacity: 0, scale: 0.9, duration: 5, ease: "power2.in" }, 12);

        // Reveal 12 tokens spreading into grid positions
        tl.to(
          ".desktop-token-node",
          {
            opacity: 1,
            scale: 1,
            stagger: 0.25,
            duration: 6,
            ease: "back.out(1.4)",
          },
          14
        );

        // Reveal token ID chips rising above each word
        tl.to(
          ".desktop-token-chip",
          {
            opacity: 1,
            y: 0,
            duration: 4,
            ease: "power2.out",
          },
          17
        );

        // ---------------------------------------------------------------------
        // STAGE 2 -> STAGE 3 Transition (time 34 to 56)
        // ---------------------------------------------------------------------
        // Crossfade Captions 1 -> 2
        tl.to("#stage-caption-1", { opacity: 0, y: -16, duration: 4, ease: "power2.in" }, 33);
        tl.to("#stage-caption-2", { opacity: 1, y: 0, duration: 4, ease: "power2.out" }, 36);

        // Tokens travel smoothly to 2D vector scatter coordinates
        DESKTOP_TOKENS.forEach((token, idx) => {
          const gx = gridCols[idx % 4];
          const gy = gridRows[Math.floor(idx / 4)];
          const deltaX = (token.scatterDesktop.x - gx) * (cw / 100);
          const deltaY = (token.scatterDesktop.y - gy) * (ch / 100);

          tl.to(
            `.desktop-token-${token.id}`,
            {
              x: deltaX,
              y: deltaY,
              duration: 18,
              ease: "power2.inOut",
            },
            35
          );
        });

        // Semantic clustering tokens ("loops", "Python", "teacher") highlight
        tl.to(
          [".token-word-Python", ".token-word-teacher"],
          {
            borderColor: "var(--marigold)",
            backgroundColor: "var(--marigold)",
            color: "var(--navy)",
            duration: 6,
            ease: "power2.out",
          },
          48
        );

        // ---------------------------------------------------------------------
        // STAGE 3 -> STAGE 4 Transition (time 58 to 80)
        // ---------------------------------------------------------------------
        // Crossfade Captions 2 -> 3
        tl.to("#stage-caption-2", { opacity: 0, y: -16, duration: 4, ease: "power2.in" }, 58);
        tl.to("#stage-caption-3", { opacity: 1, y: 0, duration: 4, ease: "power2.out" }, 61);

        // Target token "loops" scales up with halo
        tl.to(
          ".desktop-token-19445",
          {
            scale: 1.15,
            duration: 6,
            ease: "back.out(1.5)",
          },
          60
        );

        // Attention lines draw from "loops" to each token
        tl.to(
          ".desktop-attn-line",
          {
            opacity: 0.65,
            stagger: 0.3,
            duration: 12,
            ease: "power1.out",
          },
          60
        );

        // Strongest attention line ("Python") highlights brightly
        tl.to(
          ".desktop-attn-strongest",
          {
            opacity: 1,
            strokeWidth: 3.5,
            duration: 8,
            ease: "power2.out",
          },
          63
        );

        // Strongest weight badge fades in
        tl.to(
          ".desktop-attn-label",
          {
            opacity: 1,
            scale: 1,
            duration: 5,
            ease: "back.out(1.7)",
          },
          66
        );

        // ---------------------------------------------------------------------
        // STAGE 4 -> STAGE 5 Transition (time 81 to 100)
        // ---------------------------------------------------------------------
        // Crossfade Captions 3 -> 4
        tl.to("#stage-caption-3", { opacity: 0, y: -16, duration: 4, ease: "power2.in" }, 81);
        tl.to("#stage-caption-4", { opacity: 1, y: 0, duration: 4, ease: "power2.out" }, 84);

        // Dim background vector canvas and lines
        tl.to(
          [".desktop-tokens-layer", ".desktop-attn-svg"],
          {
            opacity: 0.15,
            scale: 0.96,
            duration: 6,
            ease: "power2.inOut",
          },
          82
        );

        // Output stream console ascends into focus
        tl.to(
          ".desktop-output-console",
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 7,
            ease: "power3.out",
          },
          83
        );

        // Stream output tokens sequentially one by one
        tl.to(
          ".desktop-output-word",
          {
            opacity: 1,
            y: 0,
            stagger: 0.7,
            duration: 0.8,
            ease: "power1.out",
          },
          87
        );
      });

      // =======================================================================
      // MOBILE BREAKPOINT (max-width: 768px) — 8 Tokens, 5 Stages
      // =======================================================================
      mm.add("(max-width: 768px)", () => {
        const cw = canvas.clientWidth || 340;
        const ch = canvas.clientHeight || 380;

        const mobileGridCols = [18, 50, 82];
        const mobileGridRows = [22, 50, 78];

        gsap.set(".mobile-sentence-card", { opacity: 1, scale: 1 });

        MOBILE_TOKENS.forEach((token, idx) => {
          const gx = mobileGridCols[idx % 3];
          const gy = mobileGridRows[Math.floor(idx / 3)];
          const el = document.querySelector(`.mobile-token-${token.id}`);
          if (el) {
            gsap.set(el, {
              left: `${gx}%`,
              top: `${gy}%`,
              x: 0,
              y: 0,
              opacity: 0,
              scale: 0.75,
            });
          }
        });

        gsap.set(".mobile-token-chip", { opacity: 0, y: 4 });
        gsap.set(".mobile-attn-line", { opacity: 0 });
        gsap.set(".mobile-attn-label", { opacity: 0 });
        gsap.set(".mobile-output-console", { opacity: 0, y: 20 });
        gsap.set(".mobile-output-word", { opacity: 0 });

        gsap.set(".stage-caption", { opacity: 0, y: 12 });
        gsap.set("#stage-caption-0", { opacity: 1, y: 0 });

        const tlMobile = gsap.timeline({
          scrollTrigger: {
            trigger: container,
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              if (p < 0.15) setActiveStageIndex(0);
              else if (p < 0.35) setActiveStageIndex(1);
              else if (p < 0.6) setActiveStageIndex(2);
              else if (p < 0.85) setActiveStageIndex(3);
              else setActiveStageIndex(4);
            },
          },
        });

        tlMobile.to(".progress-rail-fill", { scaleX: 1, ease: "none", duration: 100 }, 0);

        // Stage 1 -> 2
        tlMobile.to("#stage-caption-0", { opacity: 0, y: -12, duration: 4 }, 12);
        tlMobile.to("#stage-caption-1", { opacity: 1, y: 0, duration: 4 }, 15);
        tlMobile.to(".mobile-sentence-card", { opacity: 0, scale: 0.9, duration: 5 }, 12);
        tlMobile.to(
          ".mobile-token-node",
          { opacity: 1, scale: 1, stagger: 0.25, duration: 6 },
          14
        );
        tlMobile.to(".mobile-token-chip", { opacity: 1, y: 0, duration: 4 }, 17);

        // Stage 2 -> 3
        tlMobile.to("#stage-caption-1", { opacity: 0, y: -12, duration: 4 }, 33);
        tlMobile.to("#stage-caption-2", { opacity: 1, y: 0, duration: 4 }, 36);

        MOBILE_TOKENS.forEach((token, idx) => {
          const gx = mobileGridCols[idx % 3];
          const gy = mobileGridRows[Math.floor(idx / 3)];
          const deltaX = ((token.scatterMobile?.x ?? gx) - gx) * (cw / 100);
          const deltaY = ((token.scatterMobile?.y ?? gy) - gy) * (ch / 100);

          tlMobile.to(
            `.mobile-token-${token.id}`,
            { x: deltaX, y: deltaY, duration: 18, ease: "power2.inOut" },
            35
          );
        });

        tlMobile.to(
          [".token-word-Python", ".token-word-teacher"],
          {
            borderColor: "var(--marigold)",
            backgroundColor: "var(--marigold)",
            color: "var(--navy)",
            duration: 6,
          },
          48
        );

        // Stage 3 -> 4
        tlMobile.to("#stage-caption-2", { opacity: 0, y: -12, duration: 4 }, 58);
        tlMobile.to("#stage-caption-3", { opacity: 1, y: 0, duration: 4 }, 61);
        tlMobile.to(".mobile-token-19445", { scale: 1.15, duration: 6 }, 60);
        tlMobile.to(".mobile-attn-line", { opacity: 0.65, stagger: 0.3, duration: 12 }, 60);
        tlMobile.to(".mobile-attn-strongest", { opacity: 1, strokeWidth: 3, duration: 8 }, 63);
        tlMobile.to(".mobile-attn-label", { opacity: 1, duration: 5 }, 66);

        // Stage 4 -> 5
        tlMobile.to("#stage-caption-3", { opacity: 0, y: -12, duration: 4 }, 81);
        tlMobile.to("#stage-caption-4", { opacity: 1, y: 0, duration: 4 }, 84);
        tlMobile.to([".mobile-tokens-layer", ".mobile-attn-svg"], { opacity: 0.15, duration: 6 }, 82);
        tlMobile.to(".mobile-output-console", { opacity: 1, y: 0, duration: 7 }, 83);
        tlMobile.to(".mobile-output-word", { opacity: 1, stagger: 0.7, duration: 0.8 }, 87);
      });

      ScrollTrigger.refresh();

      if (typeof document !== "undefined" && document.fonts?.ready) {
        document.fonts.ready.then(() => {
          ScrollTrigger.refresh();
        });
      }
    }, container);

    return () => {
      ctx.revert();
    };
  }, [isInteractive]);

  // ===========================================================================
  // REDUCED MOTION STATIC VIEW (Accessible static fallback)
  // ===========================================================================
  if (!isInteractive) {
    return (
      <div
        ref={containerRef}
        className="w-full bg-ultramarine text-white py-24"
        aria-label="Prompt decomposition simulation (reduced motion static view)"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/20 pb-6 mb-12 gap-4">
            <div>
              <h2 className="font-sans text-3xl font-bold tracking-tight text-white">
                How a machine reads your prompt
              </h2>
              <p className="mt-1 font-mono text-xs text-white/70">
                Reduced-motion preference active. Showing static decomposition.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setForceInteractive(true)}
                className="rounded-lg bg-white px-3.5 py-1.5 font-mono text-xs font-bold text-ultramarine shadow-sm hover:bg-white/90 transition-all"
              >
                Launch interactive scroll story →
              </button>
              <span className="font-mono text-xs border border-white/30 rounded px-2.5 py-1 bg-white/10 text-white/90">
                {SIMULATION_BADGE}
              </span>
            </div>
          </div>

          <div className="space-y-16">
            {STORY_STAGES.map((s, idx) => (
              <div
                key={s.stage}
                className="rounded-2xl border border-white/15 bg-white/5 p-8"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-ultramarine font-mono text-xs font-bold">
                    {s.stage}
                  </span>
                  <h3 className="font-sans text-2xl font-bold text-white">
                    {s.caption}
                  </h3>
                </div>
                <p className="mt-3 text-base text-white/80 max-w-[65ch]">
                  {s.description}
                </p>

                <div className="mt-6 rounded-xl border border-white/10 bg-navy/60 p-6">
                  {idx === 0 && (
                    <div className="font-mono text-lg text-white">
                      <span className="bg-marigold/30 text-white border-b-2 border-marigold px-1 mr-2">
                        Act as a Python teacher.
                      </span>
                      <span className="bg-mint/30 text-white border-b-2 border-mint px-1 mr-2">
                        Explain loops to a beginner.
                      </span>
                      <span className="bg-lilac/30 text-white border-b-2 border-lilac px-1 mr-2">
                        Give two examples.
                      </span>
                      <span className="bg-rose/30 text-white border-b-2 border-rose px-1">
                        Keep it under 100 words.
                      </span>
                    </div>
                  )}

                  {idx === 1 && (
                    <div className="flex flex-wrap gap-2.5">
                      {DESKTOP_TOKENS.map((t) => (
                        <div
                          key={t.id}
                          className="flex flex-col items-center rounded border border-white/20 bg-white/10 px-2.5 py-1.5"
                        >
                          <span className="font-mono text-xs text-white/70">
                            ID: {t.id}
                          </span>
                          <span className="font-mono text-base font-semibold text-white">
                            {t.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {idx === 2 && (
                    <div className="space-y-3">
                      <p className="font-sans text-sm text-white/70">
                        Semantic clusters form: loops + Python + teacher
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {DESKTOP_TOKENS.map((t) => (
                          <span
                            key={t.id}
                            className={`rounded-full px-3 py-1 font-mono text-xs ${
                              ["loops", "Python", "teacher"].includes(t.text)
                                ? "bg-marigold text-navy font-bold"
                                : "bg-white/15 text-white"
                            }`}
                          >
                            {t.text} ({t.scatterDesktop.x}, {t.scatterDesktop.y})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {idx === 3 && (
                    <div className="space-y-3">
                      <p className="font-sans text-sm text-white/70">
                        Target token &quot;loops&quot; attention weights:
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                        {DESKTOP_TOKENS.filter((t) => t.text !== "loops").map(
                          (t) => (
                            <div
                              key={t.id}
                              className={`p-2 rounded border ${
                                t.isStrongestAttention
                                  ? "border-marigold bg-marigold/20 font-bold text-marigold"
                                  : "border-white/15 bg-white/5 text-white/80"
                              }`}
                            >
                              loops to {t.text}: {t.attentionWeight.toFixed(2)}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {idx === 4 && (
                    <div className="font-mono text-base text-white">
                      {OUTPUT_TOKENS.join(" ")}
                      <span className="inline-block w-2 h-4 bg-white ml-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // INTERACTIVE CINEMATIC PINNED SCROLL STORY (Desktop & Mobile)
  // ===========================================================================
  return (
    <div
      ref={containerRef}
      className="relative w-full bg-ultramarine text-white overflow-hidden"
    >
      <div className="flex h-screen w-full flex-col justify-between px-6 py-6 sm:py-8 max-w-6xl mx-auto">
        {/* Top Header Rail: Progress indicator with semantic sequence numbers */}
        <div className="flex w-full items-center justify-between border-b border-white/15 pb-4">
          <nav
            aria-label="Simulation progress stages"
            className="relative flex items-center gap-3 sm:gap-8"
          >
            {/* Background continuous track line */}
            <div
              className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-white/20 -z-0"
              aria-hidden="true"
            >
              <div
                className="progress-rail-fill h-full w-full bg-white origin-left transform scale-x-0"
                aria-hidden="true"
              />
            </div>

            {STORY_STAGES.map((s, idx) => {
              const isActive = activeStageIndex === idx;
              const isPast = activeStageIndex > idx;

              return (
                <div
                  key={s.stage}
                  className={`relative z-10 flex items-center gap-2 transition-all duration-300 ${
                    isActive
                      ? "opacity-100 font-bold"
                      : isPast
                      ? "opacity-80"
                      : "opacity-45"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span
                    className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full font-mono text-xs transition-colors duration-300 ${
                      isActive
                        ? "bg-white text-ultramarine font-bold shadow-md"
                        : isPast
                        ? "bg-white/20 text-white border border-white/40"
                        : "border border-white/40 bg-ultramarine text-white"
                    }`}
                  >
                    {s.stage}
                  </span>
                  <span className="hidden sm:inline font-sans text-xs sm:text-sm tracking-normal">
                    {s.caption.split(" ")[0]}
                  </span>
                </div>
              );
            })}
          </nav>

          {/* Persistent Educational Simulation Badge & Active Scroll Cue */}
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 font-mono text-xs text-white/90 bg-navy/60 border border-white/20 rounded px-2.5 py-1 backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-mint animate-pulse" />
              {activeStageIndex === 0 && "Scroll to decompose prompt ↓"}
              {activeStageIndex === 1 && "Scroll to project embeddings ↓"}
              {activeStageIndex === 2 && "Scroll to calculate attention ↓"}
              {activeStageIndex === 3 && "Scroll to stream output tokens ↓"}
              {activeStageIndex === 4 && "Generation complete ✓"}
            </span>
            <span className="font-mono text-[10px] sm:text-xs rounded border border-white/20 bg-navy/60 px-2.5 py-1 text-white/80 backdrop-blur-sm">
              {SIMULATION_BADGE}
            </span>
          </div>
        </div>

        {/* Center Main: Left Caption & Right Canvas (Desktop) / Top Caption & Bottom Canvas (Mobile) */}
        <div className="my-auto flex w-full flex-col lg:flex-row items-center gap-8 lg:gap-14">
          {/* Left Column: Stack of 5 Captions */}
          <div className="w-full lg:w-[38ch] shrink-0 text-left relative min-h-[120px] sm:min-h-[140px] lg:min-h-[180px]">
            {STORY_STAGES.map((s, idx) => (
              <div
                key={s.stage}
                id={`stage-caption-${idx}`}
                className="stage-caption absolute inset-0 flex flex-col justify-center space-y-3"
              >
                <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                  {s.caption}
                </h2>
                <p className="font-sans text-base sm:text-lg text-white/80 leading-[1.65]">
                  {s.description}
                </p>
              </div>
            ))}
          </div>

          {/* Right Column: Interactive Token Simulation Canvas */}
          <div
            ref={canvasRef}
            className="relative w-full h-[380px] sm:h-[420px] lg:h-[480px] rounded-2xl border border-white/20 bg-navy/60 p-6 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-inner"
          >
            {/* ------------------------------------------------------------- */}
            {/* DESKTOP LAYOUT (Hidden on mobile)                             */}
            {/* ------------------------------------------------------------- */}
            <div className="hidden md:block absolute inset-0">
              {/* Stage 1: Hero Sentence Card */}
              <div className="desktop-sentence-card absolute inset-0 z-20 flex items-center justify-center p-6">
                <div className="max-w-xl rounded-xl border border-white/20 bg-navy/80 p-6 sm:p-8 backdrop-blur-md shadow-xl text-center">
                  <div className="font-mono text-base sm:text-lg md:text-xl font-semibold text-white leading-relaxed">
                    <span className="relative inline-block mr-2.5 my-1">
                      <span className="relative z-10">Act as a Python teacher.</span>
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[40%] rounded-sm bg-marigold/40 border-b-2 border-marigold pointer-events-none"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="relative inline-block mr-2.5 my-1">
                      <span className="relative z-10">Explain loops to a beginner.</span>
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[40%] rounded-sm bg-mint/45 border-b-2 border-mint pointer-events-none"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="relative inline-block mr-2.5 my-1">
                      <span className="relative z-10">Give two examples.</span>
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[40%] rounded-sm bg-lilac/45 border-b-2 border-lilac pointer-events-none"
                        aria-hidden="true"
                      />
                    </span>
                    <span className="relative inline-block my-1">
                      <span className="relative z-10">Keep it under 100 words.</span>
                      <span
                        className="absolute bottom-0 left-0 right-0 h-[40%] rounded-sm bg-rose/40 border-b-2 border-rose pointer-events-none"
                        aria-hidden="true"
                      />
                    </span>
                  </div>
                </div>
              </div>

              {/* Stage 4: SVG Attention Lines (loops at 50%, 48%) */}
              <svg
                className="desktop-attn-svg absolute inset-0 h-full w-full pointer-events-none z-10"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {DESKTOP_TOKENS.filter((t) => t.text !== "loops").map((t) => {
                  const isStrong = t.isStrongestAttention;
                  return (
                    <g key={`attn-${t.id}`}>
                      <line
                        x1="50"
                        y1="48"
                        x2={t.scatterDesktop.x}
                        y2={t.scatterDesktop.y}
                        strokeWidth={isStrong ? 3.5 : 1 + t.attentionWeight * 1.5}
                        strokeDasharray={isStrong ? undefined : "3,3"}
                        className={`desktop-attn-line ${
                          isStrong
                            ? "desktop-attn-strongest stroke-marigold"
                            : "stroke-white"
                        }`}
                      />
                      {isStrong && (
                        <text
                          x={(50 + t.scatterDesktop.x) / 2}
                          y={(48 + t.scatterDesktop.y) / 2 - 2}
                          fontSize="3"
                          fontFamily="monospace"
                          fontWeight="bold"
                          textAnchor="middle"
                          className="desktop-attn-label fill-marigold"
                        >
                          weight {t.attentionWeight.toFixed(2)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>

              {/* Stages 2 to 4: 12 Desktop Tokens */}
              <div className="desktop-tokens-layer absolute inset-0 z-10 pointer-events-none">
                {DESKTOP_TOKENS.map((token) => (
                  <div
                    key={token.id}
                    className={`desktop-token-node desktop-token-${token.id} absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2`}
                  >
                    <span
                      className="desktop-token-chip mb-1 font-mono text-[10px] rounded px-1.5 py-0.5 bg-white/20 text-white/90 shadow-xs"
                      aria-hidden="true"
                    >
                      ID: {token.id}
                    </span>
                    <span
                      className={`token-word-${token.text} rounded-lg px-2.5 py-1 font-mono text-sm lg:text-base font-semibold border border-white/20 bg-white/10 text-white transition-colors`}
                    >
                      {token.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Stage 5: Autoregressive Model Output Stream */}
              <div className="desktop-output-console absolute inset-0 z-30 flex items-center justify-center p-6">
                <div className="w-full max-w-lg rounded-xl border border-white/20 bg-navy/90 p-6 shadow-2xl backdrop-blur-md">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                    <span className="font-mono text-xs text-white/70">
                      Model Output Stream (Autoregressive)
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-xs text-mint">
                      <span className="h-2 w-2 rounded-full bg-mint animate-pulse" />
                      Complete
                    </span>
                  </div>
                  <div className="font-mono text-sm sm:text-base text-white/95 leading-relaxed min-h-[72px]">
                    {OUTPUT_TOKENS.map((word, wIdx) => (
                      <span
                        key={wIdx}
                        className="desktop-output-word inline-block mr-1.5"
                      >
                        {word}
                      </span>
                    ))}
                    <span className="inline-block w-2 h-4 bg-white ml-0.5 align-middle animate-pulse" />
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* MOBILE LAYOUT (Hidden on desktop)                              */}
            {/* ------------------------------------------------------------- */}
            <div className="md:hidden absolute inset-0">
              {/* Stage 1: Mobile Sentence Card */}
              <div className="mobile-sentence-card absolute inset-0 z-20 flex items-center justify-center p-4">
                <div className="max-w-xs rounded-xl border border-white/20 bg-navy/80 p-4 text-center">
                  <p className="font-mono text-sm font-semibold text-white leading-relaxed">
                    <span className="bg-marigold/30 text-white border-b border-marigold px-1 mr-1">
                      Act as a Python teacher.
                    </span>
                    <span className="bg-mint/30 text-white border-b border-mint px-1 mr-1">
                      Explain loops.
                    </span>
                    <span className="bg-lilac/30 text-white border-b border-lilac px-1 mr-1">
                      Give examples.
                    </span>
                    <span className="bg-rose/30 text-white border-b border-rose px-1">
                      Keep under 100 words.
                    </span>
                  </p>
                </div>
              </div>

              {/* Stage 4: Mobile Attention Lines */}
              <svg
                className="mobile-attn-svg absolute inset-0 h-full w-full pointer-events-none z-10"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                {MOBILE_TOKENS.filter((t) => t.text !== "loops").map((t) => {
                  const isStrong = t.isStrongestAttention;
                  const targetX = t.scatterMobile?.x ?? 50;
                  const targetY = t.scatterMobile?.y ?? 50;
                  return (
                    <g key={`mob-attn-${t.id}`}>
                      <line
                        x1="50"
                        y1="48"
                        x2={targetX}
                        y2={targetY}
                        strokeWidth={isStrong ? 3 : 1}
                        strokeDasharray={isStrong ? undefined : "2,2"}
                        className={`mobile-attn-line ${
                          isStrong
                            ? "mobile-attn-strongest stroke-marigold"
                            : "stroke-white"
                        }`}
                      />
                    </g>
                  );
                })}
              </svg>

              {/* Stages 2 to 4: 8 Mobile Tokens */}
              <div className="mobile-tokens-layer absolute inset-0 z-10 pointer-events-none">
                {MOBILE_TOKENS.map((token) => (
                  <div
                    key={token.id}
                    className={`mobile-token-node mobile-token-${token.id} absolute flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2`}
                  >
                    <span
                      className="mobile-token-chip mb-0.5 font-mono text-[9px] rounded px-1 py-0.2 bg-white/20 text-white/90"
                      aria-hidden="true"
                    >
                      {token.id}
                    </span>
                    <span
                      className={`token-word-${token.text} rounded px-2 py-0.5 font-mono text-xs font-semibold border border-white/20 bg-white/10 text-white`}
                    >
                      {token.text}
                    </span>
                  </div>
                ))}
              </div>

              {/* Stage 5: Mobile Output Console */}
              <div className="mobile-output-console absolute inset-0 z-30 flex items-center justify-center p-4">
                <div className="w-full max-w-xs rounded-xl border border-white/20 bg-navy/90 p-4 shadow-xl">
                  <span className="font-mono text-[10px] text-white/70 block border-b border-white/10 pb-2 mb-2">
                    Model Output
                  </span>
                  <div className="font-mono text-xs text-white leading-relaxed">
                    {OUTPUT_TOKENS.map((word, wIdx) => (
                      <span
                        key={wIdx}
                        className="mobile-output-word inline-block mr-1"
                      >
                        {word}
                      </span>
                    ))}
                    <span className="inline-block w-1.5 h-3 bg-white ml-0.5 align-middle animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
