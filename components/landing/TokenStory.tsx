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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);

  // Active stage index (0 to 4) driven deterministically by scroll progress
  const [activeStage, setActiveStage] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as unknown as { ScrollTrigger: typeof ScrollTrigger }).ScrollTrigger =
        ScrollTrigger;
    }

    if (prefersReduced) return;

    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.matchMedia({
        // Desktop breakpoint
        "(min-width: 769px)": () => {
          ScrollTrigger.create({
            trigger: container,
            start: "top top",
            end: "+=400%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              setScrollProgress(p);
              if (p < 0.15) {
                setActiveStage(0);
              } else if (p < 0.35) {
                setActiveStage(1);
              } else if (p < 0.6) {
                setActiveStage(2);
              } else if (p < 0.85) {
                setActiveStage(3);
              } else {
                setActiveStage(4);
              }
            },
          });
        },

        // Mobile breakpoint
        "(max-width: 768px)": () => {
          ScrollTrigger.create({
            trigger: container,
            start: "top top",
            end: "+=300%",
            pin: true,
            scrub: 1,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              const p = self.progress;
              setScrollProgress(p);
              if (p < 0.15) {
                setActiveStage(0);
              } else if (p < 0.35) {
                setActiveStage(1);
              } else if (p < 0.6) {
                setActiveStage(2);
              } else if (p < 0.85) {
                setActiveStage(3);
              } else {
                setActiveStage(4);
              }
            },
          });
        },
      });

      ScrollTrigger.refresh();
    }, container);

    return () => {
      ctx.revert();
    };
  }, [prefersReduced]);

  // Reduced motion: static vertical presentation with all five stages
  if (prefersReduced) {
    return (
      <div
        ref={containerRef}
        className="w-full bg-ultramarine text-white py-24"
        aria-label="Prompt decomposition simulation (reduced motion static view)"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex items-center justify-between border-b border-white/20 pb-6 mb-12">
            <h2 className="font-sans text-3xl font-bold tracking-tight text-white">
              How a machine reads your prompt
            </h2>
            <span className="font-mono text-xs border border-white/30 rounded px-2.5 py-1 bg-white/10 text-white/90">
              {SIMULATION_BADGE}
            </span>
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

                {/* Stage Specific Static Visualization */}
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

  // Calculate visual values for the 5 stages based on scroll progress
  // Stage 1 (0 to 0.15): linear sentence
  // Stage 2 (0.15 to 0.35): token split & ID chips reveal
  // Stage 3 (0.35 to 0.60): travel to 2D scatter coordinates
  // Stage 4 (0.60 to 0.85): attention lines to loops
  // Stage 5 (0.85 to 1.0): output tokens reveal one by one
  const stage1to2Progress = Math.max(
    0,
    Math.min(1, (scrollProgress - 0.1) / 0.15)
  );
  const stage2to3Progress = Math.max(
    0,
    Math.min(1, (scrollProgress - 0.3) / 0.25)
  );
  const stage4Progress = Math.max(
    0,
    Math.min(1, (scrollProgress - 0.58) / 0.22)
  );
  const stage5Progress = Math.max(
    0,
    Math.min(1, (scrollProgress - 0.82) / 0.18)
  );

  // How many output tokens to display in stage 5
  const outputTokensCount = Math.floor(stage5Progress * OUTPUT_TOKENS.length);
  const activeTokens = isMobile ? MOBILE_TOKENS : DESKTOP_TOKENS;

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-ultramarine text-white overflow-hidden"
    >
      <div className="flex h-screen w-full flex-col justify-between px-6 py-8 md:py-12">
        {/* Top Header Rail: Progress indicator with semantic sequence numbers */}
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between border-b border-white/15 pb-4">
          <nav
            aria-label="Simulation progress stages"
            className="flex items-center gap-4 sm:gap-8"
          >
            {STORY_STAGES.map((s, idx) => {
              const isActive = activeStage === idx;
              const isPast = activeStage > idx;

              return (
                <div
                  key={s.stage}
                  className={`flex items-center gap-2 transition-opacity ${
                    isActive
                      ? "opacity-100 font-bold"
                      : isPast
                      ? "opacity-80"
                      : "opacity-40"
                  }`}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full font-mono text-xs ${
                      isActive
                        ? "bg-white text-ultramarine font-bold"
                        : "border border-white/40 text-white"
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

          {/* Persistent Educational Simulation Badge */}
          <span className="font-mono text-[11px] sm:text-xs rounded border border-white/20 bg-navy/60 px-2.5 py-1 text-white/80 backdrop-blur-sm">
            {SIMULATION_BADGE}
          </span>
        </div>

        {/* Center Main: Left Caption & Right Canvas (Desktop) / Top Caption & Bottom Canvas (Mobile) */}
        <div className="mx-auto my-auto flex w-full max-w-6xl flex-col lg:flex-row items-center gap-8 lg:gap-14">
          {/* Left Column: Caption text max 38ch */}
          <div className="w-full lg:w-[38ch] shrink-0 text-left">
            <div className="space-y-4">
              <span className="font-mono text-xs font-semibold text-white/70">
                Stage 0{activeStage + 1} of 05
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
                {STORY_STAGES[activeStage]?.caption}
              </h2>
              <p className="font-sans text-base sm:text-lg text-white/80 leading-[1.65]">
                {STORY_STAGES[activeStage]?.description}
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Token Simulation Canvas */}
          <div
            ref={canvasRef}
            className="relative w-full h-[380px] sm:h-[420px] lg:h-[480px] rounded-2xl border border-white/20 bg-navy/50 p-6 backdrop-blur-md overflow-hidden flex items-center justify-center shadow-inner"
          >
            {/* Stage 4: SVG Attention Lines connecting 'loops' (50%, 48%) to other tokens */}
            <svg
              className="absolute inset-0 h-full w-full pointer-events-none transition-opacity duration-300"
              style={{
                opacity: activeStage === 3 ? stage4Progress : 0,
              }}
              aria-hidden="true"
            >
              {activeTokens.filter((t) => t.text !== "loops").map((t) => {
                const isStrong = t.isStrongestAttention;
                // Target token 'loops' is at (50%, 48%)
                const x1 = "50%";
                const y1 = "48%";
                const x2 = `${isMobile && t.scatterMobile ? t.scatterMobile.x : t.scatterDesktop.x}%`;
                const y2 = `${isMobile && t.scatterMobile ? t.scatterMobile.y : t.scatterDesktop.y}%`;

                return (
                  <g key={`attn-${t.id}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isStrong ? "#FFC21A" : "#FFFFFF"}
                      strokeWidth={isStrong ? 3.5 : 1 + t.attentionWeight * 1.5}
                      strokeOpacity={
                        isStrong ? 1.0 : 0.2 + t.attentionWeight * 0.45
                      }
                      strokeDasharray={isStrong ? "none" : "3,3"}
                    />
                    {isStrong && (
                      <text
                        x={`${(50 + (isMobile && t.scatterMobile ? t.scatterMobile.x : t.scatterDesktop.x)) / 2}%`}
                        y={`${(48 + (isMobile && t.scatterMobile ? t.scatterMobile.y : t.scatterDesktop.y)) / 2 - 2}%`}
                        fill="#FFC21A"
                        fontSize="11"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        weight {t.attentionWeight.toFixed(2)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Stages 1 to 4: Input Tokens */}
            <div
              className={`absolute inset-0 p-6 transition-opacity duration-300 ${
                activeStage === 4 ? "opacity-20 pointer-events-none" : "opacity-100"
              }`}
            >
              {activeTokens.map((token, idx) => {
                // Stage 1 & 2: Token flow in natural linear coordinates
                // Stage 3 & 4: Token flow in 2D scatter coordinates
                const scatterX = isMobile && token.scatterMobile ? token.scatterMobile.x : token.scatterDesktop.x;
                const scatterY = isMobile && token.scatterMobile ? token.scatterMobile.y : token.scatterDesktop.y;

                // Approximate initial grid line & column
                const totalCols = isMobile ? 3 : 4;
                const row = Math.floor(idx / totalCols);
                const col = idx % totalCols;
                const linearX = isMobile ? 20 + col * 30 : 14 + col * 22;
                const linearY = isMobile ? 22 + row * 26 : 25 + row * 26;

                // Interpolate strictly between linear and scatter positions
                const currentX =
                  linearX + (scatterX - linearX) * stage2to3Progress;
                const currentY =
                  linearY + (scatterY - linearY) * stage2to3Progress;

                // ID Chip visibility in Stage 2, 3, 4
                const showChip = stage1to2Progress > 0.4;
                const isClusterTarget = ["loops", "Python", "teacher"].includes(
                  token.text
                );

                return (
                  <div
                    key={token.id}
                    className="absolute flex flex-col items-center justify-center transition-transform will-change-transform"
                    style={{
                      left: `${currentX}%`,
                      top: `${currentY}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    {/* Small numeric Token ID chip (Stage 2+) */}
                    <span
                      className={`mb-1 font-mono text-[10px] rounded px-1.5 py-0.2 bg-white/15 text-white/90 transition-opacity duration-200 ${
                        showChip ? "opacity-100" : "opacity-0"
                      }`}
                      aria-hidden="true"
                    >
                      {token.id}
                    </span>

                    {/* Token Word Box */}
                    <span
                      className={`rounded-lg px-2.5 py-1 font-mono text-sm sm:text-base font-semibold transition-all ${
                        isClusterTarget && activeStage >= 2
                          ? "border border-marigold bg-marigold text-navy shadow-md"
                          : token.text === "loops" && activeStage === 3
                          ? "border-2 border-white bg-white text-ultramarine font-bold"
                          : "border border-white/20 bg-white/10 text-white"
                      }`}
                    >
                      {token.text}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Stage 5: Autoregressive Next-Token Generation Output */}
            {activeStage === 4 && (
              <div className="relative z-10 w-full max-w-lg rounded-xl border border-white/20 bg-navy/80 p-6 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <span className="font-mono text-xs text-white/60">
                    Model Output Stream (Autoregressive)
                  </span>
                  <span className="font-mono text-xs text-mint">
                    Tokens: {outputTokensCount} / {OUTPUT_TOKENS.length}
                  </span>
                </div>

                <div className="min-h-[100px] font-mono text-base sm:text-lg text-white leading-relaxed">
                  {OUTPUT_TOKENS.slice(0, outputTokensCount).map((tok, i) => (
                    <span
                      key={i}
                      className="inline-block bg-white/15 text-white px-1 py-0.5 rounded m-0.5"
                    >
                      {tok}
                    </span>
                  ))}
                  {/* Active Caret */}
                  <span
                    className="inline-block w-2 h-5 bg-marigold ml-1 align-middle animate-pulse"
                    aria-hidden="true"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Rail: Stage Indicator Bar */}
        <div className="mx-auto w-full max-w-6xl">
          <div className="h-1 w-full bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-150"
              style={{ width: `${Math.round(scrollProgress * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
