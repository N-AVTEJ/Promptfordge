"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Layers,
  Network,
  CheckCircle2,
  Server,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { CURRICULUM_MODULES } from "@/content/modules";

export function AgentLab() {
  const [activeTab, setActiveTab] = useState<"loop" | "meter" | "mcp">("loop");

  // Agent Loop State
  const [currentLoopStep, setCurrentLoopStep] = useState<number>(0);
  const [isLoopAutoPlaying, setIsLoopAutoPlaying] = useState(false);

  const loopSteps = [
    {
      phase: "Plan",
      title: "Decompose Objective & Select Tool",
      description: "Model analyzes user request 'Verify database replication lag and alert PagerDuty if > 60s'. Determines it needs to query postgres_status first.",
      code: `{ "thought": "I need to check the current replication lag before deciding whether an alert is warranted.", "action": "postgres_status", "action_input": { "cluster": "production-us-east-1" } }`,
      badgeColor: "bg-marigold text-navy",
    },
    {
      phase: "Act",
      title: "Execute Tool Invocation",
      description: "Agent dispatches JSON-RPC payload to local database agent executor.",
      code: `POST /tools/call\n{\n  "tool": "postgres_status",\n  "cluster": "production-us-east-1"\n}\n\n-> Response (200 OK): { "replication_lag_seconds": 142.8, "replay_queue_depth": 1840 }`,
      badgeColor: "bg-mint-500 text-navy font-bold",
    },
    {
      phase: "Observe",
      title: "Evaluate Tool Response Against Thresholds",
      description: "Agent ingests observation: replication lag is 142.8s, strictly exceeding the 60s alert threshold. Formulates plan to trigger incident alert.",
      code: `{ "observation": "Replication lag is 142.8 seconds, exceeding 60s threshold.", "next_action": "pagerduty_alert", "severity": "HIGH" }`,
      badgeColor: "bg-sky-500 text-navy font-bold",
    },
    {
      phase: "Act (Turn 2)",
      title: "Trigger Alert Action",
      description: "Agent dispatches notification to on-call engineering rotations.",
      code: `POST /tools/call\n{\n  "tool": "pagerduty_alert",\n  "title": "Postgres replication lag exceeded (142.8s)",\n  "urgency": "high"\n}\n\n-> Response: { "incident_id": "INC-99042", "status": "triggered" }`,
      badgeColor: "bg-rose-500 text-navy font-bold",
    },
    {
      phase: "Final Synthesis",
      title: "Emit Verified Resolution to User",
      description: "Agent summarizes completed actions and returns immutable incident link.",
      code: `Objective fulfilled: Verified replication lag (142.8s > 60s). High-urgency PagerDuty incident INC-99042 has been dispatched to the Infrastructure rotation.`,
      badgeColor: "bg-ultramarine text-white",
    },
  ];

  // Context Window Meter State
  const [contextLimit, setContextLimit] = useState<number>(32768); // 32k
  const [historyTurnCount, setHistoryTurnCount] = useState<number>(8);
  const [includeLargeRAG, setIncludeLargeRAG] = useState<boolean>(true);

  // Calculated token allocation
  const systemPromptTokens = 850;
  const toolDefinitionsTokens = 1450;
  const historyTokens = historyTurnCount * 420;
  const scratchpadTokens = includeLargeRAG ? 7500 : 1200;
  const totalUsedTokens = systemPromptTokens + toolDefinitionsTokens + historyTokens + scratchpadTokens;
  const usedPercent = Math.min(100, Math.round((totalUsedTokens / contextLimit) * 100));

  // MCP Explorer State
  const [mcpAction, setMcpAction] = useState<"list_tools" | "call_tool" | "read_resource">("list_tools");

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoopAutoPlaying) {
      timer = setInterval(() => {
        setCurrentLoopStep((prev) => {
          if (prev >= loopSteps.length - 1) {
            setIsLoopAutoPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1800);
    }
    return () => clearInterval(timer);
  }, [isLoopAutoPlaying, loopSteps.length]);

  // Keyboard shortcut listener (Cmd / Ctrl + Enter toggles Agent execution loop)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        setIsLoopAutoPlaying((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Module Chip */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-navy/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/academy/mod-11"
              className="inline-flex items-center gap-1.5 rounded-full border border-ultramarine/30 bg-ultramarine/10 px-3 py-1 font-mono text-xs font-semibold text-ultramarine hover:bg-ultramarine/20 transition-colors"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>Module 11: {CURRICULUM_MODULES.find((m) => m.number === 11)?.title}</span>
            </Link>
            <Badge variant="outline" className="border-navy/20 font-mono text-xs text-navy/70">
              Lite
            </Badge>
          </div>
          <h1 className="font-sans text-3xl font-black tracking-tight text-navy">
            AI Agent & Context Engineering Lab
          </h1>
          <p className="mt-1 font-sans text-sm text-navy/70 max-w-2xl">
            Interactive simulator for autonomous agent loops (Plan-Act-Observe), real-time token context window budgeting, and Model Context Protocol (MCP) host-client-server topology.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 rounded-xl border border-navy/15 bg-white p-1 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab("loop")}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
              activeTab === "loop"
                ? "bg-ultramarine text-white shadow-2xs"
                : "text-navy/70 hover:text-navy hover:bg-daylight"
            }`}
          >
            Agent Loop
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("meter")}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
              activeTab === "meter"
                ? "bg-ultramarine text-white shadow-2xs"
                : "text-navy/70 hover:text-navy hover:bg-daylight"
            }`}
          >
            Context Window Meter
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("mcp")}
            className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
              activeTab === "mcp"
                ? "bg-ultramarine text-white shadow-2xs"
                : "text-navy/70 hover:text-navy hover:bg-daylight"
            }`}
          >
            MCP Explorer
          </button>
        </div>
      </div>

      {/* TAB 1: AGENT LOOP VISUALIZER */}
      {activeTab === "loop" && (
        <Card className="p-6 border-navy/10 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-sans text-base font-bold text-navy">
                Autonomous Loop Execution Visualizer
              </h3>
              <p className="font-sans text-xs text-navy/70">
                Observe how agents cycle between planning (internal monologue), acting (tool execution), and observing (environment perception).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentLoopStep((prev) => Math.max(0, prev - 1))}
                disabled={currentLoopStep === 0}
                className="font-mono text-xs border-navy/20 text-navy"
              >
                Previous Step
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentLoopStep((prev) => Math.min(loopSteps.length - 1, prev + 1))}
                disabled={currentLoopStep === loopSteps.length - 1}
                className="font-mono text-xs border-navy/20 text-navy"
              >
                Next Step
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  if (currentLoopStep === loopSteps.length - 1) setCurrentLoopStep(0);
                  setIsLoopAutoPlaying(!isLoopAutoPlaying);
                }}
                className="bg-ultramarine text-white font-mono text-xs"
              >
                {isLoopAutoPlaying ? "Pause Loop" : "Auto-Run Loop"}
              </Button>
            </div>
          </div>

          {/* Stepper Timeline Bar */}
          <div className="grid grid-cols-5 gap-2">
            {loopSteps.map((step, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentLoopStep(idx)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  idx === currentLoopStep
                    ? "border-ultramarine bg-ultramarine/10 ring-2 ring-ultramarine/30"
                    : idx < currentLoopStep
                    ? "border-mint-500 bg-mint/10 text-navy"
                    : "border-navy/10 bg-daylight/50 opacity-60"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-bold text-navy">Step {idx + 1}</span>
                  {idx < currentLoopStep ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-mint-700" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-navy/30" />
                  )}
                </div>
                <div className="font-sans text-xs font-bold text-navy truncate">{step.phase}</div>
              </button>
            ))}
          </div>

          {/* Current Step Detailed Card */}
          <Card className="p-5 border-navy/15 bg-daylight space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${loopSteps[currentLoopStep].badgeColor}`}>
                  {loopSteps[currentLoopStep].phase}
                </span>
                <span className="font-sans text-sm font-bold text-navy">
                  {loopSteps[currentLoopStep].title}
                </span>
              </div>
              <span className="font-mono text-xs text-navy/60">
                Step {currentLoopStep + 1} of {loopSteps.length}
              </span>
            </div>

            <p className="font-sans text-xs text-navy/80 leading-relaxed">
              {loopSteps[currentLoopStep].description}
            </p>

            <pre className="p-3.5 rounded-xl bg-white border border-navy/10 font-mono text-xs text-navy whitespace-pre-wrap leading-relaxed">
              {loopSteps[currentLoopStep].code}
            </pre>
          </Card>
        </Card>
      )}

      {/* TAB 2: CONTEXT WINDOW METER */}
      {activeTab === "meter" && (
        <Card className="p-6 border-navy/10 bg-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="font-sans text-base font-bold text-navy">
                Context Window Budget & Compaction Meter
              </h3>
              <p className="font-sans text-xs text-navy/70">
                Monitor token distribution across system instructions, tool definitions, chat history, and retrieval documents.
              </p>
            </div>

            {/* Model Context Limit selector */}
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-navy/70">Context Limit:</span>
              <select
                value={contextLimit}
                onChange={(e) => setContextLimit(Number(e.target.value))}
                className="rounded-lg border border-navy/20 bg-daylight p-1.5 font-mono text-xs text-navy focus:outline-none"
              >
                <option value={8192}>8K (gpt-3.5-turbo)</option>
                <option value={32768}>32K (gpt-4o-mini)</option>
                <option value={128000}>128K (gpt-4o)</option>
                <option value={1000000}>1M (gemini-1.5-flash)</option>
              </select>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-mono text-xs">
              <span className="font-bold text-navy">
                Total Used: {totalUsedTokens.toLocaleString()} / {contextLimit.toLocaleString()} tokens
              </span>
              <span className="font-bold text-ultramarine">{usedPercent}% Capacity</span>
            </div>

            <div className="h-6 w-full rounded-xl bg-daylight border border-navy/10 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${(systemPromptTokens / contextLimit) * 100}%` }}
                className="bg-lilac h-full transition-all"
                title={`System Prompt: ${systemPromptTokens} tokens`}
              />
              <div
                style={{ width: `${(toolDefinitionsTokens / contextLimit) * 100}%` }}
                className="bg-mint h-full transition-all"
                title={`Tool Schemas: ${toolDefinitionsTokens} tokens`}
              />
              <div
                style={{ width: `${(historyTokens / contextLimit) * 100}%` }}
                className="bg-sky h-full transition-all"
                title={`Conversation History: ${historyTokens} tokens`}
              />
              <div
                style={{ width: `${(scratchpadTokens / contextLimit) * 100}%` }}
                className="bg-marigold h-full transition-all"
                title={`RAG / Scratchpad: ${scratchpadTokens} tokens`}
              />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-lilac" />
                <span>System Instructions ({systemPromptTokens})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-mint" />
                <span>Tool Schemas ({toolDefinitionsTokens})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-sky" />
                <span>Chat History ({historyTokens})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded bg-marigold" />
                <span>RAG Scratchpad ({scratchpadTokens})</span>
              </div>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-navy/10">
            <div className="rounded-xl border border-navy/10 bg-daylight p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-navy">Conversation Depth (Turns)</span>
                <span className="text-ultramarine font-bold">{historyTurnCount} turns</span>
              </div>
              <input
                type="range"
                min={1}
                max={50}
                value={historyTurnCount}
                onChange={(e) => setHistoryTurnCount(Number(e.target.value))}
                className="w-full accent-ultramarine"
              />
              <p className="text-[11px] text-navy/60">
                Increasing turns demonstrates conversational token inflation. Real systems apply sliding-window compaction.
              </p>
            </div>

            <div className="rounded-xl border border-navy/10 bg-daylight p-4 space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="font-bold text-navy">Document Chunk Scratchpad</span>
                <input
                  type="checkbox"
                  checked={includeLargeRAG}
                  onChange={(e) => setIncludeLargeRAG(e.target.checked)}
                  className="h-4 w-4 accent-ultramarine rounded"
                />
              </div>
              <p className="text-[11px] text-navy/60">
                Simulate injecting 10 retrieved chunks (+7,500 tokens) versus a compressed 2-chunk summary (+1,200 tokens).
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* TAB 3: MCP EXPLORER */}
      {activeTab === "mcp" && (
        <Card className="p-6 border-navy/10 bg-white space-y-6">
          <div className="flex items-center justify-between border-b border-navy/10 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-sans text-base font-bold text-navy">
                  Model Context Protocol (MCP) Topology Explorer
                </h3>
                <Badge variant="outline" className="font-mono text-[10px] text-amber-800 border-amber-500 bg-amber-50">
                  Educational simulation
                </Badge>
              </div>
              <p className="font-sans text-xs text-navy/70">
                Standardized open protocol connecting AI host applications (Claude Desktop, IDEs) to local & remote tool servers via JSON-RPC.
              </p>
            </div>

            <div className="flex items-center gap-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setMcpAction("list_tools")}
                className={`rounded-lg px-2.5 py-1 ${mcpAction === "list_tools" ? "bg-navy text-white" : "border border-navy/20 text-navy"}`}
              >
                tools/list
              </button>
              <button
                type="button"
                onClick={() => setMcpAction("call_tool")}
                className={`rounded-lg px-2.5 py-1 ${mcpAction === "call_tool" ? "bg-navy text-white" : "border border-navy/20 text-navy"}`}
              >
                tools/call
              </button>
              <button
                type="button"
                onClick={() => setMcpAction("read_resource")}
                className={`rounded-lg px-2.5 py-1 ${mcpAction === "read_resource" ? "bg-navy text-white" : "border border-navy/20 text-navy"}`}
              >
                resources/read
              </button>
            </div>
          </div>

          {/* Architecture Visual Diagram */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Host Box */}
            <div className="rounded-xl border border-navy/15 bg-daylight p-4 text-center space-y-2">
              <div className="h-9 w-9 rounded-lg bg-ultramarine/10 text-ultramarine flex items-center justify-center mx-auto">
                <Laptop className="h-5 w-5" />
              </div>
              <div className="font-sans text-xs font-bold text-navy">MCP Host Application</div>
              <p className="text-[11px] font-mono text-navy/60">PromptForge IDE / Studio</p>
              <div className="text-[10px] text-navy/50">Initiates user directive & LLM context</div>
            </div>

            {/* Client Box */}
            <div className="rounded-xl border border-navy/15 bg-daylight p-4 text-center space-y-2">
              <div className="h-9 w-9 rounded-lg bg-mint/20 text-mint-800 flex items-center justify-center mx-auto">
                <Network className="h-5 w-5" />
              </div>
              <div className="font-sans text-xs font-bold text-navy">MCP Client Layer</div>
              <p className="text-[11px] font-mono text-navy/60">stdio / SSE Transport</p>
              <div className="text-[10px] text-navy/50">Dispatches JSON-RPC 2.0 messages</div>
            </div>

            {/* Server Box */}
            <div className="rounded-xl border border-navy/15 bg-daylight p-4 text-center space-y-2">
              <div className="h-9 w-9 rounded-lg bg-marigold/20 text-marigold-800 flex items-center justify-center mx-auto">
                <Server className="h-5 w-5" />
              </div>
              <div className="font-sans text-xs font-bold text-navy">MCP Server (Local / Remote)</div>
              <p className="text-[11px] font-mono text-navy/60">SQLite / GitHub / Filesystem</p>
              <div className="text-[10px] text-navy/50">Executes sandboxed operations</div>
            </div>
          </div>

          {/* JSON-RPC Handshake Inspector */}
          <div className="space-y-2">
            <span className="font-mono text-xs font-bold text-navy uppercase tracking-wider">
              JSON-RPC 2.0 Handshake Inspector ({mcpAction})
            </span>
            <pre className="p-4 rounded-xl bg-daylight border border-navy/15 font-mono text-xs text-navy whitespace-pre-wrap leading-relaxed">
              {mcpAction === "list_tools" &&
`--> REQUEST:
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}

<-- RESPONSE (from MCP Server):
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "read_file",
        "description": "Read file contents from sandboxed workspace",
        "inputSchema": { "type": "object", "properties": { "path": { "type": "string" } } }
      },
      {
        "name": "execute_query",
        "description": "Execute read-only SQL query on SQLite replica",
        "inputSchema": { "type": "object", "properties": { "sql": { "type": "string" } } }
      }
    ]
  }
}`}
              {mcpAction === "call_tool" &&
`--> REQUEST (Host -> Server):
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/call",
  "params": {
    "name": "execute_query",
    "arguments": {
      "sql": "SELECT id, status, latency_ms FROM health_checks ORDER BY timestamp DESC LIMIT 3;"
    }
  }
}

<-- RESPONSE (Server -> Host):
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "[{ id: 104, status: 'healthy', latency_ms: 12 }, { id: 103, status: 'healthy', latency_ms: 15 }]"
      }
    ]
  }
}`}
              {mcpAction === "read_resource" &&
`--> REQUEST (Host -> Server):
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "resources/read",
  "params": {
    "uri": "postgres://production-cluster/schema"
  }
}

<-- RESPONSE (Server -> Host):
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "contents": [
      {
        "uri": "postgres://production-cluster/schema",
        "mimeType": "application/json",
        "text": "{ tables: ['users', 'organizations', 'deployments', 'api_keys'] }"
      }
    ]
  }
}`}
            </pre>
          </div>
        </Card>
      )}
    </div>
  );
}
