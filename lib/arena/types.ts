/**
 * PromptForge Security Arena — Types & Data Contracts
 * Defines levels, defense techniques, attack payloads, comparison scenarios,
 * and Red vs Blue evaluation results.
 */

export interface DefenseTechnique {
  id: string;
  name: string;
  category: "delimiters" | "instruction-hierarchy" | "input-labeling" | "output-checks";
  description: string;
  exampleSnippet: string;
  whyItMatters: string;
}

export interface ArenaLevel {
  id: number;
  title: string;
  codename: string;
  fakeFlag: string;
  systemPrompt: string;
  description: string;
  defenseOverview: string;
  defenseTechniques: string[];
  hints: string[];
  suggestedAttacks: Array<{
    label: string;
    payload: string;
  }>;
  difficulty: "Beginner" | "Easy" | "Medium" | "Hard" | "Expert";
}

export interface AttackResult {
  success: boolean;
  output: string;
  rawOutputLength: number;
  filteredOutputLength: number;
  explanation: string;
  leakedFlag?: string;
  redactedSecretsFound: string[];
  defenseTriggered?: string;
  latencyMs: number;
  timestamp: number;
  isSimulated?: boolean;
}

export interface CompareScenario {
  id: string;
  title: string;
  category: "delimiters" | "instruction-hierarchy" | "input-labeling" | "output-checks";
  defenseTechniqueName: string;
  attackPayload: string;
  vulnerableSystem: string;
  defendedSystem: string;
  vulnerabilityExplanation: string;
  defenseExplanation: string;
}

export interface CompareRunResult {
  attackPayload: string;
  vulnerableOutput: string;
  vulnerableBreached: boolean;
  defendedOutput: string;
  defendedBreached: boolean;
  defenseTechniques: string[];
  analysis: string;
  latencyMs: number;
}

export interface StoredAttack {
  id: string;
  index: number;
  name: string;
  category: string;
  payload: string;
  bypassExplanation: string;
  blockExplanation: string;
}

export interface BatteryAttackResult {
  attackId: string;
  index: number;
  name: string;
  category: string;
  payload: string;
  blocked: boolean;
  modelOutput: string;
  explanation: string;
  flagFound: boolean;
}

export interface RedVsBlueRunResult {
  defensePrompt: string;
  blockedCount: number;
  totalCount: number; // Always 8
  fractionScore: string; // Strictly "X/8", NEVER percentage
  attacks: BatteryAttackResult[];
  summary: string;
  latencyMs: number;
  timestamp: number;
}

export interface ArenaProgress {
  completedLevels: number[];
  levelAttempts: Record<number, number>;
  bestRedVsBlueFraction: string | null;
  totalRedVsBlueRuns: number;
  lastActiveTab: "levels" | "compare" | "red-vs-blue";
  updatedAt: number;
}
