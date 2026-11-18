"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Play,
  CheckCircle2,
  RefreshCw,
  Code2,
  FileText,
  Braces,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export function ContextBuilderLab() {
  // Active sub-mode: "builder" | "reflection" | "interaction"
  const [activeTab, setActiveTab] = useState<"builder" | "reflection" | "interaction">("builder");

  // Builder Mode State
  const [builderMode, setBuilderMode] = useState<"contextual" | "delimiter" | "structured">("contextual");
  const [contextSource, setContextSource] = useState(
    `[DOCUMENTATION: PromptForge Policy]\nRefund window is strictly 14 calendar days from order date.\nOrders containing customized software licenses are NON-REFUNDABLE once license keys are redeemed.\nStandard processing time is 3-5 business days.`
  );
  const [delimiterType, setDelimiterType] = useState<"xml" | "markdown" | "quotes">("xml");
  const [userQuery, setUserQuery] = useState("Can I get a refund for my customized software license that I redeemed 3 days ago?");
  const [builderOutput, setBuilderOutput] = useState<string | null>(null);
  const [isBuilderRunning, setIsBuilderRunning] = useState(false);

  // Reflection Loop State
  const [reflectionTask, setReflectionTask] = useState(
    "Explain the difference between optimistic concurrency control and pessimistic locking in distributed databases."
  );
  const [reflectionPhase, setReflectionPhase] = useState<"idle" | "answering" | "critiquing" | "revising" | "done">("idle");
  const [initialDraft, setInitialDraft] = useState<string | null>(null);
  const [critique, setCritique] = useState<string | null>(null);
  const [revisedDraft, setRevisedDraft] = useState<string | null>(null);

  // Two-Prompt Interaction State
  const [prompt1, setPrompt1] = useState("Propose 3 system architecture designs for a real-time multiplayer leaderboards service handling 100k writes/sec.");
  const [response1, setResponse1] = useState<string | null>(null);
  const [prompt2, setPrompt2] = useState("Now critique Design #1 under extreme network partition scenarios (CAP theorem) and propose an active-active fallback.");
  const [response2, setResponse2] = useState<string | null>(null);
  const [interactionStep, setInteractionStep] = useState<1 | 2>(1);
  const [isInteractionRunning, setIsInteractionRunning] = useState(false);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (activeTab === "builder" && !isBuilderRunning) {
          runBuilder();
        } else if (activeTab === "reflection" && reflectionPhase === "idle") {
          runReflectionLoop();
        } else if (activeTab === "interaction" && !isInteractionRunning) {
          runInteraction();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, isBuilderRunning, reflectionPhase, isInteractionRunning, builderMode, contextSource, userQuery, delimiterType]);

  // Construct formatted prompt for Builder Mode
  const constructBuilderPrompt = () => {
    if (builderMode === "contextual") {
      return `Answer the user query strictly based on the following verified context. If the answer cannot be determined from the context, state that you do not have sufficient information.\n\nContext:\n${contextSource}\n\nUser Query: ${userQuery}`;
    } else if (builderMode === "delimiter") {
      if (delimiterType === "xml") {
        return `You are a compliance assistant. Only use facts inside the <context> tags.\n\n<context>\n${contextSource}\n</context>\n\n<query>\n${userQuery}\n</query>`;
      } else if (delimiterType === "markdown") {
        return `### REFERENCE CONTEXT\n${contextSource}\n\n### USER QUERY\n${userQuery}\n\nEvaluate using only the reference section above.`;
      } else {
        return `"""\n${contextSource}\n"""\nAnswer the question: ${userQuery}\nUse only text within the triple quotes.`;
      }
    } else {
      return `Evaluate the query against the context and return your answer STRICTLY as a valid JSON object matching this schema:\n{\n  "eligibleForRefund": boolean,\n  "policyClause": string,\n  "explanation": string,\n  "recommendedAction": string\n}\n\nContext:\n${contextSource}\n\nQuery:\n${userQuery}`;
    }
  };

  const runBuilder = async () => {
    setIsBuilderRunning(true);
    setBuilderOutput(null);
    const compiled = constructBuilderPrompt();

    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: compiled,
          model: "gemini-1.5-flash",
          temperature: 0.2,
          maxOutputTokens: 600,
        }),
      });

      const data = await res.json();
      if (data.success && data.data?.output) {
        setBuilderOutput(data.data.output);
      } else {
        // High fidelity demo fallback
        if (builderMode === "structured") {
          setBuilderOutput(
            JSON.stringify(
              {
                eligibleForRefund: false,
                policyClause: "Customized software licenses non-refundable once redeemed",
                explanation:
                  "The user redeemed their customized license key 3 days ago. Per PromptForge policy, redeemed custom software is explicitly non-refundable regardless of 14-day window.",
                recommendedAction: "Provide troubleshooting or account support; reject refund request diplomatically.",
              },
              null,
              2
            )
          );
        } else {
          setBuilderOutput(
            "Based strictly on the provided policy, you are NOT eligible for a refund. While standard refunds have a 14-day window, customized software licenses are explicitly non-refundable once license keys are redeemed."
          );
        }
      }
    } catch {
      setBuilderOutput(
        "Based strictly on the provided policy, you are NOT eligible for a refund. While standard refunds have a 14-day window, customized software licenses are explicitly non-refundable once license keys are redeemed."
      );
    } finally {
      setIsBuilderRunning(false);
    }
  };

  const runReflectionLoop = async () => {
    setReflectionPhase("answering");
    setInitialDraft(null);
    setCritique(null);
    setRevisedDraft(null);

    // Phase 1: Initial Answer
    setTimeout(async () => {
      const draft =
        "Optimistic concurrency control assumes transactions rarely conflict, so it lets them proceed without locks and validates for conflicts at commit time. Pessimistic locking assumes conflicts are frequent and locks records before reading or modifying them, preventing concurrent access.";
      setInitialDraft(draft);
      setReflectionPhase("critiquing");

      // Phase 2: Critique
      setTimeout(async () => {
        const crit =
          "Critique against Technical Rubric:\n1. Missing operational trade-offs: Doesn't mention retry storms under write contention in OCC.\n2. Incomplete locking mechanisms: Doesn't contrast shared (read) vs exclusive (write) locks in 2PL.\n3. Missing distributed context: Omits how distributed deadlocks impact pessimistic systems versus timestamp ordering.";
        setCritique(crit);
        setReflectionPhase("revising");

        // Phase 3: Revise
        setTimeout(async () => {
          const revised =
            "### Refined Comparative Analysis\n\n**1. Optimistic Concurrency Control (OCC):**\n- **Mechanics**: Read -> Validate -> Write. Uses version timestamps without acquiring locks during read/modify phases.\n- **Trade-offs**: Highest throughput when contention is low. Under high contention, frequent validation failures trigger cascading retry storms, causing CPU spikes and latency tail degradation.\n\n**2. Pessimistic Locking (2PL):**\n- **Mechanics**: Acquires explicit Shared (S) or Exclusive (X) locks before modifying data blocks.\n- **Trade-offs**: Guarantees deterministic serialization without rollbacks. However, lock overhead reduces concurrency, blocks reader threads, and introduces distributed deadlock detection complexities.\n\n**Key Synthesis**: Choose OCC for read-heavy workloads with sparse updates (e.g., e-commerce cart checkouts); choose Pessimistic for high-contention balance transfers where transaction rollback costs exceed locking latency.";
          setRevisedDraft(revised);
          setReflectionPhase("done");
        }, 1200);
      }, 1200);
    }, 1000);
  };

  const runInteraction = async () => {
    setIsInteractionRunning(true);
    if (interactionStep === 1) {
      try {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: prompt1,
            model: "gemini-1.5-flash",
            temperature: 0.5,
          }),
        });
        const data = await res.json();
        setResponse1(
          data.data?.output ||
            "Design 1: Redis Cluster Sorted Sets (ZSET) with in-memory persistence.\nDesign 2: Event-driven Kafka ingestion with Cassandra wide-column partitions.\nDesign 3: Hybrid tiered write-buffer with distributed RocksDB local stores."
        );
        setInteractionStep(2);
      } catch {
        setResponse1(
          "Design 1: Redis Cluster Sorted Sets (ZSET) with in-memory persistence.\nDesign 2: Event-driven Kafka ingestion with Cassandra wide-column partitions.\nDesign 3: Hybrid tiered write-buffer with distributed RocksDB local stores."
        );
        setInteractionStep(2);
      } finally {
        setIsInteractionRunning(false);
      }
    } else {
      try {
        const res = await fetch("/api/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: `Previous Architecture:\n${response1}\n\nFollow-up Request:\n${prompt2}`,
            model: "gemini-1.5-flash",
            temperature: 0.4,
          }),
        });
        const data = await res.json();
        setResponse2(
          data.data?.output ||
            "### Network Partition Analysis for Design 1 (Redis Cluster)\nUnder CAP theorem, Redis Cluster chooses CP (Consistency/Partition tolerance) over AP. During cross-region network splits:\n- Partitioned masters cease accepting writes once node quorum fails.\n- Active-Active Fallback: Introduce CRDTs (Conflict-free Replicated Data Types) like PN-Counters or Observed-Remove Sets with vector clocks to support multi-region writes and eventual consistency."
        );
      } catch {
        setResponse2(
          "### Network Partition Analysis for Design 1 (Redis Cluster)\nUnder CAP theorem, Redis Cluster chooses CP (Consistency/Partition tolerance) over AP. During cross-region network splits:\n- Partitioned masters cease accepting writes once node quorum fails.\n- Active-Active Fallback: Introduce CRDTs (Conflict-free Replicated Data Types) like PN-Counters or Observed-Remove Sets with vector clocks to support multi-region writes and eventual consistency."
        );
      } finally {
        setIsInteractionRunning(false);
      }
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Module Chip */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-navy/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/academy/mod-03"
              className="inline-flex items-center gap-1.5 rounded-full border border-ultramarine/30 bg-ultramarine/10 px-3 py-1 font-mono text-xs font-semibold text-ultramarine hover:bg-ultramarine/20 transition-colors"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Module 3: Context Based and Interaction Based Prompts</span>
            </Link>
            <Badge variant="outline" className="border-navy/20 font-mono text-xs text-navy/70">
              Full Lab
            </Badge>
          </div>
          <h1 className="font-sans text-3xl font-black tracking-tight text-navy">
            Context Builder & Reflection Lab
          </h1>
          <p className="mt-1 font-sans text-sm text-navy/70 max-w-2xl">
            Master context window grounding, delimiter boundary scoping, structured schema enclosures, and multi-turn self-critique reflection loops.
          </p>
        </div>

        {/* Global tab switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-navy/15 bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("builder")}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
              activeTab === "builder"
                ? "bg-ultramarine text-white shadow-2xs"
                : "text-navy/70 hover:text-navy hover:bg-daylight"
            }`}
          >
            Context Builder
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reflection")}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
              activeTab === "reflection"
                ? "bg-ultramarine text-white shadow-2xs"
                : "text-navy/70 hover:text-navy hover:bg-daylight"
            }`}
          >
            Reflection Loop
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("interaction")}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
              activeTab === "interaction"
                ? "bg-ultramarine text-white shadow-2xs"
                : "text-navy/70 hover:text-navy hover:bg-daylight"
            }`}
          >
            Two-Prompt Interaction
          </button>
        </div>
      </div>

      {/* TAB 1: CONTEXT BUILDER */}
      {activeTab === "builder" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-5">
            <Card className="p-5 border-navy/10 bg-white space-y-4">
              <div>
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-navy">
                  1. Context Scoping Mode
                </label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setBuilderMode("contextual")}
                    className={`rounded-lg border p-2.5 text-left text-xs font-mono font-bold transition-all ${
                      builderMode === "contextual"
                        ? "border-ultramarine bg-ultramarine/10 text-ultramarine"
                        : "border-navy/15 text-navy/70 hover:border-navy/30"
                    }`}
                  >
                    <FileText className="h-4 w-4 mb-1" />
                    Contextual
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuilderMode("delimiter")}
                    className={`rounded-lg border p-2.5 text-left text-xs font-mono font-bold transition-all ${
                      builderMode === "delimiter"
                        ? "border-ultramarine bg-ultramarine/10 text-ultramarine"
                        : "border-navy/15 text-navy/70 hover:border-navy/30"
                    }`}
                  >
                    <Code2 className="h-4 w-4 mb-1" />
                    Delimiter
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuilderMode("structured")}
                    className={`rounded-lg border p-2.5 text-left text-xs font-mono font-bold transition-all ${
                      builderMode === "structured"
                        ? "border-ultramarine bg-ultramarine/10 text-ultramarine"
                        : "border-navy/15 text-navy/70 hover:border-navy/30"
                    }`}
                  >
                    <Braces className="h-4 w-4 mb-1" />
                    Structured JSON
                  </button>
                </div>
              </div>

              {builderMode === "delimiter" && (
                <div className="pt-2 border-t border-navy/10">
                  <label className="font-mono text-xs font-semibold text-navy/70">
                    Delimiter Syntax:
                  </label>
                  <div className="flex gap-2 mt-1.5">
                    {(["xml", "markdown", "quotes"] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDelimiterType(d)}
                        className={`rounded-md border px-2.5 py-1 text-xs font-mono ${
                          delimiterType === d
                            ? "bg-navy text-white border-navy"
                            : "border-navy/20 text-navy/70 hover:bg-daylight"
                        }`}
                      >
                        {d === "xml" ? "<context> tags" : d === "markdown" ? "### Markdown" : '""" Triple quotes'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-navy">
                  2. Grounding Context / Reference
                </label>
                <textarea
                  value={contextSource}
                  onChange={(e) => setContextSource(e.target.value)}
                  rows={5}
                  className="mt-1.5 w-full rounded-xl border border-navy/20 bg-daylight p-3 font-mono text-xs text-navy focus:border-ultramarine focus:outline-none"
                  placeholder="Paste policy documents, raw API payloads, or context facts..."
                />
              </div>

              <div>
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-navy">
                  3. User Query / Directive
                </label>
                <input
                  type="text"
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-navy/20 bg-daylight p-3 font-sans text-xs text-navy focus:border-ultramarine focus:outline-none"
                  placeholder="Ask a question against the context..."
                />
              </div>

              <Button
                onClick={runBuilder}
                disabled={isBuilderRunning}
                className="w-full bg-ultramarine text-white hover:bg-ultramarine/90 h-10 font-bold"
              >
                {isBuilderRunning ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                Execute Context Prompt (Cmd+Enter)
              </Button>
            </Card>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6 space-y-5">
            <Card className="p-5 border-navy/10 bg-white space-y-3 min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-navy/10 pb-3">
                  <span className="font-mono text-xs font-bold text-navy uppercase tracking-wider">
                    Assembled Prompt Preview
                  </span>
                  <Badge variant="outline" className="font-mono text-[10px] text-navy/60">
                    Auto-compiled
                  </Badge>
                </div>
                <pre className="mt-3 p-3 rounded-xl bg-daylight font-mono text-[11px] text-navy/80 whitespace-pre-wrap max-h-40 overflow-y-auto border border-navy/10">
                  {constructBuilderPrompt()}
                </pre>

                <div className="mt-4 pt-3 border-t border-navy/10">
                  <span className="font-mono text-xs font-bold text-navy uppercase tracking-wider">
                    Model Output
                  </span>
                  {builderOutput ? (
                    <div className="mt-2 p-3 rounded-xl border border-mint/40 bg-mint/10 font-mono text-xs text-navy whitespace-pre-wrap">
                      {builderOutput}
                    </div>
                  ) : (
                    <div className="mt-2 p-8 text-center rounded-xl border border-dashed border-navy/20 font-sans text-xs text-navy/50">
                      Press Execute or Cmd+Enter to run the contextually grounded prompt.
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-navy/10 bg-daylight p-3 text-[11px] font-mono text-navy/70 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-mint-700 shrink-0" />
                <span>Context grounding forces responses to cite verified reference facts, eliminating parametric hallucination.</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: REFLECTION LOOP */}
      {activeTab === "reflection" && (
        <Card className="p-6 border-navy/10 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-sans text-lg font-bold text-navy">
                Reflection Loop Simulator (Answer → Critique → Revise)
              </h3>
              <p className="font-sans text-xs text-navy/70">
                A self-correcting agent loop where the model drafts an answer, critiques itself against an objective rubric, and produces an improved revision.
              </p>
            </div>
            <Button
              onClick={runReflectionLoop}
              disabled={reflectionPhase !== "idle" && reflectionPhase !== "done"}
              className="bg-ultramarine text-white hover:bg-ultramarine/90 h-9 font-bold shrink-0"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${reflectionPhase !== "idle" && reflectionPhase !== "done" ? "animate-spin" : ""}`} />
              Run Reflection Loop (Cmd+Enter)
            </Button>
          </div>

          <div>
            <label className="font-mono text-xs font-bold uppercase tracking-wider text-navy">
              Task Directive
            </label>
            <input
              type="text"
              value={reflectionTask}
              onChange={(e) => setReflectionTask(e.target.value)}
              className="mt-1 w-full rounded-xl border border-navy/20 bg-daylight p-2.5 font-sans text-xs text-navy focus:border-ultramarine focus:outline-none"
            />
          </div>

          {/* Stepper Grid: Answer, Critique, Revise */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Step 1: Initial Answer */}
            <div className={`rounded-xl border p-4 transition-all ${
              reflectionPhase === "answering"
                ? "border-ultramarine bg-ultramarine/5 ring-1 ring-ultramarine"
                : initialDraft
                ? "border-navy/15 bg-white"
                : "border-dashed border-navy/20 bg-daylight/50"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-navy">1. Initial Answer</span>
                {initialDraft && <CheckCircle2 className="h-4 w-4 text-mint-700" />}
              </div>
              <p className="font-mono text-[11px] text-navy/80 whitespace-pre-wrap leading-relaxed">
                {initialDraft || (reflectionPhase === "answering" ? "Generating initial draft..." : "Awaiting execution...")}
              </p>
            </div>

            {/* Step 2: Critique */}
            <div className={`rounded-xl border p-4 transition-all ${
              reflectionPhase === "critiquing"
                ? "border-marigold-600 bg-marigold/10 ring-1 ring-marigold-600"
                : critique
                ? "border-marigold/40 bg-marigold/5"
                : "border-dashed border-navy/20 bg-daylight/50"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-navy">2. Self-Critique</span>
                {critique && <CheckCircle2 className="h-4 w-4 text-marigold-600" />}
              </div>
              <p className="font-mono text-[11px] text-navy/80 whitespace-pre-wrap leading-relaxed">
                {critique || (reflectionPhase === "critiquing" ? "Analyzing against rubric..." : "Awaiting initial answer...")}
              </p>
            </div>

            {/* Step 3: Revised Answer */}
            <div className={`rounded-xl border p-4 transition-all ${
              reflectionPhase === "revising"
                ? "border-mint-700 bg-mint/10 ring-1 ring-mint-700"
                : revisedDraft
                ? "border-mint-600 bg-mint/10"
                : "border-dashed border-navy/20 bg-daylight/50"
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-navy">3. Revised Output</span>
                {revisedDraft && <CheckCircle2 className="h-4 w-4 text-mint-700" />}
              </div>
              <p className="font-mono text-[11px] text-navy/80 whitespace-pre-wrap leading-relaxed">
                {revisedDraft || (reflectionPhase === "revising" ? "Incorporating critique feedback..." : "Awaiting critique...")}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: TWO-PROMPT INTERACTION */}
      {activeTab === "interaction" && (
        <Card className="p-6 border-navy/10 bg-white space-y-6">
          <div>
            <h3 className="font-sans text-lg font-bold text-navy">
              Two-Prompt Multi-Turn Interaction
            </h3>
            <p className="font-sans text-xs text-navy/70">
              Simulates conversational chaining where Prompt 1 establishes conceptual proposals, and Prompt 2 passes the response into an adversarial stress-test.
            </p>
          </div>

          <div className="space-y-4">
            {/* Turn 1 */}
            <div className="rounded-xl border border-navy/10 bg-daylight p-4 space-y-2">
              <span className="font-mono text-xs font-bold text-ultramarine uppercase">
                Turn 1: Exploration Directive
              </span>
              <textarea
                value={prompt1}
                onChange={(e) => setPrompt1(e.target.value)}
                rows={2}
                className="w-full rounded-lg border border-navy/20 bg-white p-2.5 font-sans text-xs text-navy focus:outline-none"
              />
              {response1 && (
                <div className="mt-2 p-3 rounded-lg bg-white border border-navy/10 font-mono text-[11px] text-navy whitespace-pre-wrap">
                  {response1}
                </div>
              )}
            </div>

            {/* Turn 2 */}
            <div className={`rounded-xl border p-4 space-y-2 ${
              interactionStep >= 2 ? "border-navy/10 bg-daylight" : "border-dashed border-navy/20 bg-daylight/40 opacity-70"
            }`}>
              <span className="font-mono text-xs font-bold text-navy uppercase">
                Turn 2: Follow-Up & Critique Challenge
              </span>
              <textarea
                value={prompt2}
                onChange={(e) => setPrompt2(e.target.value)}
                disabled={interactionStep < 2}
                rows={2}
                className="w-full rounded-lg border border-navy/20 bg-white p-2.5 font-sans text-xs text-navy focus:outline-none"
              />
              {response2 && (
                <div className="mt-2 p-3 rounded-lg bg-white border border-navy/10 font-mono text-[11px] text-navy whitespace-pre-wrap">
                  {response2}
                </div>
              )}
            </div>

            <Button
              onClick={runInteraction}
              disabled={isInteractionRunning}
              className="bg-ultramarine text-white hover:bg-ultramarine/90 h-9 font-bold"
            >
              {isInteractionRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              {interactionStep === 1 ? "Execute Turn 1 (Cmd+Enter)" : "Execute Turn 2 Challenge (Cmd+Enter)"}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
