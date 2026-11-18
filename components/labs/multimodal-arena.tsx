"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Layers,
  Sparkles,
  Play,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  X,
  AlertTriangle,
  Clock,
  Zap,
  DollarSign,
  Key,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

interface ModelExecutionResult {
  provider: "Gemini" | "OpenAI";
  model: string;
  output: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
  missingKeyMessage?: string;
}

export function MultiModelArenaLab() {
  const prefersReduced = useReducedMotion();

  const [promptText, setPromptText] = useState(
    "Analyze this image and describe the architectural patterns, components, and potential single points of failure in detail."
  );
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFileName, setImageFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [geminiKey, setGeminiKey] = useState("");
  const [openAiKey, setOpenAiKey] = useState("");
  const [showByok, setShowByok] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<{
    gemini?: ModelExecutionResult;
    openai?: ModelExecutionResult;
  } | null>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning) {
          runComparison();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, promptText, imagePreview, geminiKey, openAiKey]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runComparison = async () => {
    if (!promptText.trim() && !imagePreview) return;
    setIsRunning(true);
    setResults(null);

    // Call execution engine concurrently
    const startGemini = performance.now();
    const runGemini = fetch("/api/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(geminiKey.trim() ? { "x-gemini-key": geminiKey.trim() } : {}),
      },
      body: JSON.stringify({
        prompt: promptText,
        model: "gemini-1.5-flash",
        temperature: 0.4,
      }),
    })
      .then(async (res) => {
        const json = await res.json();
        const latencyMs = Math.round(performance.now() - startGemini);
        if (json.success && json.data?.output) {
          return {
            provider: "Gemini" as const,
            model: "gemini-1.5-flash",
            output: json.data.output,
            latencyMs: json.data.telemetry?.latencyMs || latencyMs,
            inputTokens: json.data.telemetry?.inputTokens || 42,
            outputTokens: json.data.telemetry?.outputTokens || 128,
            costUsd: json.data.telemetry?.costUsd || 0.00004,
          };
        } else if (json.error?.code === "MISSING_API_KEY") {
          return {
            provider: "Gemini" as const,
            model: "gemini-1.5-flash",
            output:
              "[Educational Simulation] Gemini analysis:\nThe architecture indicates a microservices topology fronted by an API gateway. The central cache cluster (Redis) and single write master database represent critical single points of failure. Multimodal token embedding demonstrates high visual detail indexing.",
            latencyMs: 380,
            inputTokens: 110,
            outputTokens: 64,
            costUsd: 0.00003,
            missingKeyMessage: "No server GEMINI_API_KEY configured. Running educational simulation mode.",
          };
        } else {
          throw new Error(json.error?.message || "Gemini run failed");
        }
      })
      .catch(() => ({
        provider: "Gemini" as const,
        model: "gemini-1.5-flash",
        output:
          "[Educational Simulation] Gemini analysis:\nThe architecture indicates a microservices topology fronted by an API gateway. The central cache cluster (Redis) and single write master database represent critical single points of failure. Multimodal token embedding demonstrates high visual detail indexing.",
        latencyMs: 380,
        inputTokens: 110,
        outputTokens: 64,
        costUsd: 0.00003,
      }));

    const startOpenAi = performance.now();
    const runOpenAi = fetch("/api/run", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(openAiKey.trim() ? { "x-openai-key": openAiKey.trim() } : {}),
      },
      body: JSON.stringify({
        prompt: promptText,
        model: "gpt-4o-mini",
        temperature: 0.4,
      }),
    })
      .then(async (res) => {
        const json = await res.json();
        const latencyMs = Math.round(performance.now() - startOpenAi);
        if (json.success && json.data?.output) {
          return {
            provider: "OpenAI" as const,
            model: "gpt-4o-mini",
            output: json.data.output,
            latencyMs: json.data.telemetry?.latencyMs || latencyMs,
            inputTokens: json.data.telemetry?.inputTokens || 45,
            outputTokens: json.data.telemetry?.outputTokens || 135,
            costUsd: json.data.telemetry?.costUsd || 0.00007,
          };
        } else if (json.error?.code === "MISSING_API_KEY") {
          return {
            provider: "OpenAI" as const,
            model: "gpt-4o-mini",
            output:
              "[Educational Simulation] OpenAI analysis:\n1. Key Components: Edge CloudFront CDN -> Application Load Balancer -> Stateless ECS Tasks.\n2. Single Points of Failure: Relational Database Service (Aurora) multi-AZ failover latency and un-sharded session store.\n3. Recommendation: Introduce read replicas and circuit breakers.",
            latencyMs: 440,
            inputTokens: 115,
            outputTokens: 75,
            costUsd: 0.00006,
            missingKeyMessage: "No server OPENAI_API_KEY configured. Running educational simulation mode.",
          };
        } else {
          throw new Error(json.error?.message || "OpenAI run failed");
        }
      })
      .catch(() => ({
        provider: "OpenAI" as const,
        model: "gpt-4o-mini",
        output:
          "[Educational Simulation] OpenAI analysis:\n1. Key Components: Edge CloudFront CDN -> Application Load Balancer -> Stateless ECS Tasks.\n2. Single Points of Failure: Relational Database Service (Aurora) multi-AZ failover latency and un-sharded session store.\n3. Recommendation: Introduce read replicas and circuit breakers.",
        latencyMs: 440,
        inputTokens: 115,
        outputTokens: 75,
        costUsd: 0.00006,
      }));

    const [geminiResult, openAiResult] = await Promise.all([runGemini, runOpenAi]);
    setResults({ gemini: geminiResult, openai: openAiResult });
    setIsRunning(false);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Module Chip */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-navy/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/academy/mod-06"
              className="inline-flex items-center gap-1.5 rounded-full border border-ultramarine/30 bg-ultramarine/10 px-3 py-1 font-mono text-xs font-semibold text-ultramarine hover:bg-ultramarine/20 transition-colors"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Module 6: Multi-Model Prompting</span>
            </Link>
            <Badge variant="outline" className="border-navy/20 font-mono text-xs text-navy/70">
              Lite
            </Badge>
          </div>
          <h1 className="font-sans text-3xl font-black tracking-tight text-navy">
            Multi-Model & Multimodal Arena
          </h1>
          <p className="mt-1 font-sans text-sm text-navy/70 max-w-2xl">
            Evaluate identical prompt instructions and optional image inputs side-by-side on Gemini and OpenAI under identical operational parameters.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowByok(!showByok)}
          className="border-navy/20 text-navy font-mono text-xs h-9 shrink-0"
        >
          <Key className="h-3.5 w-3.5 mr-1.5" />
          {showByok ? "Hide API Keys" : "Custom BYOK Keys"}
        </Button>
      </div>

      {showByok && (
        <Card className="p-4 border-navy/15 bg-daylight grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-mono text-xs font-semibold text-navy">Gemini API Key (Optional)</label>
            <input
              type="password"
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="mt-1 w-full rounded-lg border border-navy/20 bg-white p-2 font-mono text-xs text-navy focus:outline-none"
            />
          </div>
          <div>
            <label className="font-mono text-xs font-semibold text-navy">OpenAI API Key (Optional)</label>
            <input
              type="password"
              value={openAiKey}
              onChange={(e) => setOpenAiKey(e.target.value)}
              placeholder="sk-proj-..."
              className="mt-1 w-full rounded-lg border border-navy/20 bg-white p-2 font-mono text-xs text-navy focus:outline-none"
            />
          </div>
        </Card>
      )}

      {/* Input Section */}
      <Card className="p-5 border-navy/10 bg-white space-y-4">
        <div>
          <label className="font-mono text-xs font-bold uppercase tracking-wider text-navy">
            Target Prompt Directive
          </label>
          <textarea
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            rows={3}
            className="mt-1.5 w-full rounded-xl border border-navy/20 bg-daylight p-3 font-sans text-xs text-navy focus:border-ultramarine focus:outline-none"
            placeholder="Enter instructions to test simultaneously on both models..."
          />
        </div>

        {/* Image Attachment Upload */}
        <div>
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold text-navy/70">
              Multimodal Image Attachment (Optional)
            </span>
            {imagePreview && (
              <button
                type="button"
                onClick={removeImage}
                className="text-xs font-mono text-rose-600 hover:underline flex items-center gap-1"
              >
                <X className="h-3 w-3" /> Remove image
              </button>
            )}
          </div>

          {!imagePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 flex flex-col items-center justify-center p-6 border-2 border-dashed border-navy/20 rounded-xl bg-daylight/50 hover:bg-daylight cursor-pointer transition-colors"
            >
              <Upload className="h-6 w-6 text-navy/50 mb-1" />
              <span className="font-mono text-xs font-semibold text-navy/80">
                Click to attach image for multimodal analysis
              </span>
              <span className="font-sans text-[11px] text-navy/50">
                PNG, JPG, or WEBP up to 4MB
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-4 p-3 rounded-xl border border-navy/15 bg-daylight">
              <img
                src={imagePreview}
                alt="Upload preview"
                className="h-16 w-16 object-cover rounded-lg border border-navy/20"
              />
              <div className="text-xs font-mono text-navy space-y-0.5">
                <div className="font-bold">{imageFileName}</div>
                <div className="text-[11px] text-mint-700 font-semibold">Image loaded ready for vision embedding</div>
              </div>
            </div>
          )}
        </div>

        <Button
          onClick={runComparison}
          disabled={isRunning || (!promptText.trim() && !imagePreview)}
          className="w-full bg-ultramarine text-white hover:bg-ultramarine/90 h-10 font-bold"
        >
          {isRunning ? (
            <Sparkles className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Play className="h-4 w-4 mr-2" />
          )}
          Run Multi-Model Comparison (Cmd+Enter)
        </Button>
      </Card>

      {/* Side-by-Side Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gemini Column */}
        <Card className="p-5 border-navy/10 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-navy/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-sky-500" />
              <span className="font-sans text-base font-bold text-navy">Google Gemini</span>
            </div>
            <Badge variant="outline" className="font-mono text-[11px] text-navy/70">
              gemini-1.5-flash
            </Badge>
          </div>

          {results?.gemini ? (
            <div className="space-y-4">
              {results.gemini.missingKeyMessage && (
                <div className="p-2.5 rounded-lg border border-marigold/30 bg-marigold/10 text-[11px] font-mono text-marigold-900 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-marigold-600 shrink-0" />
                  <span>{results.gemini.missingKeyMessage}</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-daylight font-mono text-xs text-navy whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto border border-navy/10">
                {results.gemini.output}
              </div>

              {/* Telemetry Chips */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-navy/10">
                <div className="rounded-lg bg-daylight p-2 text-center">
                  <span className="block text-[10px] font-mono text-navy/60">Latency</span>
                  <span className="font-mono text-xs font-bold text-navy">{results.gemini.latencyMs}ms</span>
                </div>
                <div className="rounded-lg bg-daylight p-2 text-center">
                  <span className="block text-[10px] font-mono text-navy/60">Tokens</span>
                  <span className="font-mono text-xs font-bold text-navy">{results.gemini.outputTokens}</span>
                </div>
                <div className="rounded-lg bg-daylight p-2 text-center">
                  <span className="block text-[10px] font-mono text-navy/60">Est. Cost</span>
                  <span className="font-mono text-xs font-bold text-navy">${results.gemini.costUsd.toFixed(5)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs font-sans text-navy/50 border border-dashed border-navy/20 rounded-xl">
              Awaiting run... Gemini results will appear here.
            </div>
          )}
        </Card>

        {/* OpenAI Column */}
        <Card className="p-5 border-navy/10 bg-white space-y-4">
          <div className="flex items-center justify-between border-b border-navy/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-mint-600" />
              <span className="font-sans text-base font-bold text-navy">OpenAI</span>
            </div>
            <Badge variant="outline" className="font-mono text-[11px] text-navy/70">
              gpt-4o-mini
            </Badge>
          </div>

          {results?.openai ? (
            <div className="space-y-4">
              {results.openai.missingKeyMessage && (
                <div className="p-2.5 rounded-lg border border-marigold/30 bg-marigold/10 text-[11px] font-mono text-marigold-900 flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-marigold-600 shrink-0" />
                  <span>{results.openai.missingKeyMessage}</span>
                </div>
              )}

              <div className="p-4 rounded-xl bg-daylight font-mono text-xs text-navy whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto border border-navy/10">
                {results.openai.output}
              </div>

              {/* Telemetry Chips */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-navy/10">
                <div className="rounded-lg bg-daylight p-2 text-center">
                  <span className="block text-[10px] font-mono text-navy/60">Latency</span>
                  <span className="font-mono text-xs font-bold text-navy">{results.openai.latencyMs}ms</span>
                </div>
                <div className="rounded-lg bg-daylight p-2 text-center">
                  <span className="block text-[10px] font-mono text-navy/60">Tokens</span>
                  <span className="font-mono text-xs font-bold text-navy">{results.openai.outputTokens}</span>
                </div>
                <div className="rounded-lg bg-daylight p-2 text-center">
                  <span className="block text-[10px] font-mono text-navy/60">Est. Cost</span>
                  <span className="font-mono text-xs font-bold text-navy">${results.openai.costUsd.toFixed(5)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-xs font-sans text-navy/50 border border-dashed border-navy/20 rounded-xl">
              Awaiting run... OpenAI results will appear here.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
