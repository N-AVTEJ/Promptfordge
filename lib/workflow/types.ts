/**
 * PromptForge Visual Workflow Types
 * Module 4 & 10: Visual Prompt Chaining Engine
 */

import type { Node, Edge } from "reactflow";

export type WorkflowNodeType =
  | "userInput"
  | "promptTemplate"
  | "llmRun"
  | "evaluate"
  | "finalOutput";

export type NodeExecutionStatus = "idle" | "running" | "done" | "failed";

export type HandleDataType = "text" | "template" | "evaluation" | "any";

/**
 * Handle data type mapping per node role.
 * Defines input and output contracts for typed handle connections.
 */
export const NODE_HANDLE_TYPES: Record<
  WorkflowNodeType,
  {
    inputs: HandleDataType[];
    outputs: HandleDataType[];
  }
> = {
  userInput: { inputs: [], outputs: ["text"] },
  promptTemplate: { inputs: ["text"], outputs: ["template"] },
  llmRun: { inputs: ["text", "template"], outputs: ["text"] },
  evaluate: { inputs: ["text"], outputs: ["evaluation"] },
  finalOutput: { inputs: ["text", "template", "evaluation", "any"], outputs: [] },
};

export interface NodeMetrics {
  latencyMs?: number;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
}

export interface EvaluationScores {
  clarity: number;
  relevance: number;
  correctness: number;
  constraintFollowing: number;
  explanation: string;
}

export interface BaseWorkflowNodeData {
  label: string;
  status: NodeExecutionStatus;
  output?: string;
  error?: string;
  metrics?: NodeMetrics;
  educationalNote?: string;
}

export interface UserInputData extends BaseWorkflowNodeData {
  inputPrompt: string;
}

export interface PromptTemplateData extends BaseWorkflowNodeData {
  template: string;
  variables: string[];
  resolvedPrompt?: string;
}

export interface LlmRunData extends BaseWorkflowNodeData {
  model: string;
  temperature: number;
  systemPrompt?: string;
  inputPrompt?: string;
}

export interface EvaluateData extends BaseWorkflowNodeData {
  inputText?: string;
  referenceCriteria?: string;
  scores?: EvaluationScores;
}

export interface FinalOutputData extends BaseWorkflowNodeData {
  inputText?: string;
  formattedOutput?: string;
}

export type AnyWorkflowNodeData =
  | UserInputData
  | PromptTemplateData
  | LlmRunData
  | EvaluateData
  | FinalOutputData;

export type WorkflowNode = Node<AnyWorkflowNodeData>;
export type WorkflowEdge = Edge;

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: number;
  updatedAt: number;
  isTemplate?: boolean;
}

export interface CycleDetectionResult {
  hasCycle: boolean;
  cycleNodes?: string[];
  cycleNodeLabels?: string[];
  errorMessage?: string;
}

export interface WorkflowExecutionResult {
  success: boolean;
  graphId?: string;
  executedNodeIds: string[];
  nodeOutputs: Record<string, string>;
  nodeMetrics: Record<string, NodeMetrics>;
  totalLatencyMs: number;
  totalTokens: number;
  totalCostUsd: number;
  finalOutput?: string;
  error?: string;
}
