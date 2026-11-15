/**
 * PromptForge Reasoning Playground Types
 * Module 4: Chain-of-Thought & Visual Reasoning Strategies
 * (Tree-of-Thoughts, ReAct, Expert Multi-Persona Council)
 */

export interface ReasoningMetricScore {
  score: number; // 1-5 scale
  maxScore: number;
  reason: string;
}

export interface TotNodeScores {
  feasibility: ReasoningMetricScore;
  soundness: ReasoningMetricScore;
  completeness: ReasoningMetricScore;
}

export interface TotNode {
  id: string;
  parentId: string | null;
  depth: number;
  title: string;
  thoughtSummary: string;
  scores: TotNodeScores;
  status: "candidate" | "selected" | "pruned" | "exploring";
  expanded: boolean;
  childrenIds: string[];
  isChosenPath?: boolean;
}

export interface TotTreeState {
  problemPrompt: string;
  rootNodeId: string;
  nodes: Record<string, TotNode>;
  chosenLeafId: string | null;
  chosenPathNodeIds: string[];
  totalCandidateThoughts: number;
  maxDepth: number;
  educationalDisclosure: string;
}

export type ReactStepType = "thought" | "action" | "observation" | "finish";

export interface ReactStep {
  stepNumber: number;
  type: ReactStepType;
  title: string;
  content: string;
  toolName?: string;
  toolInput?: string;
  toolOutput?: string;
  timestamp: number;
  educationalNote: string;
}

export interface ReactScenario {
  id: string;
  title: string;
  task: string;
  expectedFinalAnswer: string;
  steps: ReactStep[];
}

export interface ExpertRole {
  id: string;
  title: string;
  persona: string;
  avatarColor: string;
  badgeText: string;
  systemPrompt: string;
  focusAreas: string[];
}

export interface ExpertEvaluationResponse {
  roleId: string;
  roleTitle: string;
  response: string;
  keyTakeaway: string;
  latencyMs: number;
  tokensUsed: number;
  scores: {
    domainRigor: ReasoningMetricScore;
    actionability: ReasoningMetricScore;
    riskAwareness: ReasoningMetricScore;
  };
}

export interface ExpertCouncilPreset {
  id: string;
  title: string;
  query: string;
  domain: string;
}
