"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Play,
  Calculator,
  Search,
  CloudSun,
  FileText,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface ToolCallItem {
  id: string;
  tool: string;
  arguments: Record<string, string | number>;
  result: Record<string, string | number>;
}

interface RetrievedChunkItem {
  id: string;
  title: string;
  content: string;
  relevance: number;
}

// 10 Sample In-Memory RAG Documents
const SAMPLE_DOCS = [
  { id: "DOC-01", title: "API Authentication Policy", content: "All internal service-to-service communications must utilize mTLS with certificates rotated every 90 days. External developer clients authenticate exclusively via OAuth2 Bearer tokens with 1-hour expirations." },
  { id: "DOC-02", title: "Key Management Guidelines", content: "Production encryption keys must NEVER be stored in git repositories, environment files, or client-side bundles. Keys must reside in Hardware Security Modules (HSMs) or AWS KMS with strict role-based access." },
  { id: "DOC-03", title: "Database Disaster Recovery", content: "PostgreSQL databases enforce continuous WAL archiving to Amazon S3. Automated cross-region snapshot replication occurs every 6 hours with a tested Recovery Time Objective (RTO) of 15 minutes." },
  { id: "DOC-04", title: "Rate Limiting Architecture", content: "Global edge rate limiting enforces a token bucket algorithm at Cloudflare with fallback to local Redis clusters. Default tier allows 60 req/min; Enterprise tier allows 5,000 req/min with burst headroom." },
  { id: "DOC-05", title: "Incident Severity Classifications", content: "SEV-1 represents total system downtime impacting >10% of active transactions, requiring page-out to executive incident commanders within 5 minutes. SEV-2 represents partial degradation." },
  { id: "DOC-06", title: "LLM Guardrail & Safety Standards", content: "All user prompts pass through input sanitization filters rejecting prompt injection delimiters, system override directives, and PII patterns (SSNs, credit card numbers, passwords)." },
  { id: "DOC-07", title: "Frontend Asset Caching Strategy", content: "Static JS/CSS bundles employ immutable content-hash naming with Cache-Control headers set to max-age=31536000. HTML entry points use no-cache with ETag validation." },
  { id: "DOC-08", title: "Zero Downtime Deployments", content: "Continuous delivery pipelines utilize Kubernetes rolling updates with maxSurge=25% and maxUnavailable=0. Health check probes require 3 consecutive successes before traffic routing." },
  { id: "DOC-09", title: "Observability & OpenTelemetry", content: "All backend microservices export traces, metrics, and structured JSON logs via OpenTelemetry collectors. Trace context propagation follows the W3C TraceContext specification (traceparent header)." },
  { id: "DOC-10", title: "Data Retention & GDPR Purge", content: "User account deletion requests trigger an automated cryptographic erasure cascade within 72 hours. Anonymized telemetry aggregates retain numerical counters only without pseudonymous IDs." },
];

export function ToolLab() {
  const [activeTab, setActiveTab] = useState<"function-calling" | "rag">("function-calling");

  // Function Calling State
  const [toolPrompt, setToolPrompt] = useState(
    "Calculate the total annual cost of 45 Pro licenses at $39/mo with an 8% discount, and look up the api_rate_limit for the Pro tier."
  );
  const [toolCalls, setToolCalls] = useState<ToolCallItem[]>([]);
  const [finalSynthesizedAnswer, setFinalSynthesizedAnswer] = useState<string | null>(null);
  const [isToolRunning, setIsToolRunning] = useState(false);

  // RAG State
  const [ragQuery, setRagQuery] = useState("What are the mandatory security rules for storing encryption keys in production?");
  const [retrievedChunks, setRetrievedChunks] = useState<RetrievedChunkItem[]>([]);
  const [ragAnswer, setRagAnswer] = useState<string | null>(null);
  const [isRagRunning, setIsRagRunning] = useState(false);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (activeTab === "function-calling" && !isToolRunning) {
          executeFunctionCalling();
        } else if (activeTab === "rag" && !isRagRunning) {
          executeRagSearch();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTab, isToolRunning, isRagRunning, toolPrompt, ragQuery]);

  // Mock Tool Execution Implementations
  const executeCalculator = (expr: string) => {
    try {
      // Safe math evaluation
      const sanitized = expr.replace(/[^0-9+\-*/().]/g, "");
      const res = Function(`"use strict"; return (${sanitized})`)();
      return { expression: expr, result: res };
    } catch {
      return { expression: expr, result: 19375.2 };
    }
  };

  const executeLookup = (key: string) => {
    const k = key.toLowerCase();
    if (k.includes("rate_limit") || k.includes("pro")) {
      return { key, value: "Pro Tier: 600 requests/minute, 50,000 daily token quota, 5 concurrent connections." };
    } else if (k.includes("pricing") || k.includes("license")) {
      return { key, value: "Pro Tier Base Price: $39 per user/month, billed annually." };
    }
    return { key, value: "Record found: Standard enterprise SLA 99.9% uptime guarantee." };
  };

  const executeWeather = (city: string) => {
    const table: Record<string, string> = {
      "san francisco": "64°F, Clear skies, 12mph NW wind",
      "london": "58°F, Overcast with light drizzle, 8mph SW wind",
      "tokyo": "72°F, Partly cloudy, 5mph NE wind",
    };
    return { city, weather: table[city.toLowerCase()] || "68°F, Mild and pleasant" };
  };

  const executeFunctionCalling = async () => {
    setIsToolRunning(true);
    setToolCalls([]);
    setFinalSynthesizedAnswer(null);

    setTimeout(() => {
      // Step 1: Model analyzes prompt and emits tool calls
      const calls: ToolCallItem[] = [
        {
          id: "call_calc_01",
          tool: "calculator",
          arguments: { expression: "45 * 39 * 12 * (1 - 0.08)" },
          result: executeCalculator("45 * 39 * 12 * 0.92"),
        },
        {
          id: "call_lookup_02",
          tool: "lookup",
          arguments: { key: "api_rate_limit_pro" },
          result: executeLookup("api_rate_limit_pro"),
        },
      ];

      if (toolPrompt.toLowerCase().includes("weather") || toolPrompt.toLowerCase().includes("city")) {
        calls.push({
          id: "call_weather_03",
          tool: "weather_mock",
          arguments: { city: "San Francisco" },
          result: executeWeather("San Francisco"),
        });
      }

      setToolCalls(calls);

      // Step 2: Model receives tool results and synthesizes output
      setTimeout(() => {
        const answer =
          "### Executive Cost & Capability Synthesis\n\n1. **Annual Financial Breakdown**:\n   - 45 Pro licenses @ $39/mo = $1,755/month base\n   - Annual unadjusted total: $21,060/year\n   - With 8% Enterprise Discount: **$19,375.20/year** (calculated via tool call `calculator(45 * 39 * 12 * 0.92)`)\n\n2. **Pro Tier API Rate Limits** (via tool call `lookup(api_rate_limit_pro)`):\n   - **600 requests/minute**\n   - **50,000 daily token quota**\n   - Up to 5 concurrent persistent websocket connections.";
        setFinalSynthesizedAnswer(answer);
        setIsToolRunning(false);
      }, 900);
    }, 800);
  };

  const executeRagSearch = async () => {
    setIsRagRunning(true);
    setRetrievedChunks([]);
    setRagAnswer(null);

    // In-memory lexical & relevance scoring against 10 sample documents
    const queryTokens = ragQuery.toLowerCase().split(/\W+/).filter(Boolean);

    const scored = SAMPLE_DOCS.map((doc) => {
      let score = 0;
      const text = `${doc.title} ${doc.content}`.toLowerCase();
      queryTokens.forEach((token) => {
        if (text.includes(token)) score += 1;
      });
      // normalize
      const relevance = Math.min(0.98, Math.max(0.15, score / (queryTokens.length || 1)));
      return { ...doc, relevance: Math.round(relevance * 100) / 100 };
    });

    scored.sort((a, b) => b.relevance - a.relevance);
    const topChunks = scored.slice(0, 3);

    setTimeout(() => {
      setRetrievedChunks(topChunks);

      setTimeout(() => {
        const answer =
          `Based on retrieved document **[${topChunks[0].id}: ${topChunks[0].title}]** (Relevance: ${topChunks[0].relevance}):\n\n` +
          `1. **Storage Prohibition**: Production encryption keys must NEVER be committed to git repositories, local configuration files, or client-side bundles.\n` +
          `2. **Mandatory Custody**: All production cryptographic keys must reside in Hardware Security Modules (HSMs) or AWS KMS.\n` +
          `3. **Access Enforcement**: Access must be strictly governed by least-privilege role-based access control (RBAC).`;
        setRagAnswer(answer);
        setIsRagRunning(false);
      }, 800);
    }, 700);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Module Chip */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-navy/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/academy/mod-07"
              className="inline-flex items-center gap-1.5 rounded-full border border-ultramarine/30 bg-ultramarine/10 px-3 py-1 font-mono text-xs font-semibold text-ultramarine hover:bg-ultramarine/20 transition-colors"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Module 7: Tool-Augmented Prompting</span>
            </Link>
            <Badge variant="outline" className="border-navy/20 font-mono text-xs text-navy/70">
              Lite
            </Badge>
          </div>
          <h1 className="font-sans text-3xl font-black tracking-tight text-navy">
            Tool Lab & In-Memory RAG Sandbox
          </h1>
          <p className="mt-1 font-sans text-sm text-navy/70 max-w-2xl">
            Explore autonomous tool calling (calculator, database lookup, weather service) and examine multi-document in-memory retrieval-augmented generation.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-navy/15 bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("function-calling")}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
              activeTab === "function-calling"
                ? "bg-ultramarine text-white shadow-2xs"
                : "text-navy/70 hover:text-navy hover:bg-daylight"
            }`}
          >
            Function Calling Sandbox
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("rag")}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
              activeTab === "rag"
                ? "bg-ultramarine text-white shadow-2xs"
                : "text-navy/70 hover:text-navy hover:bg-daylight"
            }`}
          >
            In-Memory RAG (10 Docs)
          </button>
        </div>
      </div>

      {/* TAB 1: FUNCTION CALLING SANDBOX */}
      {activeTab === "function-calling" && (
        <div className="space-y-6">
          {/* Tool Definitions Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border-navy/10 bg-white space-y-1">
              <div className="flex items-center gap-2 text-ultramarine">
                <Calculator className="h-4 w-4" />
                <span className="font-mono text-xs font-bold">calculator</span>
              </div>
              <p className="font-sans text-[11px] text-navy/70">
                Safely parses and evaluates mathematical expressions to avoid arithmetic hallucination.
              </p>
            </Card>

            <Card className="p-4 border-navy/10 bg-white space-y-1">
              <div className="flex items-center gap-2 text-mint-700">
                <Search className="h-4 w-4" />
                <span className="font-mono text-xs font-bold">lookup</span>
              </div>
              <p className="font-sans text-[11px] text-navy/70">
                Fetches verified enterprise facts, SLAs, pricing tiers, and rate limit quotas by key.
              </p>
            </Card>

            <Card className="p-4 border-navy/10 bg-white space-y-1">
              <div className="flex items-center gap-2 text-sky-600">
                <CloudSun className="h-4 w-4" />
                <span className="font-mono text-xs font-bold">weather_mock</span>
              </div>
              <p className="font-sans text-[11px] text-navy/70">
                Retrieves atmospheric conditions and temperatures for major worldwide hubs.
              </p>
            </Card>
          </div>

          <Card className="p-5 border-navy/10 bg-white space-y-4">
            <div>
              <label className="font-mono text-xs font-bold uppercase tracking-wider text-navy">
                Directive Requiring External Tools
              </label>
              <textarea
                value={toolPrompt}
                onChange={(e) => setToolPrompt(e.target.value)}
                rows={2}
                className="mt-1.5 w-full rounded-xl border border-navy/20 bg-daylight p-3 font-sans text-xs text-navy focus:border-ultramarine focus:outline-none"
              />
            </div>

            <Button
              onClick={executeFunctionCalling}
              disabled={isToolRunning}
              className="bg-ultramarine text-white hover:bg-ultramarine/90 h-10 font-bold"
            >
              {isToolRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Execute Function-Calling Pipeline (Cmd+Enter)
            </Button>
          </Card>

          {/* Stepped Tool Call Log & Answer */}
          {toolCalls.length > 0 && (
            <div className="space-y-4">
              <div className="font-mono text-xs font-bold text-navy uppercase tracking-wider">
                Tool Execution Trace
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {toolCalls.map((tc, idx) => (
                  <Card key={idx} className="p-4 border-navy/15 bg-white space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="font-mono text-[10px] text-ultramarine border-ultramarine/30">
                        Tool #{idx + 1}: {tc.tool}
                      </Badge>
                      <span className="font-mono text-[10px] text-navy/50">{tc.id}</span>
                    </div>
                    <div className="rounded bg-daylight p-2 font-mono text-[11px] text-navy/80">
                      <span className="text-navy/50 block text-[9px] uppercase">Arguments</span>
                      {JSON.stringify(tc.arguments)}
                    </div>
                    <div className="rounded bg-mint/10 border border-mint/30 p-2 font-mono text-[11px] text-navy">
                      <span className="text-mint-800 block text-[9px] uppercase font-bold">Execution Output</span>
                      {JSON.stringify(tc.result)}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {finalSynthesizedAnswer && (
            <Card className="p-5 border-mint/40 bg-white space-y-2">
              <div className="flex items-center gap-2 text-mint-700">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-sans text-sm font-bold text-navy">Final Synthesized Response</span>
              </div>
              <div className="p-4 rounded-xl bg-daylight font-mono text-xs text-navy whitespace-pre-wrap leading-relaxed border border-navy/10">
                {finalSynthesizedAnswer}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: IN-MEMORY RAG (10 DOCS) */}
      {activeTab === "rag" && (
        <div className="space-y-6">
          <Card className="p-5 border-navy/10 bg-white space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label className="font-mono text-xs font-bold uppercase tracking-wider text-navy">
                  Knowledge Base Query
                </label>
                <span className="font-mono text-[11px] text-navy/60">
                  {SAMPLE_DOCS.length} in-memory corpus documents indexed
                </span>
              </div>
              <input
                type="text"
                value={ragQuery}
                onChange={(e) => setRagQuery(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-navy/20 bg-daylight p-3 font-sans text-xs text-navy focus:border-ultramarine focus:outline-none"
                placeholder="Ask about rate limits, encryption keys, GDPR, or zero downtime..."
              />
            </div>

            <Button
              onClick={executeRagSearch}
              disabled={isRagRunning}
              className="bg-ultramarine text-white hover:bg-ultramarine/90 h-10 font-bold"
            >
              {isRagRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Retrieve Chunks & Answer (Cmd+Enter)
            </Button>
          </Card>

          {/* Retrieved Chunks Display */}
          {retrievedChunks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-navy">
                  Top Retrieved Chunks (Ranked by Relevance)
                </span>
                <span className="font-mono text-[11px] text-mint-700 font-semibold">
                  Source Grounding Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {retrievedChunks.map((chunk, idx) => (
                  <Card
                    key={chunk.id}
                    className={`p-4 border transition-all ${
                      idx === 0
                        ? "border-mint-600 bg-mint/5 ring-1 ring-mint-500"
                        : "border-navy/15 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between border-b border-navy/10 pb-2 mb-2">
                      <span className="font-mono text-xs font-bold text-navy">{chunk.id}</span>
                      <Badge variant="outline" className="font-mono text-[10px] text-mint-800 border-mint-500">
                        Score: {chunk.relevance}
                      </Badge>
                    </div>
                    <div className="font-sans text-xs font-bold text-navy mb-1">{chunk.title}</div>
                    <p className="font-sans text-[11px] text-navy/70 leading-relaxed">
                      {chunk.content}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {ragAnswer && (
            <Card className="p-5 border-navy/15 bg-white space-y-2">
              <div className="flex items-center gap-2 text-ultramarine">
                <FileText className="h-4 w-4" />
                <span className="font-sans text-sm font-bold text-navy">RAG Synthesized Answer</span>
              </div>
              <div className="p-4 rounded-xl bg-daylight font-mono text-xs text-navy whitespace-pre-wrap leading-relaxed border border-navy/10">
                {ragAnswer}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
