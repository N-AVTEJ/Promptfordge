"use client";

import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  ReactFlowProvider,
  ReactFlowInstance,
} from "reactflow";
import "reactflow/dist/style.css";

import {
  Play,
  RotateCcw,
  Save,
  FolderOpen,
  Plus,
  AlertTriangle,
  Download,
  Upload,
  CheckCircle,
  Clock,
  Zap,
  DollarSign,
  Layers,
  Info,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { workflowNodeTypes } from "./nodes";
import {
  WorkflowNode,
  WorkflowEdge,
  WorkflowDefinition,
  NodeExecutionStatus,
  WorkflowNodeType,
  EvaluateData,
} from "@/lib/workflow/types";
import {
  detectWorkflowCycle,
  isValidWorkflowConnection,
  executeWorkflow,
} from "@/lib/workflow/engine";
import { STARTER_TEMPLATES, MODULE_WORKFLOW_TEMPLATES } from "@/lib/workflow/templates";
import {
  getSavedWorkflows,
  saveWorkflow,
  deleteWorkflow,
  exportWorkflowJson,
  importWorkflowJson,
} from "@/lib/storage/workflow";

export function WorkflowStudio() {
  const [templates] = useState<WorkflowDefinition[]>(STARTER_TEMPLATES);
  const [currentTemplateId, setCurrentTemplateId] = useState<string>(
    STARTER_TEMPLATES[0].id
  );

  // Workflow state
  const [nodes, setNodes, onNodesChange] = useNodesState<WorkflowNode["data"]>(
    STARTER_TEMPLATES[0].nodes
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    STARTER_TEMPLATES[0].edges
  );

  const [rfInstance, setRfInstance] = useState<ReactFlowInstance | null>(null);

  // Execution states
  const [isRunning, setIsRunning] = useState(false);
  const [cycleError, setCycleError] = useState<string | null>(null);
  const [executionSummary, setExecutionSummary] = useState<{
    latencyMs: number;
    tokens: number;
    costUsd: number;
    nodeCount: number;
  } | null>(null);

  // Storage / Saved workflows modal states
  const [savedWorkflows, setSavedWorkflows] = useState<WorkflowDefinition[]>([]);
  const [showSavedModal, setShowSavedModal] = useState(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved workflows on mount
  React.useEffect(() => {
    try {
      const list = getSavedWorkflows();
      setSavedWorkflows(list);
    } catch {
      // Safe fallback
    }
  }, []);

  // Handle template selection
  const handleSelectTemplate = useCallback(
    (templateId: string) => {
      const moduleTemplate = Object.values(MODULE_WORKFLOW_TEMPLATES).find((t) => t.id === templateId);
      const target =
        moduleTemplate ||
        savedWorkflows.find((t) => t.id === templateId) ||
        templates.find((t) => t.id === templateId);

      if (!target) return;
      setCurrentTemplateId(templateId);
      setCycleError(null);
      setExecutionSummary(null);

      // Deep clone nodes and edges to avoid mutations
      const clonedNodes = JSON.parse(JSON.stringify(target.nodes));
      const clonedEdges = JSON.parse(JSON.stringify(target.edges));

      // Reset node status to idle
      clonedNodes.forEach((n: WorkflowNode) => {
        n.data.status = "idle";
        n.data.output = undefined;
        n.data.error = undefined;
      });

      setNodes(clonedNodes);
      setEdges(clonedEdges);
      setTimeout(() => rfInstance?.fitView({ padding: 0.2 }), 50);
    },
    [templates, savedWorkflows, setNodes, setEdges, rfInstance]
  );

  // Connection validation callback (React Flow isValidConnection)
  const isValidConnection = useCallback(
    (connection: Connection) => {
      if (!connection.source || !connection.target) return false;
      return isValidWorkflowConnection(
        {
          source: connection.source,
          target: connection.target,
          sourceHandle: connection.sourceHandle,
          targetHandle: connection.targetHandle,
        },
        nodes as WorkflowNode[]
      );
    },
    [nodes]
  );

  // Handle adding new connection
  const onConnect = useCallback(
    (connection: Connection) => {
      setCycleError(null);
      const newEdge: Edge = {
        ...connection,
        id: `e-${connection.source}-${connection.target}-${Date.now()}`,
        animated: false,
        style: { stroke: "var(--teal)", strokeWidth: 2 },
      } as Edge;
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Add node dynamically
  const handleAddNode = useCallback(
    (type: WorkflowNodeType) => {
      const id = `node-${Date.now()}`;
      const basePositions = {
        userInput: { x: 100, y: 150 },
        promptTemplate: { x: 420, y: 150 },
        llmRun: { x: 740, y: 150 },
        evaluate: { x: 1060, y: 150 },
        finalOutput: { x: 1380, y: 150 },
      };

      const defaultData: Record<WorkflowNodeType, WorkflowNode["data"]> = {
        userInput: {
          label: "User Input",
          status: "idle",
          inputPrompt: "Enter your prompt query here...",
        },
        promptTemplate: {
          label: "Prompt Template",
          status: "idle",
          template: "System directive: {{input}}",
          variables: ["input"],
        },
        llmRun: {
          label: "LLM Run",
          status: "idle",
          model: "gemini-1.5-flash",
          temperature: 0.7,
        },
        evaluate: {
          label: "Evaluate (Rubric)",
          status: "idle",
          referenceCriteria: "Evaluate clarity, relevance, correctness, and constraints",
        },
        finalOutput: {
          label: "Final Output",
          status: "idle",
        },
      };

      const offset = (nodes.length % 5) * 30;
      const newNode: WorkflowNode = {
        id,
        type,
        position: {
          x: basePositions[type].x + offset,
          y: basePositions[type].y + offset,
        },
        data: defaultData[type],
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes.length, setNodes]
  );

  // Execute workflow
  const handleRunWorkflow = useCallback(async () => {
    if (isRunning) return;
    setCycleError(null);

    // CRITICAL REQUIREMENT: Reject cyclic graph before ANY execution engine call!
    const cycleCheck = detectWorkflowCycle(
      nodes as WorkflowNode[],
      edges as WorkflowEdge[]
    );

    if (cycleCheck.hasCycle) {
      setCycleError(
        cycleCheck.errorMessage ||
          "Workflow contains a cyclic dependency. Directed acyclic graph (DAG) required."
      );
      return;
    }

    setIsRunning(true);

    // Set all nodes to idle initially, clear outputs
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          status: "idle" as NodeExecutionStatus,
          error: undefined,
        },
      }))
    );

    // Animate all edges
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        animated: true,
        style: { stroke: "var(--coral)", strokeWidth: 2.5 },
      }))
    );

    try {
      const result = await executeWorkflow(
        nodes as WorkflowNode[],
        edges as WorkflowEdge[],
        {
          callbacks: {
            onNodeStart: (nodeId) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === nodeId
                    ? {
                        ...n,
                        data: { ...n.data, status: "running" as NodeExecutionStatus },
                      }
                    : n
                )
              );
            },
            onNodeComplete: (nodeId, output, metrics, scores) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === nodeId
                    ? {
                        ...n,
                        data: {
                          ...n.data,
                          status: "done" as NodeExecutionStatus,
                          output,
                          metrics,
                          scores:
                            scores ||
                            ("scores" in n.data
                              ? (n.data as EvaluateData).scores
                              : undefined),
                        },
                      }
                    : n
                )
              );
            },
            onNodeError: (nodeId, err) => {
              setNodes((nds) =>
                nds.map((n) =>
                  n.id === nodeId
                    ? {
                        ...n,
                        data: {
                          ...n.data,
                          status: "failed" as NodeExecutionStatus,
                          error: err,
                        },
                      }
                    : n
                )
              );
            },
          },
        }
      );

      if (!result.success && result.error) {
        setCycleError(result.error);
      } else {
        setExecutionSummary({
          latencyMs: result.totalLatencyMs,
          tokens: result.totalTokens,
          costUsd: result.totalCostUsd,
          nodeCount: result.executedNodeIds.length,
        });
      }
    } catch (err: unknown) {
      setCycleError(
        err instanceof Error ? err.message : "Workflow execution failed."
      );
    } finally {
      setIsRunning(false);
      // Restore static edges
      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          animated: false,
          style: { stroke: "var(--teal)", strokeWidth: 2 },
        }))
      );
    }
  }, [isRunning, nodes, edges, setNodes, setEdges]);

  // Keyboard shortcut listener for Cmd/Ctrl+Enter
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isRunning) {
          handleRunWorkflow();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isRunning, handleRunWorkflow]);

  // Save current workflow
  const handleSaveCurrentWorkflow = useCallback(() => {
    if (!newWorkflowName.trim()) return;

    const newDef: WorkflowDefinition = {
      id: `wf-${Date.now()}`,
      name: newWorkflowName.trim(),
      description: `Custom workflow with ${nodes.length} nodes and ${edges.length} edges`,
      nodes: nodes as WorkflowNode[],
      edges: edges as WorkflowEdge[],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const updatedList = saveWorkflow(newDef);
    setSavedWorkflows(updatedList);
    setCurrentTemplateId(newDef.id);
    setShowSaveAsModal(false);
    setNewWorkflowName("");
  }, [newWorkflowName, nodes, edges]);

  // Delete saved workflow
  const handleDeleteWorkflow = useCallback((id: string) => {
    const updatedList = deleteWorkflow(id);
    setSavedWorkflows(updatedList);
  }, []);

  // Export JSON
  const handleExportJson = useCallback(() => {
    const currentDef: WorkflowDefinition = {
      id: currentTemplateId,
      name: "PromptForge Workflow Export",
      description: "Exported visual pipeline definition",
      nodes: nodes as WorkflowNode[],
      edges: edges as WorkflowEdge[],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const jsonStr = exportWorkflowJson(currentDef);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentTemplateId, nodes, edges]);

  // Import JSON
  const handleImportFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const imported = importWorkflowJson(content);
          const updated = saveWorkflow(imported);
          setSavedWorkflows(updated);
          handleSelectTemplate(imported.id);
        } catch (err: unknown) {
          alert(
            err instanceof Error
              ? err.message
              : "Failed to parse imported workflow file."
          );
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [handleSelectTemplate]
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-daylight text-navy">
      {/* Top Toolbar */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/10 bg-white/95 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-ultramarine/10 text-ultramarine border border-ultramarine/30">
              <Layers className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-sm font-bold text-forge-text">
                  Workflow Builder
                </h1>
                <Link
                  href="/academy/mod-04"
                  className="inline-flex items-center gap-1.5 rounded-full border border-ultramarine/30 bg-ultramarine/10 px-2.5 py-0.5 font-mono text-[10px] font-semibold text-ultramarine hover:bg-ultramarine/20 transition-colors"
                >
                  <span>Module 4: Advanced Prompt Techniques</span>
                </Link>
                <Badge variant="outline" className="border-navy/20 font-mono text-[10px] text-navy/70">
                  Full Lab
                </Badge>
              </div>
              <p className="text-[11px] text-forge-muted hidden sm:block">
                Visual prompt chains with typed handles and topological DAG execution.
              </p>
            </div>
          </div>
        </div>

        {/* Center: Template Switcher & Add Node Dropdown */}
        <div className="flex items-center gap-2">
          {/* Module-Grouped Starter Template Selector */}
          <div className="flex items-center gap-1.5 rounded-lg border border-navy/10 bg-white px-2.5 py-1">
            <span className="text-[10px] font-mono text-navy/70 uppercase">
              Template:
            </span>
            <select
              value={currentTemplateId}
              onChange={(e) => handleSelectTemplate(e.target.value)}
              className="bg-transparent font-mono text-xs text-navy focus:outline-none cursor-pointer"
            >
              <optgroup label="Module 4: Advanced Prompt Techniques">
                <option value="template-m4-chain" className="bg-white text-navy">
                  M4: Linear Prompt Chain with Variables
                </option>
              </optgroup>
              <optgroup label="Module 3: Context & Interaction">
                <option value="template-m3-reflection" className="bg-white text-navy">
                  M3: Reflection & Critique Loop
                </option>
              </optgroup>
              <optgroup label="Module 7: Tool-Augmented Prompting">
                <option value="template-m7-tool-call" className="bg-white text-navy">
                  M7: Tool-Augmented Function Call
                </option>
              </optgroup>
              <optgroup label="Module 11: AI Agents & MCP">
                <option value="template-m11-agent-loop" className="bg-white text-navy">
                  M11: Autonomous Agent Loop
                </option>
              </optgroup>
              <optgroup label="Module 12: Production & Responsible AI">
                <option value="template-m12-regression" className="bg-white text-navy">
                  M12: Production Regression Test Matrix
                </option>
              </optgroup>
              <optgroup label="Baseline DAG Templates">
                {STARTER_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-white text-navy">
                    {t.name}
                  </option>
                ))}
              </optgroup>
              {savedWorkflows.filter((w) => !w.isTemplate).length > 0 && (
                <optgroup label="My Saved Workflows">
                  {savedWorkflows
                    .filter((w) => !w.isTemplate)
                    .map((w) => (
                      <option key={w.id} value={w.id} className="bg-white text-navy">
                        {w.name}
                      </option>
                    ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Add Node Menu */}
          <div className="relative group">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-navy/10 bg-white px-3 py-1.5 text-xs font-mono text-navy hover:bg-daylight transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-teal" />
              <span>Add Node</span>
            </button>
            <div className="absolute left-0 top-full z-50 mt-1 hidden w-44 rounded-lg border border-navy/10 bg-white p-1 shadow-sm group-hover:block">
              <button
                type="button"
                onClick={() => handleAddNode("userInput")}
                className="w-full text-left px-2.5 py-1.5 text-xs font-mono text-teal hover:bg-daylight rounded"
              >
                + User Input
              </button>
              <button
                type="button"
                onClick={() => handleAddNode("promptTemplate")}
                className="w-full text-left px-2.5 py-1.5 text-xs font-mono text-ultramarine hover:bg-daylight rounded"
              >
                + Prompt Template
              </button>
              <button
                type="button"
                onClick={() => handleAddNode("llmRun")}
                className="w-full text-left px-2.5 py-1.5 text-xs font-mono text-violet hover:bg-daylight rounded"
              >
                + LLM Run
              </button>
              <button
                type="button"
                onClick={() => handleAddNode("evaluate")}
                className="w-full text-left px-2.5 py-1.5 text-xs font-mono text-ultramarine hover:bg-daylight rounded"
              >
                + Evaluate
              </button>
              <button
                type="button"
                onClick={() => handleAddNode("finalOutput")}
                className="w-full text-left px-2.5 py-1.5 text-xs font-mono text-teal hover:bg-daylight rounded"
              >
                + Final Output
              </button>
            </div>
          </div>
        </div>

        {/* Right: Actions (Run, Save, Reset, Import/Export) */}
        <div className="flex items-center gap-2">
          {/* Save Button */}
          <button
            type="button"
            onClick={() => setShowSaveAsModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-navy/10 bg-white px-2.5 py-1.5 text-xs font-mono text-navy hover:bg-daylight transition-colors"
            title="Save workflow to localStorage"
          >
            <Save className="h-3.5 w-3.5 text-ultramarine" />
            <span className="hidden md:inline">Save</span>
          </button>

          {/* Manage Saved Button */}
          <button
            type="button"
            onClick={() => setShowSavedModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-navy/10 bg-white px-2.5 py-1.5 text-xs font-mono text-navy hover:bg-daylight transition-colors"
            title="Manage saved workflows"
          >
            <FolderOpen className="h-3.5 w-3.5 text-teal" />
            <span className="hidden md:inline">Manage</span>
          </button>

          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportJson}
            className="flex items-center gap-1 rounded-lg border border-navy/10 bg-white px-2 py-1.5 text-xs font-mono text-navy/70 hover:text-navy transition-colors"
            title="Export workflow JSON"
          >
            <Download className="h-3.5 w-3.5" />
          </button>

          {/* Import JSON */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 rounded-lg border border-navy/10 bg-white px-2 py-1.5 text-xs font-mono text-navy/70 hover:text-navy transition-colors"
            title="Import workflow JSON"
          >
            <Upload className="h-3.5 w-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />

          {/* Reset Canvas */}
          <button
            type="button"
            onClick={() => handleSelectTemplate(currentTemplateId)}
            className="flex items-center gap-1.5 rounded-lg border border-navy/10 bg-white px-2.5 py-1.5 text-xs font-mono text-navy/70 hover:text-navy transition-colors"
            title="Reset workflow to template defaults"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Reset</span>
          </button>

          {/* Run Workflow CTA */}
          <button
            type="button"
            onClick={handleRunWorkflow}
            disabled={isRunning}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 font-mono text-xs font-bold text-white shadow-sm transition-all ${
              isRunning
                ? "bg-teal/50 cursor-not-allowed"
                : "bg-ultramarine hover:bg-ultramarine-600"
            }`}
          >
            <Play className={`h-3.5 w-3.5 ${isRunning ? "animate-spin" : ""}`} />
            <span>{isRunning ? "Executing..." : "Run Pipeline"}</span>
          </button>
        </div>
      </header>

      {/* Cycle Detection / Friendly Error Banner */}
      {cycleError && (
        <div className="flex items-start gap-3 border-b border-rose-500/40 bg-rose-950/40 px-4 py-2.5 text-xs font-mono text-rose-200">
          <AlertTriangle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-rose-300">
              {cycleError.toLowerCase().includes("cyclic") ||
              cycleError.toLowerCase().includes("cycle") ||
              cycleError.toLowerCase().includes("dag")
                ? "Graph Topology Error: "
                : "Execution Error: "}
            </span>
            <span>{cycleError}</span>
          </div>
          <button
            type="button"
            onClick={() => setCycleError(null)}
            className="text-rose-400 hover:text-rose-200"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Execution Telemetry Summary Banner */}
      {executionSummary && (
        <div className="flex items-center justify-between border-b border-emerald-500/30 bg-emerald-950/20 px-4 py-2 text-xs font-mono text-emerald-300">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <CheckCircle className="h-3.5 w-3.5" />
              Pipeline Run Successful ({executionSummary.nodeCount} nodes)
            </span>
            <span className="flex items-center gap-1 text-cyan-300">
              <Clock className="h-3 w-3" />
              {executionSummary.latencyMs}ms total latency
            </span>
            <span className="flex items-center gap-1 text-amber-300">
              <Zap className="h-3 w-3" />
              {executionSummary.tokens} tokens
            </span>
            <span className="flex items-center gap-1 text-emerald-300">
              <DollarSign className="h-3 w-3" />
              ${executionSummary.costUsd.toFixed(5)} est. cost
            </span>
          </div>
          <span className="text-[10px] text-emerald-400/80">
            Topological DAG order verified
          </span>
        </div>
      )}

      {/* React Flow Canvas */}
      <div className="relative flex-1 w-full h-full bg-daylight">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          nodeTypes={workflowNodeTypes}
          onInit={setRfInstance}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          attributionPosition="bottom-left"
          className="bg-daylight"
        >
          <Background color="var(--forge-border)" gap={20} size={1} />
          <Controls className="!bg-white !border !border-navy/10 !rounded-lg !text-navy" />
          <MiniMap
            className="!bg-white !border !border-navy/10 !rounded-lg"
            nodeColor={(node) => {
              switch (node.type) {
                case "userInput":
                  return "var(--teal)";
                case "promptTemplate":
                  return "var(--coral)";
                case "llmRun":
                  return "var(--violet)";
                case "evaluate":
                  return "var(--coral)";
                case "finalOutput":
                  return "var(--teal)";
                default:
                  return "var(--indigo)";
              }
            }}
          />
        </ReactFlow>

        {/* Floating Educational Disclosure */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-navy/10 bg-white/95 px-4 py-1.5 shadow-sm backdrop-blur-md flex items-center gap-2 pointer-events-none">
          <Info className="h-3 w-3 text-teal" />
          <span className="font-mono text-[10px] text-navy/70">
            Educational simulation: Typed handles enforce valid pipeline flow. Cycles are rejected before execution.
          </span>
        </div>
      </div>

      {/* Save Workflow Modal */}
      {showSaveAsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-navy/10 bg-white p-6 shadow-2xl">
            <h3 className="font-mono text-sm font-bold text-navy mb-2">
              Save Workflow to LocalStorage
            </h3>
            <p className="text-xs text-navy/70 mb-4">
              Enter a name to persist this {nodes.length}-node pipeline in your browser.
            </p>
            <input
              type="text"
              value={newWorkflowName}
              onChange={(e) => setNewWorkflowName(e.target.value)}
              placeholder="e.g. My Multi-Agent Security Audit Pipeline"
              className="w-full rounded-xl border border-navy/15 bg-daylight px-3 py-2 font-mono text-xs text-navy focus:border-ultramarine focus:outline-none mb-4"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSaveAsModal(false)}
                className="rounded-lg px-3 py-1.5 font-mono text-xs text-navy/60 hover:text-navy"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCurrentWorkflow}
                disabled={!newWorkflowName.trim()}
                className="rounded-xl bg-ultramarine px-4 py-1.5 font-mono text-xs font-bold text-white hover:bg-ultramarine-hover disabled:opacity-50"
              >
                Save Workflow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Workflows Modal */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-indigo/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-navy/10 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-navy/10 pb-3 mb-3">
              <h3 className="font-mono text-sm font-bold text-navy flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-violet" />
                <span>Saved Workflows</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowSavedModal(false)}
                className="text-xs font-mono text-navy/60 hover:text-navy"
              >
                Close
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
              {savedWorkflows.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-xl border border-navy/10 bg-daylight p-3 hover:border-navy/20 transition-colors"
                >
                  <div className="flex-1 mr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-forge-text">
                        {w.name}
                      </span>
                      {w.isTemplate && (
                        <span className="rounded bg-cyan-500/10 px-1.5 py-0.2 font-mono text-[9px] text-cyan-400 border border-cyan-500/30">
                          Template
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-forge-muted mt-0.5 line-clamp-1">
                      {w.description || `${w.nodes.length} nodes · ${w.edges.length} edges`}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        handleSelectTemplate(w.id);
                        setShowSavedModal(false);
                      }}
                      className="rounded bg-white/[0.05] px-2.5 py-1 font-mono text-xs text-forge-text hover:bg-white/[0.1]"
                    >
                      Load
                    </button>
                    {!w.isTemplate && (
                      <button
                        type="button"
                        onClick={() => handleDeleteWorkflow(w.id)}
                        className="rounded p-1 text-rose-400/80 hover:text-rose-300 hover:bg-rose-950/30"
                        title="Delete workflow"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function WorkflowStudioWrapper() {
  return (
    <ReactFlowProvider>
      <WorkflowStudio />
    </ReactFlowProvider>
  );
}
