"use client";

import * as React from "react";
import {
  Sparkles,
  Zap,
  Play,
  Copy,
  Check,
  RotateCcw,
  Key,
  AlertTriangle,
  Clock,
  Coins,
  Cpu,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

interface RunData {
  text: string;
  tokensIn: number;
  tokensOut: number;
  totalTokens: number;
  latencyMs: number;
  costEstimateUsd: number;
  cached: boolean;
  model: string;
  provider: string;
  finishReason?: string;
  timestamp: number;
}

interface RunError {
  code: string;
  message: string;
  retryAfterSeconds?: number;
  field?: string;
  provider?: string;
}

const SAMPLE_PROMPTS = [
  {
    title: "Chain-of-Thought",
    prompt:
      "A farmer has 17 sheep. All but 9 run away. How many sheep are left? Walk through your thinking step-by-step before stating the final answer.",
    system: "You are a precise, analytical reasoning assistant.",
  },
  {
    title: "Code Refactor",
    prompt:
      "Review this TypeScript function for security, memory leaks, and performance:\n\nfunction processItems(items: string[]) {\n  return items.map(item => eval(item));\n}",
    system: "You are a principal software engineer and security auditor.",
  },
  {
    title: "Structured Output",
    prompt:
      "Extract the key entities, sentiment, and action items from this customer feedback:\n'The model latency dropped dramatically after Phase 3, but we need better documentation for custom adapters.'",
    system:
      "Output your analysis strictly in structured markdown with bullet points.",
  },
];

export function PromptPlayground() {
  const prefersReducedMotion = useReducedMotion();

  // Inputs
  const [prompt, setPrompt] = React.useState(SAMPLE_PROMPTS[0].prompt);
  const [system, setSystem] = React.useState(SAMPLE_PROMPTS[0].system);
  const [showSystem, setShowSystem] = React.useState(true);
  const [model, setModel] = React.useState("gemini-1.5-flash");
  const [temperature, setTemperature] = React.useState(0.7);
  const [byokKey, setByokKey] = React.useState("");
  const [showByok, setShowByok] = React.useState(false);

  // States
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<RunData | null>(null);
  const [revealedText, setRevealedText] = React.useState("");
  const [isRevealing, setIsRevealing] = React.useState(false);
  const [error, setError] = React.useState<RunError | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Stream-style typewriter reveal
  React.useEffect(() => {
    if (!result?.text) {
      setRevealedText("");
      setIsRevealing(false);
      return;
    }

    // If reduced motion is preferred or response is cached, reveal immediately
    if (prefersReducedMotion || result.cached) {
      setRevealedText(result.text);
      setIsRevealing(false);
      return;
    }

    setIsRevealing(true);
    let currentIndex = 0;
    const fullText = result.text;
    const chunkSize = Math.max(1, Math.floor(fullText.length / 30));
    const intervalMs = 20;

    const timer = setInterval(() => {
      currentIndex += chunkSize;
      if (currentIndex >= fullText.length) {
        setRevealedText(fullText);
        setIsRevealing(false);
        clearInterval(timer);
      } else {
        setRevealedText(fullText.slice(0, currentIndex));
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [result, prefersReducedMotion]);

  const handleRun = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setCopied(false);
    setResult(null);
    setRevealedText("");

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (byokKey.trim()) {
        headers["x-provider-key"] = byokKey.trim();
      }

      const res = await fetch("/api/run", {
        method: "POST",
        headers,
        body: JSON.stringify({
          prompt: prompt.trim(),
          system: system.trim() || undefined,
          model,
          temperature,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data.error || {
            code: "EXECUTION_ERROR",
            message: `Request failed with HTTP status ${res.status}`,
          }
        );
        setResult(null);
      } else {
        setResult(data.data);
      }
    } catch (err: unknown) {
      setError({
        code: "NETWORK_ERROR",
        message:
          err instanceof Error
            ? err.message
            : "Network error communicating with PromptForge backend.",
      });
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
    }
  };

  const handleCopy = async () => {
    if (!result?.text) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Playground Header */}
      <div className="flex flex-col gap-3 border-b border-forge-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge
              variant="default"
              className="text-[10px] uppercase tracking-wider"
            >
              Phase 3 AI Backend
            </Badge>
            <span className="font-mono text-xs text-forge-subtle">
              Unified LLM Runtime
            </span>
          </div>
          <h1 className="mt-1 font-mono text-2xl font-bold tracking-tight text-forge-text sm:text-3xl">
            Live Prompt Playground
          </h1>
          <p className="mt-1 text-sm text-forge-muted">
            Execute prompts across Gemini & OpenAI with automatic LRU caching,
            per-IP rate limiting, and cost estimation.
          </p>
        </div>

        {/* Quick Sample Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-forge-subtle">Presets:</span>
          {SAMPLE_PROMPTS.map((sample) => (
            <button
              key={sample.title}
              onClick={() => {
                setPrompt(sample.prompt);
                setSystem(sample.system);
                setError(null);
              }}
              className="rounded-md border border-forge-border bg-forge-surface px-2.5 py-1 text-xs text-forge-muted transition hover:border-forge-border-bright hover:bg-forge-elevated hover:text-forge-text"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Controls & Prompt Input (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Controls Bar */}
          <Card className="border-forge-border bg-forge-surface/80 p-4 backdrop-blur-sm">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Model Select */}
              <div className="space-y-1.5">
                <label
                  htmlFor="model-select"
                  className="flex items-center gap-1.5 font-mono text-xs font-semibold text-forge-muted"
                >
                  <Cpu className="h-3.5 w-3.5 text-ember-400" />
                  Provider & Model
                </label>
                <select
                  id="model-select"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-md border border-forge-border bg-forge-elevated px-3 py-2 font-mono text-xs text-forge-text transition focus:border-ember-500 focus:outline-none focus:ring-1 focus:ring-ember-500"
                >
                  <optgroup label="Google Gemini">
                    <option value="gemini-1.5-flash">
                      Gemini 1.5 Flash (Fast & Cheap)
                    </option>
                    <option value="gemini-1.5-pro">
                      Gemini 1.5 Pro (Deep Reasoning)
                    </option>
                    <option value="gemini-2.0-flash">
                      Gemini 2.0 Flash (Next-Gen)
                    </option>
                  </optgroup>
                  <optgroup label="OpenAI">
                    <option value="gpt-4o-mini">
                      GPT-4o Mini (Fast Efficiency)
                    </option>
                    <option value="gpt-4o">GPT-4o (Omni Flagship)</option>
                  </optgroup>
                </select>
              </div>

              {/* Temperature Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="temperature-slider"
                    className="flex items-center gap-1.5 font-mono text-xs font-semibold text-forge-muted"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                    Temperature
                  </label>
                  <span className="font-mono text-xs text-ember-400">
                    {temperature.toFixed(2)}
                    <span className="ml-1 text-[10px] text-forge-subtle">
                      {temperature <= 0.3
                        ? "(Exact)"
                        : temperature <= 0.8
                          ? "(Balanced)"
                          : "(Creative)"}
                    </span>
                  </span>
                </div>
                <input
                  id="temperature-slider"
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="h-2 w-full cursor-pointer accent-ember-500"
                />
              </div>
            </div>

            {/* BYOK & System Prompt Accordion Toggles */}
            <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-forge-border/60 pt-3 text-xs">
              <button
                type="button"
                onClick={() => setShowSystem(!showSystem)}
                className="inline-flex items-center gap-1.5 text-forge-muted transition hover:text-forge-text"
              >
                <Layers className="h-3.5 w-3.5 text-cyan-400" />
                {showSystem ? "Hide System Prompt" : "+ Add System Prompt"}
              </button>

              <span className="text-forge-border">•</span>

              <button
                type="button"
                onClick={() => setShowByok(!showByok)}
                className="inline-flex items-center gap-1.5 text-forge-muted transition hover:text-forge-text"
              >
                <Key className="h-3.5 w-3.5 text-ember-400" />
                {showByok
                  ? "Hide Bring-Your-Own-Key"
                  : byokKey
                    ? "BYOK Configured ✓"
                    : "+ Bring Your Own Key"}
              </button>
            </div>

            {/* Optional BYOK input */}
            {showByok && (
              <div className="mt-3 rounded-lg border border-ember-500/30 bg-ember-500/5 p-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-ember-400">
                    Ephemeral API Key (Header-only, never logged)
                  </span>
                  {byokKey && (
                    <button
                      onClick={() => setByokKey("")}
                      className="text-[11px] text-forge-muted hover:text-rose-400"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  placeholder="Paste your Gemini or OpenAI key (optional)..."
                  value={byokKey}
                  onChange={(e) => setByokKey(e.target.value)}
                  className="mt-2 w-full rounded border border-forge-border bg-forge-950 px-3 py-1.5 font-mono text-xs text-forge-text focus:border-ember-500 focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-forge-subtle">
                  Transmitted securely via{" "}
                  <code className="text-forge-muted">x-provider-key</code>. Not
                  saved to disk or server logs.
                </p>
              </div>
            )}
          </Card>

          {/* System Prompt Input */}
          {showSystem && (
            <div className="space-y-1.5">
              <label className="font-mono text-xs font-medium text-forge-muted">
                System Instructions (Optional)
              </label>
              <textarea
                rows={2}
                value={system}
                onChange={(e) => setSystem(e.target.value)}
                placeholder="You are an expert prompt engineer..."
                className="w-full resize-y rounded-lg border border-forge-border bg-forge-surface px-3 py-2 font-mono text-xs text-forge-text placeholder:text-forge-subtle focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          )}

          {/* Main User Prompt Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-xs font-semibold text-forge-text">
                User Prompt
              </label>
              <span className="font-mono text-[11px] text-forge-subtle">
                {prompt.length.toLocaleString()} characters
              </span>
            </div>
            <textarea
              rows={8}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your prompt here..."
              className="w-full resize-y rounded-xl border border-forge-border bg-forge-surface p-4 font-mono text-sm leading-relaxed text-forge-text placeholder:text-forge-subtle focus:border-ember-500 focus:outline-none focus:ring-2 focus:ring-ember-500/20"
            />
          </div>

          {/* Run Action Bar */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-forge-subtle">
              Press{" "}
              <kbd className="rounded border border-forge-border bg-forge-elevated px-1.5 py-0.5 font-mono text-[10px] text-forge-muted">
                Ctrl
              </kbd>{" "}
              +{" "}
              <kbd className="rounded border border-forge-border bg-forge-elevated px-1.5 py-0.5 font-mono text-[10px] text-forge-muted">
                Enter
              </kbd>{" "}
              to run
            </span>

            <Button
              onClick={handleRun}
              disabled={isLoading || !prompt.trim()}
              className="min-w-[140px] gap-2 font-mono"
            >
              {isLoading ? (
                <>
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  Synthesizing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-forge-950" />
                  Run Prompt
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Column: Execution Output & Metrics (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* Error Banner if any */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-4 text-rose-300 shadow-lg"
            >
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-rose-300">
                      {error.code}
                    </span>
                    {error.retryAfterSeconds && (
                      <Badge variant="destructive" className="text-[10px]">
                        Retry in{" "}
                        {error.retryAfterSeconds >= 60
                          ? `~${Math.ceil(error.retryAfterSeconds / 60)}m`
                          : `${error.retryAfterSeconds}s`}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed">{error.message}</p>
                  {error.code === "MISSING_API_KEY" && (
                    <p className="mt-2 text-[11px] text-rose-200/80">
                      Tip: Click &quot;+ Bring Your Own Key&quot; on the left to
                      test with your own API key.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Result Card */}
          <Card className="relative flex min-h-[460px] flex-col border-forge-border bg-forge-surface/90">
            {/* Card Header & Metrics */}
            <CardHeader className="border-b border-forge-border/80 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm font-semibold text-forge-text">
                    Engine Output
                  </CardTitle>
                  {result?.cached && (
                    <Badge
                      variant="secondary"
                      className="animate-pulse border-cyan-500/40 bg-cyan-500/15 text-cyan-300 shadow-cyan-sm"
                    >
                      <Zap className="mr-1 h-3 w-3 fill-cyan-300" />
                      Cached
                    </Badge>
                  )}
                </div>

                {result?.text && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 gap-1.5 px-2 text-xs text-forge-muted hover:text-forge-text"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Metrics Strip */}
              {result && (
                <div className="mt-3 grid grid-cols-4 gap-2 rounded-lg border border-forge-border bg-forge-950/60 p-2.5 font-mono text-xs">
                  <div>
                    <span className="block text-[10px] text-forge-subtle">
                      Latency
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-forge-text">
                      <Clock className="h-3 w-3 text-cyan-400" />
                      {result.latencyMs < 1
                        ? "< 1 ms"
                        : `${result.latencyMs} ms`}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-forge-subtle">
                      Tokens (In / Out)
                    </span>
                    <span className="font-semibold text-forge-text">
                      {result.tokensIn} / {result.tokensOut}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-forge-subtle">
                      Total Tokens
                    </span>
                    <span className="font-semibold text-forge-text">
                      {result.totalTokens}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] text-forge-subtle">
                      Est. Cost
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-ember-400">
                      <Coins className="h-3 w-3 text-ember-400" />$
                      {result.costEstimateUsd.toFixed(6)}
                    </span>
                  </div>
                </div>
              )}
            </CardHeader>

            {/* Output Text Body */}
            <CardContent className="flex-1 p-6">
              {isLoading && !result ? (
                <div className="flex h-64 flex-col items-center justify-center space-y-3 text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-ember-500 border-t-transparent" />
                  <p className="font-mono text-xs text-forge-muted">
                    Executing prompt across shared backend...
                  </p>
                </div>
              ) : revealedText ? (
                <div className="relative">
                  <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed text-forge-text selection:bg-ember-500/30">
                    {revealedText}
                    {isRevealing && (
                      <span className="inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-ember-400" />
                    )}
                  </pre>
                </div>
              ) : (
                <div className="flex h-64 flex-col items-center justify-center space-y-2 text-center text-forge-subtle">
                  <Cpu className="h-8 w-8 stroke-1 text-forge-border" />
                  <p className="font-mono text-xs">
                    Ready for prompt execution.
                  </p>
                  <p className="text-[11px]">
                    Enter a prompt and click Run to test live inference.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
