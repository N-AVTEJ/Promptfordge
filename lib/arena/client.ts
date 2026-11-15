/**
 * PromptForge Security Arena Client API
 * Client-safe fetch wrappers to dispatch runs to /api/arena/run.
 * Separates server-side LLM & crypto execution from the client bundle.
 */

import {
  AttackResult,
  CompareRunResult,
  RedVsBlueRunResult,
} from "./types";

export async function runClientLevelAttack(
  levelId: number,
  attackPayload: string
): Promise<AttackResult> {
  const res = await fetch("/api/arena/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "level",
      levelId,
      attackPayload,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Arena execution failed with status ${res.status}`
    );
  }

  return res.json();
}

export async function runClientCompareAttack(params: {
  attackPayload: string;
  scenarioId?: string;
  vulnerableSystem?: string;
  defendedSystem?: string;
  defenseTechniqueName?: string;
}): Promise<CompareRunResult> {
  const res = await fetch("/api/arena/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "compare",
      ...params,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Compare execution failed with status ${res.status}`
    );
  }

  return res.json();
}

export async function runClientRedVsBlueChallenge(
  defensePrompt: string
): Promise<RedVsBlueRunResult> {
  const res = await fetch("/api/arena/run", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      mode: "red-vs-blue",
      defensePrompt,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Red vs Blue battery failed with status ${res.status}`
    );
  }

  return res.json();
}
