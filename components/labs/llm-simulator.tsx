"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Cpu,
  DollarSign,
  Globe2,
  Info,
  Check,
  Activity,
  Compass,
  Sparkles,
} from "lucide-react";
import {
  STAGES,
} from "@/lib/labs/simulator/types";
import {
  compareTokenizers,
  MULTILINGUAL_PRESETS,
} from "@/lib/labs/simulator/tokenizer";
import {
  buildSimulatorState,
  generateAutoregressiveSteps,
} from "@/lib/labs/simulator/simulation-engine";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useProgress } from "@/lib/storage/progress";

const DEFAULT_SIMULATOR_PROMPT =
  "You are a friendly Python teacher. Explain loops to high school students.";

export function LlmSimulatorLab() {
  const { completeLab } = useProgress();
  const [inputText, setInputText] = useState(DEFAULT_SIMULATOR_PROMPT);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  useEffect(() => {
    completeLab("simulator");
  }, [completeLab]);

  // Stage 2 Tokenization hover state
  const [hoveredTokenIndex, setHoveredTokenIndex] = useState<number | null>(null);

  // Stage 3 Embedding exploration state
  const [selectedTokenA, setSelectedTokenA] = useState<number>(0);
  const [selectedTokenB, setSelectedTokenB] = useState<number>(1);

  // Stage 4 Positional harmonic state
  const [harmonicIndex, setHarmonicIndex] = useState<number>(0);

  // Stage 5 Attention selection & hover
  const [selectedQueryTokenIndex, setSelectedQueryTokenIndex] = useState<number>(0);
  const [activeHeadIndex, setActiveHeadIndex] = useState<number>(0);
  const [hoveredArcKey, setHoveredArcKey] = useState<number | null>(null);

  // Stage 6 Generation state
  const [temperature, setTemperature] = useState<number>(0.7);
  const [activeGenStep, setActiveGenStep] = useState<number>(0);

  // Tokenizer Cost Lens View
  const [showCostLens, setShowCostLens] = useState<boolean>(false);
  const [costLensText, setCostLensText] = useState<string>(
    MULTILINGUAL_PRESETS[1].text // Default to Hindi to demonstrate non-English token expansion immediately
  );
  const [selectedMultilingualPreset, setSelectedMultilingualPreset] = useState<number>(1);

  // Animation interval ref
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Build simulator state deterministically from input text
  const simState = useMemo(() => {
    return buildSimulatorState(inputText, currentStageIndex);
  }, [inputText, currentStageIndex]);

  // Derived tokens and stages
  const currentStageDef = STAGES[currentStageIndex];
  const tokens = simState.tokens;
  const embeddings = simState.embeddings;
  const positional = simState.positional;
  const attentionHeads = simState.attentionHeads;
  const generationSteps = useMemo(() => {
    return generateAutoregressiveSteps(tokens, temperature, 6);
  }, [tokens, temperature]);

  // Tokenizer cost comparison data
  const tokenizerComparisons = useMemo(() => {
    return compareTokenizers(costLensText);
  }, [costLensText]);

  // Ensure selected indices are within valid ranges
  useEffect(() => {
    if (tokens.length > 0) {
      if (selectedQueryTokenIndex >= tokens.length) {
        setSelectedQueryTokenIndex(0);
      }
      if (selectedTokenA >= tokens.length) {
        setSelectedTokenA(0);
      }
      if (selectedTokenB >= tokens.length) {
        setSelectedTokenB(Math.min(1, tokens.length - 1));
      }
    }
  }, [tokens.length, selectedQueryTokenIndex, selectedTokenA, selectedTokenB]);

  // Step Forward invariant: transitions to next stage (or next generation step if on stage 6)
  const stepForward = useCallback(() => {
    if (currentStageIndex < 5) {
      setCurrentStageIndex((prev) => prev + 1);
    } else {
      setActiveGenStep((prev) => Math.min(generationSteps.length - 1, prev + 1));
    }
  }, [currentStageIndex, generationSteps.length]);

  // Step Backward invariant: returns to identical prior state
  const stepBackward = useCallback(() => {
    if (currentStageIndex === 5 && activeGenStep > 0) {
      setActiveGenStep((prev) => prev - 1);
    } else if (currentStageIndex > 0) {
      setCurrentStageIndex((prev) => prev - 1);
    }
  }, [currentStageIndex, activeGenStep]);

  // Replay: resets to stage 1 and initial generation step
  const handleReplay = useCallback(() => {
    setIsPlaying(false);
    setCurrentStageIndex(0);
    setActiveGenStep(0);
    setSelectedQueryTokenIndex(0);
  }, []);

  // Toggle Play / Pause: pausing mid-animation then playing resumes without a jump
  const togglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Jump to specific stage
  const jumpToStage = useCallback((index: number) => {
    setCurrentStageIndex(index);
    if (index !== 5) {
      setActiveGenStep(0);
    }
  }, []);

  // Use refs for clean autoplay timer execution without nested setState side-effects
  const stageRef = useRef(currentStageIndex);
  stageRef.current = currentStageIndex;
  const genStepRef = useRef(activeGenStep);
  genStepRef.current = activeGenStep;

  // Autoplay loop timer
  useEffect(() => {
    if (!isPlaying) {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
      return;
    }

    const intervalMs = Math.round(2200 / playbackSpeed);

    playTimerRef.current = setInterval(() => {
      const curStage = stageRef.current;
      const curGen = genStepRef.current;

      if (curStage < 5) {
        setCurrentStageIndex(curStage + 1);
      } else {
        if (curGen < generationSteps.length - 1) {
          setActiveGenStep(curGen + 1);
        } else {
          // Finished generation: cycle back to start cleanly
          setCurrentStageIndex(0);
          setActiveGenStep(0);
        }
      }
    }, intervalMs);

    return () => {
      if (playTimerRef.current) {
        clearInterval(playTimerRef.current);
        playTimerRef.current = null;
      }
    };
  }, [isPlaying, playbackSpeed, generationSteps.length]);

  // Global Keyboard shortcuts: Space (Play/Pause), ArrowRight (Next), ArrowLeft (Prev), R (Replay), 1-6 (Stages)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        stepForward();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        stepBackward();
      } else if (e.code === "KeyR") {
        e.preventDefault();
        handleReplay();
      } else if (e.key >= "1" && e.key <= "6") {
        e.preventDefault();
        jumpToStage(parseInt(e.key, 10) - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, stepForward, stepBackward, handleReplay, jumpToStage]);

  // Compute Cosine Similarity between selectedTokenA and selectedTokenB
  const embeddingSimilarity = useMemo(() => {
    if (tokens.length === 0) return { dot: 0, normA: 0, normB: 0, cosine: 0 };
    const embA = embeddings[selectedTokenA]?.dimensions || [];
    const embB = embeddings[selectedTokenB]?.dimensions || [];

    let dot = 0;
    let sumSqA = 0;
    let sumSqB = 0;

    for (let i = 0; i < 16; i++) {
      const vA = embA[i] ?? 0;
      const vB = embB[i] ?? 0;
      dot += vA * vB;
      sumSqA += vA * vA;
      sumSqB += vB * vB;
    }

    const normA = Math.sqrt(sumSqA);
    const normB = Math.sqrt(sumSqB);
    const cosine = normA > 0 && normB > 0 ? dot / (normA * normB) : 0;

    return {
      dot: Number(dot.toFixed(4)),
      normA: Number(normA.toFixed(3)),
      normB: Number(normB.toFixed(3)),
      cosine: Number(cosine.toFixed(4)),
    };
  }, [embeddings, selectedTokenA, selectedTokenB, tokens.length]);

  return (
    <div className="space-y-8">
      {/* 1. PERSISTENT EDUCATIONAL SIMULATION BADGE (VISIBLE ON EVERY STAGE) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-cyan-500/30 bg-cyan-950/20 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500"></span>
          </span>
          <span className="font-mono text-xs font-semibold tracking-wide text-cyan-300">
            {"Educational simulation, not a commercial model's internals"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-forge-muted">
          <span>Deterministic Seed: #0xPF42</span>
          <span className="hidden sm:inline">·</span>
          <span>BPE Vocab: 100,277 IDs</span>
        </div>
      </div>

      {/* 2. Top Header & Title */}
      <div className="flex flex-col gap-4 border-b border-forge-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-ember-400">
            <Cpu className="h-4 w-4" />
            <span>Interactive Simulator · Module 1</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-forge-text sm:text-3xl">
            LLM Processing Simulator
          </h1>
          <p className="mt-1 text-sm text-forge-muted max-w-2xl">
            Journey step-by-step through the 6 core stages of modern transformer inference:
            Raw Text, BPE Tokens, Vector Embeddings, Positional Waves, Self-Attention, and Softmax Generation.
          </p>
        </div>

        {/* Tokenizer Cost Lens Drawer Toggle */}
        <Button
          variant={showCostLens ? "default" : "outline"}
          size="sm"
          onClick={() => setShowCostLens((prev) => !prev)}
          className={`gap-2 ${
            showCostLens
              ? "bg-coral text-white font-semibold"
              : "border-indigo/15 hover:border-coral/50 text-coral"
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>{showCostLens ? "Hide Cost Lens" : "Tokenizer Cost Lens"}</span>
        </Button>
      </div>

      {/* 3. OPTIONAL TOKENIZER COST LENS DRAWER */}
      <AnimatePresence>
        {showCostLens && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border border-indigo/10 bg-white p-6 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-indigo/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-coral/10 border border-coral/20 p-2 text-coral">
                    <Globe2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-indigo font-mono">
                      Tokenizer Cost Lens: The Multilingual Token Tax
                    </h3>
                    <p className="text-xs text-indigo/70">
                      Compare how the exact same text is tokenized across 3 different generations of LLM vocabularies.
                    </p>
                  </div>
                </div>

                <Badge
                  variant="outline"
                  className="border-indigo/15 bg-cream text-indigo self-start sm:self-center font-mono text-xs"
                >
                  Real in-browser BPE
                </Badge>
              </div>

              {/* Multilingual Presets Toolbar */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-indigo/60">
                  Multilingual benchmark presets:
                </span>
                <div className="flex flex-wrap gap-2">
                  {MULTILINGUAL_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.language}
                      onClick={() => {
                        setSelectedMultilingualPreset(idx);
                        setCostLensText(preset.text);
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all ${
                        selectedMultilingualPreset === idx
                          ? "border border-coral bg-coral/10 text-coral font-bold"
                          : "border border-indigo/10 bg-cream text-indigo/70 hover:border-coral/40 hover:text-indigo"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editable Prompt Area */}
              <div>
                <textarea
                  value={costLensText}
                  onChange={(e) => setCostLensText(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-indigo/15 bg-cream/60 p-3 font-mono text-xs leading-relaxed text-indigo focus:border-coral focus:outline-none"
                  placeholder="Type any multilingual sentence to inspect its tokenization tax..."
                />
              </div>

              {/* 3-Column Vocabulary Comparison Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tokenizerComparisons.map((item) => (
                  <div
                    key={item.id}
                    className={`flex flex-col rounded-xl border p-4 transition-all ${
                      item.id === "o200k_base"
                        ? "border-emerald-500/30 bg-emerald-950/20"
                        : item.id === "cl100k_base"
                        ? "border-cyan-500/30 bg-cyan-950/20"
                        : "border-amber-500/30 bg-amber-950/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-forge-text">
                        {item.name}
                      </span>
                      <span className="text-[10px] font-mono text-forge-muted">
                        {item.modelEra}
                      </span>
                    </div>

                    {/* Stats Readout */}
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold font-mono text-forge-text">
                        {item.tokenCount}
                      </span>
                      <span className="text-xs font-mono text-forge-muted">tokens</span>
                    </div>

                    <div className="mt-2 space-y-1 text-xs font-mono text-forge-muted">
                      <div className="flex justify-between">
                        <span>Characters / Token:</span>
                        <span className="text-forge-text font-bold">
                          {item.compressionRatio}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Relative Expansion:</span>
                        <span
                          className={`font-bold ${
                            item.tokenExpansionPercent > 0
                              ? "text-rose-400"
                              : item.tokenExpansionPercent < 0
                              ? "text-emerald-400"
                              : "text-forge-muted"
                          }`}
                        >
                          {item.tokenExpansionPercent > 0
                            ? `+${item.tokenExpansionPercent}%`
                            : `${item.tokenExpansionPercent}%`}
                        </span>
                      </div>
                    </div>

                    {/* Token Chips Preview */}
                    <div className="mt-4 flex-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-forge-muted block mb-1.5">
                        Token Fragments:
                      </span>
                      <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                        {item.tokens.map((chunk, idx) => (
                          <span
                            key={idx}
                            className="rounded border border-indigo/10 bg-cream/70 px-1.5 py-0.5 font-mono text-[10px] text-indigo"
                          >
                            {chunk.replace(/\n/g, "\\n")}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Multilingual Insight Callout */}
              <div className="flex items-start gap-3 rounded-lg border border-coral/20 bg-coral/5 p-4 text-xs text-indigo/80">
                <Info className="h-5 w-5 text-coral shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-indigo">
                    Why does non-English text cost more?
                  </span>
                  <p className="leading-relaxed">
                    {MULTILINGUAL_PRESETS[selectedMultilingualPreset].insight}{" "}
                    Legacy vocabularies like r50k split non-Latin unicode characters into separate raw byte tokens, whereas modern o200k embeds common word chunks into native single tokens.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. SIX-STAGE STEPPER NAVIGATION BAR */}
      <div
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6"
        role="tablist"
        aria-label="Transformer Pipeline Stages"
      >
        {STAGES.map((stage, idx) => {
          const isActive = currentStageIndex === idx;
          const isPassed = currentStageIndex > idx;

          return (
            <button
              key={stage.id}
              role="tab"
              aria-selected={isActive}
              aria-label={`Stage ${stage.number}: ${stage.title}`}
              onClick={() => jumpToStage(idx)}
              className={`flex flex-col text-left rounded-xl border p-3.5 transition-all duration-200 ${
                isActive
                  ? "border-coral bg-coral/15 shadow-md shadow-coral/10 scale-[1.02]"
                  : isPassed
                  ? "border-indigo/10 bg-white hover:bg-cream text-indigo/70 hover:text-indigo"
                  : "border-indigo/10 bg-cream/40 hover:bg-white text-indigo/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-mono text-[11px] font-bold ${
                    isActive ? "text-coral" : isPassed ? "text-teal-700" : "text-indigo/50"
                  }`}
                >
                  0{stage.number}
                </span>
                {isPassed && <Check className="h-3.5 w-3.5 text-teal" />}
                {isActive && (
                  <div className="h-2 w-2 rounded-full bg-coral animate-pulse" />
                )}
              </div>
              <span
                className={`mt-1 font-semibold text-xs truncate ${
                  isActive ? "text-indigo font-bold" : "text-indigo/70"
                }`}
              >
                {stage.shortTitle}
              </span>
              <span className="text-[10px] text-indigo/50 line-clamp-1 mt-0.5">
                {stage.badgeLabel.split("·")[1]?.trim() || stage.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* 5. INTERACTIVE PLAYBACK & STEPPER CONTROLS */}
      <Card className="flex flex-wrap items-center justify-between gap-4 border-indigo/10 bg-white p-4 shadow-sm">
        {/* Playback Button Group */}
        <div className="flex items-center gap-2">
          {/* Step Back */}
          <Button
            variant="outline"
            size="sm"
            onClick={stepBackward}
            disabled={currentStageIndex === 0 && activeGenStep === 0}
            className="border-indigo/15 text-indigo hover:bg-cream"
            title="Step Backward (ArrowLeft)"
            aria-label="Step Backward"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Play / Pause Toggle */}
          <Button
            onClick={togglePlay}
            size="sm"
            className="gap-2 font-semibold shadow-sm bg-coral text-white hover:bg-coral-hover"
            title="Play / Pause (Spacebar)"
            aria-label={isPlaying ? "Pause simulation" : "Play simulation"}
          >
            {isPlaying ? (
              <>
                <Pause className="h-4 w-4" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                <span>Play</span>
              </>
            )}
          </Button>

          {/* Step Forward */}
          <Button
            variant="outline"
            size="sm"
            onClick={stepForward}
            disabled={
              currentStageIndex === 5 && activeGenStep === generationSteps.length - 1
            }
            className="border-forge-border text-forge-text hover:bg-forge-surface"
            title="Step Forward (ArrowRight)"
            aria-label="Step Forward"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>

          {/* Replay / Reset */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReplay}
            className="text-forge-muted hover:text-forge-text"
            title="Reset to Stage 1 (R)"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-forge-muted uppercase tracking-wider">
            Speed:
          </span>
          <div className="flex items-center rounded-lg border border-indigo/10 bg-cream p-0.5">
            {[0.5, 1.0, 2.0, 4.0].map((speed) => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`rounded px-2.5 py-1 text-xs font-mono transition-colors ${
                  playbackSpeed === speed
                    ? "bg-coral text-white font-bold"
                    : "text-indigo/70 hover:text-indigo"
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="hidden lg:flex items-center gap-3 text-xs font-mono text-indigo/60">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-indigo/10 bg-cream px-1.5 py-0.5 text-[10px]">
              Space
            </kbd>
            <span>Play/Pause</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-indigo/10 bg-cream px-1.5 py-0.5 text-[10px]">
              ←/→
            </kbd>
            <span>Step</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-indigo/10 bg-cream px-1.5 py-0.5 text-[10px]">
              1-6
            </kbd>
            <span>Jump</span>
          </span>
        </div>
      </Card>

      {/* 6. STAGE CANVAS: DYNAMIC VIEW ACCORDING TO CURRENT STAGE */}
      <div className="space-y-6">
        {/* Stage Overview Banner */}
        <div className="flex flex-col gap-2 rounded-xl border border-forge-border bg-forge-surface p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="border-ember-500/40 bg-ember-500/10 text-ember-400 font-mono text-xs"
              >
                {currentStageDef.badgeLabel}
              </Badge>
              <h2 className="text-lg font-bold text-forge-text">
                {currentStageDef.title}
              </h2>
            </div>
            {currentStageDef.keyFormula && (
              <span className="hidden sm:inline-block font-mono text-xs text-cyan-300 bg-cyan-950/30 border border-cyan-500/20 px-3 py-1 rounded-md">
                ${currentStageDef.keyFormula}$
              </span>
            )}
          </div>
          <p className="text-xs text-forge-muted leading-relaxed max-w-3xl">
            {currentStageDef.description}
          </p>
        </div>

        {/* STAGE 1: RAW INPUT STRING & BYTE STREAM */}
        {currentStageIndex === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-7 border-forge-border bg-forge-surface p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-forge-border/60 pb-3">
                <span className="font-mono text-xs uppercase tracking-wider text-forge-muted">
                  Input String Buffer
                </span>
                <span className="font-mono text-xs text-forge-muted">
                  {inputText.length} UTF-8 Characters
                </span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-indigo/15 bg-cream/60 p-4 font-mono text-sm leading-relaxed text-indigo focus:border-coral focus:outline-none"
                placeholder="Enter prompt text to simulate..."
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-indigo/60">Quick Inputs:</span>
                {[
                  "You are a friendly Python teacher. Explain loops to high school students.",
                  "Summarize quantum computing in three clear bullet points.",
                  "def fibonacci(n):\n    return n if n <= 1 else fib(n-1) + fib(n-2)",
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputText(sample)}
                    className="rounded-lg border border-indigo/10 bg-cream px-2 py-1 text-[11px] font-mono text-indigo/70 hover:border-coral/40 hover:text-indigo"
                  >
                    Sample {idx + 1}
                  </button>
                ))}
              </div>
            </Card>

            <Card className="lg:col-span-5 border-indigo/10 bg-white p-5 space-y-3 shadow-sm">
              <span className="font-mono text-xs uppercase tracking-wider text-indigo/60 block border-b border-indigo/10 pb-3">
                Byte Stream Inspection (Unicode Points & Hex)
              </span>
              <div className="max-h-[220px] overflow-y-auto space-y-1 font-mono text-xs pr-2">
                {inputText.slice(0, 32).split("").map((char, idx) => {
                  const code = char.charCodeAt(0);
                  const hex = code.toString(16).toUpperCase().padStart(4, "0");
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-lg border border-indigo/10 bg-cream/50 px-2.5 py-1 text-indigo/70"
                    >
                      <span className="text-forge-text font-bold">
                        {char === " " ? "[SPACE]" : char === "\n" ? "[NEWLINE]" : char}
                      </span>
                      <span className="text-[11px] text-cyan-400">U+{hex}</span>
                      <span className="text-[11px] text-forge-muted">
                        idx {idx}
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-forge-muted leading-relaxed">
                Tokens are not characters. In the next stage, the tokenizer maps contiguous character slices into discrete integer tokens.
              </p>
            </Card>
          </div>
        )}

        {/* STAGE 2: BPE TOKENIZATION (REAL IN-BROWSER TOKENIZER) */}
        {currentStageIndex === 1 && (
          <Card className="border-forge-border bg-forge-surface p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-forge-border pb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">
                  Byte-Pair Encoding Decomposition
                </span>
                <h3 className="text-base font-bold text-forge-text mt-0.5">
                  Discrete Vocabulary Tokens ({tokens.length} tokens extracted)
                </h3>
              </div>
              <Badge
                variant="outline"
                className="border-cyan-500/40 text-cyan-300 font-mono text-xs self-start sm:self-center"
              >
                cl100k_base Engine
              </Badge>
            </div>

            {/* Interactive Bidirectional Highlight Area */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo/60 block">
                Bidirectional Text Mapping (Hover tokens below to inspect exact character boundaries):
              </span>
              <div className="rounded-xl border border-indigo/10 bg-cream/60 p-4 font-mono text-xs leading-relaxed">
                {tokens.map((t) => {
                  const isHovered = hoveredTokenIndex === t.index;
                  return (
                    <span
                      key={t.index}
                      onMouseEnter={() => setHoveredTokenIndex(t.index)}
                      onMouseLeave={() => setHoveredTokenIndex(null)}
                      style={{
                        backgroundColor: isHovered ? `${t.hexColor}44` : undefined,
                        borderBottom: isHovered ? `2px solid ${t.hexColor}` : undefined,
                      }}
                      className="cursor-pointer transition-colors px-0.5 py-0.5 rounded-sm"
                    >
                      {t.text}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Token Chips Array */}
            <div className="flex flex-wrap gap-2 p-4 rounded-xl border border-indigo/10 bg-cream/40 min-h-[120px]">
              {tokens.map((token) => {
                const isHovered = hoveredTokenIndex === token.index;
                return (
                  <div
                    key={token.index}
                    onMouseEnter={() => setHoveredTokenIndex(token.index)}
                    onMouseLeave={() => setHoveredTokenIndex(null)}
                    className={`group relative flex flex-col rounded-lg border px-3 py-1.5 transition-all cursor-pointer ${
                      isHovered ? "ring-2 ring-indigo scale-105 shadow-md" : ""
                    } ${token.colorClass}`}
                  >
                    <div className="flex items-center justify-between gap-3 text-[10px] font-mono opacity-80">
                      <span>#{token.index}</span>
                      <span className="font-bold text-forge-text">ID: {token.id}</span>
                    </div>
                    <span className="mt-0.5 font-mono text-sm font-semibold text-forge-text whitespace-pre">
                      {token.cleanText}
                    </span>
                    <div className="mt-1 flex items-center justify-between text-[9px] font-mono opacity-70">
                      <span>{token.byteLength} B</span>
                      <span>chars [{token.charStart}:{token.charEnd}]</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Token Statistics Readout */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              <div className="rounded-xl border border-indigo/10 bg-cream/50 p-3">
                <span className="text-[10px] font-mono uppercase text-indigo/60 block">
                  Total Tokens
                </span>
                <span className="text-xl font-bold font-mono text-coral">
                  {tokens.length}
                </span>
              </div>
              <div className="rounded-xl border border-indigo/10 bg-cream/50 p-3">
                <span className="text-[10px] font-mono uppercase text-indigo/60 block">
                  Character Length
                </span>
                <span className="text-xl font-bold font-mono text-indigo">
                  {inputText.length}
                </span>
              </div>
              <div className="rounded-xl border border-indigo/10 bg-cream/50 p-3">
                <span className="text-[10px] font-mono uppercase text-indigo/60 block">
                  Compression Ratio
                </span>
                <span className="text-xl font-bold font-mono text-teal-700">
                  {(inputText.length / Math.max(1, tokens.length)).toFixed(2)} c/t
                </span>
              </div>
              <div className="rounded-xl border border-indigo/10 bg-cream/50 p-3">
                <span className="text-[10px] font-mono uppercase text-indigo/60 block">
                  Vocabulary Ceiling
                </span>
                <span className="text-xl font-bold font-mono text-indigo">100k IDs</span>
              </div>
            </div>
          </Card>
        )}

        {/* STAGE 3: TOKEN VECTOR EMBEDDINGS (HEATMAP + 2D PROJECTION & COSINE SIMILARITY) */}
        {currentStageIndex === 2 && (
          <Card className="border-forge-border bg-forge-surface p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-forge-border pb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-purple-400">
                  Continuous Geometric Space
                </span>
                <h3 className="text-base font-bold text-forge-text mt-0.5">
                  Dense Vector Embeddings &amp; Cosine Similarity ($d = 16$ Visualized)
                </h3>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-forge-muted">
                <div className="h-3 w-8 rounded bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500" />
                <span>Value: -1.0 to +1.0</span>
              </div>
            </div>

            {/* Interactive Cosine Similarity Inspector */}
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/15 p-4 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <span className="text-xs font-mono font-bold text-purple-300 flex items-center gap-1.5">
                  <Compass className="h-4 w-4" />
                  <span>Geometric Cosine Similarity Inspector</span>
                </span>
                <span className="text-[11px] font-mono text-forge-muted">
                  {"cos(e_A, e_B) = (e_A · e_B) / (||e_A|| ||e_B||)"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                {/* Token A Selector */}
                <div className="flex items-center gap-2 bg-forge-black/60 rounded-lg p-2 border border-forge-border">
                  <span className="text-[10px] font-mono text-forge-muted uppercase">
                    Token A:
                  </span>
                  <select
                    value={selectedTokenA}
                    onChange={(e) => setSelectedTokenA(parseInt(e.target.value, 10))}
                    className="bg-transparent font-mono text-xs text-forge-text focus:outline-none flex-1"
                  >
                    {tokens.map((t) => (
                      <option key={t.index} value={t.index} className="bg-forge-black text-forge-text">
                        #{t.index}: &quot;{t.cleanText}&quot;
                      </option>
                    ))}
                  </select>
                </div>

                {/* Token B Selector */}
                <div className="flex items-center gap-2 bg-forge-black/60 rounded-lg p-2 border border-forge-border">
                  <span className="text-[10px] font-mono text-forge-muted uppercase">
                    Token B:
                  </span>
                  <select
                    value={selectedTokenB}
                    onChange={(e) => setSelectedTokenB(parseInt(e.target.value, 10))}
                    className="bg-transparent font-mono text-xs text-forge-text focus:outline-none flex-1"
                  >
                    {tokens.map((t) => (
                      <option key={t.index} value={t.index} className="bg-forge-black text-forge-text">
                        #{t.index}: &quot;{t.cleanText}&quot;
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mathematical Result */}
                <div className="flex items-center justify-between bg-forge-black/80 rounded-lg p-2.5 border border-purple-500/40">
                  <div className="text-[11px] font-mono text-forge-muted">
                    Dot: <span className="text-forge-text">{embeddingSimilarity.dot}</span>
                  </div>
                  <div className="font-mono text-sm font-bold text-cyan-300">
                    Similarity: {(embeddingSimilarity.cosine * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Vector Heatmap Table */}
            <div className="overflow-x-auto">
              <div className="space-y-2 min-w-[600px]">
                {embeddings.map((emb) => (
                  <div
                    key={emb.token.index}
                    className="flex items-center gap-3 rounded-lg border border-forge-border/60 bg-forge-black/50 p-2.5"
                  >
                    <div className="w-24 shrink-0 font-mono text-xs">
                      <span className="font-bold text-forge-text truncate block">
                        {emb.token.cleanText}
                      </span>
                      <span className="text-[10px] text-forge-muted">
                        id:{emb.token.id}
                      </span>
                    </div>

                    {/* 16-Dimension Heatmap Grid */}
                    <div className="flex-1 grid grid-cols-16 gap-1">
                      {emb.dimensions.map((val, dimIdx) => {
                        const normVal = (val + 1) / 2;
                        const r = Math.round(59 + normVal * 180);
                        const g = Math.round(130 - normVal * 80);
                        const b = Math.round(246 - normVal * 40);

                        return (
                          <div
                            key={dimIdx}
                            title={`Dim ${dimIdx}: ${val}`}
                            style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }}
                            className="h-7 rounded flex items-center justify-center font-mono text-[9px] text-white/90 font-medium select-none"
                          >
                            {val > 0 ? `+${val.toFixed(1)}` : val.toFixed(1)}
                          </div>
                        );
                      })}
                    </div>

                    <div className="w-20 shrink-0 text-right font-mono text-[11px]">
                      <span className="text-cyan-400 font-bold">||e|| {emb.norm}</span>
                      <span className="text-[10px] text-forge-muted block capitalize">
                        {emb.cluster}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-forge-muted leading-relaxed">
              Embeddings project discrete integer tokens into continuous geometric vectors. Words with similar contextual usage occupy nearby geometric clusters in vector space.
            </p>
          </Card>
        )}

        {/* STAGE 4: POSITIONAL ENCODING (CONTINUOUS WAVEFORM CANVAS) */}
        {currentStageIndex === 3 && (
          <Card className="border-forge-border bg-forge-surface p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-forge-border pb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-cyan-400">
                  Order Injection
                </span>
                <h3 className="text-base font-bold text-forge-text mt-0.5">
                  Sinusoidal Positional Encoding ($\sin / \cos$ Superposition)
                </h3>
              </div>
              <Badge
                variant="outline"
                className="border-cyan-500/40 text-cyan-300 font-mono text-xs self-start sm:self-center"
              >
                {"PE(pos, 2i) = sin(pos / 10000^(2i/d))"}
              </Badge>
            </div>

            {/* Continuous SVG Sinusoidal Waveform Canvas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-forge-muted">
                  Continuous Sinusoidal Wave Over Sequence Index (Harmonic Frequency $i={harmonicIndex}$):
                </span>
                <div className="flex items-center gap-1 font-mono text-xs text-forge-muted">
                  <span>Frequency:</span>
                  {[0, 1, 2, 4, 7].map((h) => (
                    <button
                      key={h}
                      onClick={() => setHarmonicIndex(h)}
                      className={`px-2 py-0.5 rounded text-[10px] ${
                        harmonicIndex === h
                          ? "bg-cyan-500 text-forge-black font-bold"
                          : "border border-forge-border hover:bg-forge-surface"
                      }`}
                    >
                      i={h}
                    </button>
                  ))}
                </div>
              </div>

              {/* SVG Waveform Rendering */}
              <div className="relative rounded-xl border border-cyan-500/30 bg-forge-black/80 p-4 overflow-hidden">
                <svg
                  viewBox="0 0 1000 160"
                  className="w-full h-40 overflow-visible"
                  preserveAspectRatio="none"
                >
                  {/* Zero axis */}
                  <line
                    x1="0"
                    y1="80"
                    x2="1000"
                    y2="80"
                    stroke="#334155"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />

                  {/* Continuous Sine Wave Path */}
                  {(() => {
                    const N = Math.max(1, tokens.length);
                    const denominator = Math.pow(10000, (2 * harmonicIndex) / 16);
                    let pathD = "M 0 80";
                    for (let x = 0; x <= 1000; x += 10) {
                      const pos = (x / 1000) * (N - 1);
                      const angle = pos / denominator;
                      const y = 80 - Math.sin(angle) * 55;
                      pathD += ` L ${x} ${y.toFixed(1)}`;
                    }
                    return (
                      <path
                        d={pathD}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                        className="opacity-90"
                      />
                    );
                  })()}

                  {/* Discrete Token Points along the wave */}
                  {tokens.map((token, idx) => {
                    const N = Math.max(1, tokens.length);
                    const denominator = Math.pow(10000, (2 * harmonicIndex) / 16);
                    const x = N === 1 ? 500 : (idx / (N - 1)) * 900 + 50;
                    const angle = idx / denominator;
                    const sinVal = Math.sin(angle);
                    const y = 80 - sinVal * 55;

                    return (
                      <g key={token.index} className="cursor-pointer group">
                        <line
                          x1={x}
                          y1="80"
                          x2={x}
                          y2={y}
                          stroke="#06b6d4"
                          strokeWidth="1.5"
                          strokeDasharray="2 2"
                          opacity="0.6"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="5"
                          fill="#f97316"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                        />
                        <text
                          x={x}
                          y={y > 80 ? y + 16 : y - 10}
                          textAnchor="middle"
                          fill="#e2e8f0"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          {token.cleanText.slice(0, 5)}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Positional Wave Visualization Grid */}
            <div className="space-y-3">
              {positional.map((pos) => (
                <div
                  key={pos.positionIndex}
                  className="flex items-center gap-4 rounded-xl border border-forge-border/60 bg-forge-black/50 p-3"
                >
                  <div className="w-28 shrink-0 font-mono text-xs">
                    <span className="text-[10px] text-cyan-400 block font-bold">
                      Position {pos.positionIndex}
                    </span>
                    <span className="text-sm font-semibold text-forge-text truncate block">
                      {pos.token.cleanText}
                    </span>
                  </div>

                  {/* Superposition Bars: Sine Wave Values */}
                  <div className="flex-1 grid grid-cols-8 gap-1.5">
                    {pos.sineValues.map((sVal, idx) => {
                      const heightPercent = Math.max(15, Math.abs(sVal) * 100);
                      const isPositive = sVal >= 0;

                      return (
                        <div
                          key={idx}
                          className="flex flex-col items-center justify-end h-10 rounded bg-forge-surface/80 p-1"
                          title={`Freq ${idx}: sin=${sVal}`}
                        >
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-sm transition-all duration-300 ${
                              isPositive ? "bg-cyan-500" : "bg-purple-500"
                            }`}
                          />
                          <span className="text-[9px] font-mono text-forge-muted mt-1">
                            {sVal.toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-forge-muted leading-relaxed">
              Without positional encoding, transformers treat sentences like an unordered bag of words (&quot;dog bites man&quot; would appear identical to &quot;man bites dog&quot;). Sine and cosine waves of varying frequencies uniquely imprint the relative sequence position onto each token vector.
            </p>
          </Card>
        )}

        {/* STAGE 5: MULTI-HEAD SELF-ATTENTION (BEAST SVG ANIMATED BEAMS) */}
        {currentStageIndex === 4 && (
          <Card className="border-forge-border bg-forge-surface p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-forge-border pb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-ember-400 flex items-center gap-1.5">
                  <Activity className="h-4 w-4" />
                  <span>Dynamic Semantic Routing Graph</span>
                </span>
                <h3 className="text-base font-bold text-forge-text mt-0.5">
                  Multi-Head Self-Attention: Animated Query Routing Beams
                </h3>
              </div>

              {/* Head Selector Tabs */}
              <div className="flex items-center rounded-lg border border-forge-border bg-forge-black p-0.5 self-start sm:self-center">
                {attentionHeads.map((head, idx) => (
                  <button
                    key={head.id}
                    onClick={() => setActiveHeadIndex(idx)}
                    className={`rounded px-3 py-1 text-xs font-mono transition-colors ${
                      activeHeadIndex === idx
                        ? "bg-ember-500 text-forge-black font-bold shadow-sm"
                        : "text-forge-muted hover:text-forge-text"
                    }`}
                  >
                    Head {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-ember-500/20 bg-ember-500/5 p-3 text-xs text-ember-300">
              <span className="font-bold">
                {attentionHeads[activeHeadIndex]?.name}:
              </span>{" "}
              {attentionHeads[activeHeadIndex]?.description}
            </div>

            {/* Interactive Token Strip: Click to set Query Token */}
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-forge-muted block mb-2">
                Tokens (Click any token to set as Active Query $q_i$):
              </span>
              <div className="flex flex-wrap gap-2">
                {tokens.map((token, idx) => {
                  const isQuery = selectedQueryTokenIndex === idx;
                  const weight =
                    attentionHeads[activeHeadIndex]?.weights[selectedQueryTokenIndex]?.[idx] ?? 0;

                  return (
                    <button
                      key={token.index}
                      onClick={() => setSelectedQueryTokenIndex(idx)}
                      className={`relative flex flex-col rounded-lg border px-3 py-2 text-left font-mono transition-all ${
                        isQuery
                          ? "border-ember-500 bg-ember-500/20 text-ember-300 ring-2 ring-ember-500/50 scale-105 shadow-lg"
                          : "border-forge-border bg-forge-black/60 text-forge-text hover:border-forge-text/50"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-forge-muted">
                        <span>#{idx}</span>
                        {isQuery && (
                          <span className="rounded bg-ember-500 text-forge-black px-1 font-bold text-[9px]">
                            QUERY
                          </span>
                        )}
                      </div>
                      <span className="font-semibold text-sm whitespace-pre mt-0.5">
                        {token.cleanText}
                      </span>
                      <span className="text-[10px] text-cyan-400 mt-1">
                        $\alpha$: {(weight * 100).toFixed(1)}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* GENUINE SVG ATTENTION BEAMS VISUALIZER */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-400">
                  Animated Attention Beams from Query [{tokens[selectedQueryTokenIndex]?.cleanText}]
                </span>
                <span className="text-[10px] font-mono text-forge-muted">
                  {"Curved stroke opacity equals attention weight α(query, key)"}
                </span>
              </div>

              <div className="relative rounded-xl border border-white/[0.08] bg-[#0A0C0F] p-4 overflow-hidden">
                {/* SVG Routing Arcs Canvas */}
                <svg
                  viewBox="0 0 1000 280"
                  className="w-full h-64 overflow-visible"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <defs>
                    <linearGradient id="beamGradientEmber" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#f97316" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="beamGradientPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
                    </linearGradient>
                    <linearGradient id="beamGradientEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.9" />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>

                  {/* Draw Attention Curved Beams from Query token to all Key tokens */}
                  {tokens.map((kToken, kIdx) => {
                    const N = Math.max(1, tokens.length);
                    const qIdx = selectedQueryTokenIndex;
                    const xQ = N === 1 ? 500 : 70 + (qIdx / (N - 1)) * 860;
                    const xK = N === 1 ? 500 : 70 + (kIdx / (N - 1)) * 860;
                    const yNode = 60;

                    const weight =
                      attentionHeads[activeHeadIndex]?.weights[qIdx]?.[kIdx] ?? 0;
                    const isSelf = qIdx === kIdx;
                    const isHovered = hoveredArcKey === kIdx;

                    const strokeGradient =
                      activeHeadIndex === 0
                        ? "url(#beamGradientEmber)"
                        : activeHeadIndex === 1
                        ? "url(#beamGradientPurple)"
                        : "url(#beamGradientEmerald)";

                    // Self loop vs quadratic bezier to other tokens
                    let arcPathD = "";
                    if (isSelf) {
                      arcPathD = `M ${xQ - 12} ${yNode} C ${xQ - 30} ${yNode + 60}, ${xQ + 30} ${yNode + 60}, ${xQ + 12} ${yNode}`;
                    } else {
                      const cx = (xQ + xK) / 2;
                      const dist = Math.abs(xK - xQ);
                      const cy = yNode + Math.min(200, 45 + dist * 0.32);
                      arcPathD = `M ${xQ} ${yNode} Q ${cx} ${cy} ${xK} ${yNode}`;
                    }

                    // Strict contract: opacity proportional to weight
                    const strokeOpacity = Math.max(0.12, weight * 0.95);
                    const strokeWidth = Math.max(1.5, weight * 9);

                    return (
                      <g
                        key={kIdx}
                        onMouseEnter={() => setHoveredArcKey(kIdx)}
                        onMouseLeave={() => setHoveredArcKey(null)}
                        className="cursor-pointer transition-all"
                      >
                        {/* Interactive Invisible Fat Hitbox for easy hover */}
                        <path
                          d={arcPathD}
                          fill="none"
                          stroke="transparent"
                          strokeWidth="20"
                        />
                        {/* Visible Energy Beam */}
                        <path
                          d={arcPathD}
                          fill="none"
                          stroke={strokeGradient}
                          strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                          strokeOpacity={isHovered ? 1.0 : strokeOpacity}
                          strokeDasharray="6 4"
                          className="transition-all duration-300"
                        >
                          <animate
                            attributeName="stroke-dashoffset"
                            from="20"
                            to="0"
                            dur={weight > 0.2 ? "1.0s" : "2.0s"}
                            repeatCount="indefinite"
                          />
                        </path>
                      </g>
                    );
                  })}

                  {/* Draw Token Nodes along horizontal axis */}
                  {tokens.map((token, idx) => {
                    const N = Math.max(1, tokens.length);
                    const x = N === 1 ? 500 : 70 + (idx / (N - 1)) * 860;
                    const y = 60;
                    const isQuery = selectedQueryTokenIndex === idx;
                    const weight =
                      attentionHeads[activeHeadIndex]?.weights[selectedQueryTokenIndex]?.[idx] ?? 0;
                    const nodeRadius = isQuery ? 10 : Math.max(6, 6 + weight * 12);

                    return (
                      <g
                        key={token.index}
                        onClick={() => setSelectedQueryTokenIndex(idx)}
                        onMouseEnter={() => setHoveredArcKey(idx)}
                        onMouseLeave={() => setHoveredArcKey(null)}
                        className="cursor-pointer group"
                      >
                        {/* Pulsing ring for active query */}
                        {isQuery && (
                          <circle
                            cx={x}
                            cy={y}
                            r="16"
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="2"
                            strokeDasharray="4 2"
                            className="animate-spin opacity-80"
                          />
                        )}

                        {/* Node circle */}
                        <circle
                          cx={x}
                          cy={y}
                          r={nodeRadius}
                          fill={isQuery ? "#f97316" : "#0f172a"}
                          stroke={isQuery ? "#ffffff" : weight > 0.15 ? "#06b6d4" : "#475569"}
                          strokeWidth="2"
                          className="transition-all duration-300 group-hover:scale-125"
                        />

                        {/* Token Text Label */}
                        <text
                          x={x}
                          y={y - 20}
                          textAnchor="middle"
                          fill={isQuery ? "#f97316" : "#f1f5f9"}
                          fontSize="11"
                          fontWeight={isQuery ? "bold" : "600"}
                          fontFamily="monospace"
                        >
                          {token.cleanText.slice(0, 8)}
                        </text>

                        {/* Attention percentage indicator */}
                        <text
                          x={x}
                          y={y + 24}
                          textAnchor="middle"
                          fill={isQuery ? "#f97316" : "#06b6d4"}
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {(weight * 100).toFixed(0)}%
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Attention Weights Bar Breakdown */}
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-forge-muted block">
                Row-Wise Softmax Distribution from Query Token [
                {tokens[selectedQueryTokenIndex]?.cleanText}]:
              </span>
              {tokens.map((kToken, kIdx) => {
                const weight =
                  attentionHeads[activeHeadIndex]?.weights[selectedQueryTokenIndex]?.[kIdx] ?? 0;
                const isSelf = selectedQueryTokenIndex === kIdx;

                return (
                  <div
                    key={kIdx}
                    className="flex items-center gap-3 font-mono text-xs text-forge-text"
                  >
                    <div className="w-24 truncate font-bold text-forge-muted">
                      {kToken.cleanText}
                      {isSelf && " (self)"}
                    </div>
                    <div className="flex-1 h-3 rounded-full bg-forge-surface overflow-hidden">
                      <div
                        style={{
                          width: `${Math.max(2, weight * 100)}%`,
                          opacity: Math.max(0.2, weight),
                        }}
                        className={`h-full rounded-full transition-all duration-300 ${
                          isSelf
                            ? "bg-amber-400"
                            : weight > 0.15
                            ? "bg-cyan-400"
                            : "bg-purple-500"
                        }`}
                      />
                    </div>
                    <span className="w-14 text-right text-cyan-400 font-bold">
                      {(weight * 100).toFixed(1)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* STAGE 6: AUTOREGRESSIVE OUTPUT GENERATION */}
        {currentStageIndex === 5 && (
          <Card className="border-forge-border bg-forge-surface p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-forge-border pb-4">
              <div>
                <span className="font-mono text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  <span>Iterative Token Emission</span>
                </span>
                <h3 className="text-base font-bold text-forge-text mt-0.5">
                  Autoregressive Softmax Sampling (Step {activeGenStep + 1} of{" "}
                  {generationSteps.length})
                </h3>
              </div>

              {/* Temperature Slider */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-forge-muted">
                  Temp:{" "}
                  <span className="text-amber-400 font-bold">
                    {temperature.toFixed(2)}
                  </span>
                </span>
                <input
                  type="range"
                  min="0.1"
                  max="1.5"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-28 accent-amber-500"
                />
              </div>
            </div>

            {/* Generated Text Window */}
            <div className="rounded-xl border border-forge-border bg-forge-black/80 p-5 space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-forge-muted">
                Emitted Sequence So Far:
              </span>
              <p className="font-mono text-sm leading-relaxed text-forge-text">
                <span className="text-forge-muted">
                  {tokens.map((t) => t.text).join("")}
                </span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded ml-1 animate-pulse">
                  {generationSteps
                    .slice(0, activeGenStep + 1)
                    .map((s) => s.selectedToken.token)
                    .join("")}
                </span>
              </p>
            </div>

            {/* Top-5 Candidate Softmax Probabilities Bar Chart */}
            <div className="space-y-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-forge-muted block">
                Top Vocabulary Candidates (Softmax Distribution with Temperature T=
                {temperature}):
              </span>

              <div className="space-y-2">
                {generationSteps[activeGenStep]?.topCandidates.map((cand, idx) => {
                  const isSelected = idx === 0;

                  return (
                    <div
                      key={cand.id}
                      className={`flex items-center gap-4 rounded-lg border p-3 font-mono text-xs transition-all ${
                        isSelected
                          ? "border-emerald-500/50 bg-emerald-950/20 text-emerald-300 shadow-sm"
                          : "border-forge-border bg-forge-black/50 text-forge-muted"
                      }`}
                    >
                      <span className="w-6 font-bold">#{cand.rank}</span>
                      <span className="w-28 font-bold text-forge-text truncate">
                        &quot;{cand.token}&quot;
                      </span>
                      <span className="text-[10px] text-forge-muted">ID: {cand.id}</span>

                      {/* Probability Bar */}
                      <div className="flex-1 h-3 rounded-full bg-forge-surface overflow-hidden">
                        <div
                          style={{
                            width: `${(cand.probability * 100).toFixed(1)}%`,
                          }}
                          className={`h-full rounded-full transition-all duration-300 ${
                            isSelected ? "bg-emerald-400" : "bg-cyan-500/70"
                          }`}
                        />
                      </div>

                      <span className="w-16 text-right font-bold text-cyan-400">
                        {(cand.probability * 100).toFixed(1)}%
                      </span>

                      {isSelected && (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/40 text-emerald-400 text-[10px] py-0"
                        >
                          SAMPLED
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step navigation within generation */}
            <div className="flex items-center justify-between pt-2 border-t border-forge-border/60">
              <span className="text-xs font-mono text-forge-muted">
                Step {activeGenStep + 1} of {generationSteps.length}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveGenStep((prev) => Math.max(0, prev - 1))}
                  disabled={activeGenStep === 0}
                  className="text-xs"
                >
                  Prev Token
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActiveGenStep((prev) =>
                      Math.min(generationSteps.length - 1, prev + 1)
                    )
                  }
                  disabled={activeGenStep === generationSteps.length - 1}
                  className="text-xs"
                >
                  Next Token
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
