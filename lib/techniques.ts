/**
 * PromptForge Prompting Techniques & Transformation Templates
 *
 * Implements the six foundational prompting paradigms:
 * 1. Zero-Shot
 * 2. One-Shot
 * 3. Few-Shot
 * 4. Role-Based
 * 5. Constraint-Based
 * 6. Structured Specification
 *
 * Each technique transforms an arbitrary user task into a specialized,
 * production-calibrated prompt that can be edited before execution.
 */

export type TechniqueId =
  | "zero-shot"
  | "one-shot"
  | "few-shot"
  | "role-based"
  | "constraint-based"
  | "structured";

export interface TechniqueDefinition {
  id: TechniqueId;
  name: string;
  tag: string;
  description: string;
  color: string;
  generatePrompt: (task: string) => string;
}

// ---------------------------------------------------------------------------
// Template Generators
// ---------------------------------------------------------------------------

export function generateZeroShotPrompt(task: string): string {
  const cleanTask = task.trim();
  return `${cleanTask}

Provide a direct, thorough, and precise response fulfilling all task requirements.`;
}

export function generateOneShotPrompt(task: string): string {
  const cleanTask = task.trim();

  return `### Demonstration Exemplar
[Demonstration Input]:
Task: Summarize the architectural benefit of immutable event logs.

[Exemplary Output]:
Immutable event logs provide an append-only, tamper-evident audit trail where state changes are captured as discrete historic facts. Key benefits:
1. Deterministic Replayability: Past system state can be accurately reconstructed at any point in time.
2. Decoupled Read/Write Paths: Supports CQRS architectures for high throughput.
3. Auditability: Eliminates destructive in-place mutations, guaranteeing regulatory trace history.

---

### Your Directive
[Target Task]:
${cleanTask}

[Your Response]:`;
}

export function generateFewShotPrompt(task: string): string {
  const cleanTask = task.trim();

  return `### Example 1 (Standard Case)
Task: Identify the core vulnerability: "SELECT * FROM users WHERE username = '" + userInput + "';"
Response:
- Vulnerability: SQL Injection (CWE-89).
- Root Cause: Unsanitized string concatenation in dynamic query construction.
- Remediation: Utilize parameterized prepared statements: "SELECT * FROM users WHERE username = ?;".

### Example 2 (Edge Case - Non-obvious Boundary)
Task: Identify the core vulnerability: "const token = jwt.decode(headerToken); if (token.role === 'admin') allow();"
Response:
- Vulnerability: Unverified Signature / Authentication Bypass (CWE-345).
- Root Cause: Calling decode() instead of verify() inspects the payload without validating cryptographic signature integrity.
- Remediation: Use "jwt.verify(headerToken, SECRET_KEY)" and validate expiration and issuer claims.

---

### Your Directive
Task:
${cleanTask}

Response:`;
}

export function generateRoleBasedPrompt(task: string): string {
  const cleanTask = task.trim();

  return `You are a Principal Technical Architect and Senior Systems Specialist with 15+ years of production experience.
You operate with extreme analytical rigor, prioritize concrete engineering facts over hand-waving abstractions, and reject generic filler.

Analyze and execute the following task with executive clarity and technical precision:

### Directive:
${cleanTask}

Provide your expert assessment with actionable insights and strict technical correctness.`;
}

export function generateConstraintBasedPrompt(task: string): string {
  const cleanTask = task.trim();

  return `Execute the following task strictly within the specified operational boundaries:

### Target Task:
${cleanTask}

### Non-Negotiable Operational Constraints:
1. Negative Boundary: Do NOT include conversational pleasantries, introductory filler ("Certainly, here is..."), or closing pleasantries.
2. Factuality Guard: Only state verified principles and facts. If any condition is ambiguous or uncertain, explicitly label the assumption.
3. Signal-to-Noise: Maximize information density. Every sentence must convey substantive technical information.
4. Scope Adherence: Address every constraint and parameter specified in the target task without omissions.`;
}

export function generateStructuredPrompt(task: string): string {
  const cleanTask = task.trim();

  return `# SYSTEM SPECIFICATION & DIRECTIVE

## 1. Objective
${cleanTask}

## 2. Requirements & Context
- Apply formal architectural standards.
- Ensure thorough coverage of both primary cases and edge risks.
- Maintain high structural readability.

## 3. Structured Output Format
Organize your response strictly using the following hierarchy:
- **Core Summary**: High-level synthesis (1-2 sentences).
- **Detailed Solution**: Step-by-step breakdown or implementation.
- **Edge Conditions & Trade-offs**: Latency, scale, or failure considerations.
- **Key Takeaways**: Bulleted summary of critical action items.`;
}

// ---------------------------------------------------------------------------
// Technique Registry
// ---------------------------------------------------------------------------

export const TECHNIQUES: TechniqueDefinition[] = [
  {
    id: "zero-shot",
    name: "Zero-Shot",
    tag: "Baseline",
    description:
      "Direct instruction without exemplars. Tests foundational model capabilities and instructions.",
    color: "#22D3EE", // cyan-400
    generatePrompt: generateZeroShotPrompt,
  },
  {
    id: "one-shot",
    name: "One-Shot",
    tag: "1 Exemplar",
    description:
      "Supplies a single high-quality demonstration to establish expected tone, formatting, and depth.",
    color: "#38BDF8", // sky-400
    generatePrompt: generateOneShotPrompt,
  },
  {
    id: "few-shot",
    name: "Few-Shot",
    tag: "N Exemplars",
    description:
      "Provides multiple demonstrations covering standard and edge cases for in-context pattern momentum.",
    color: "#818CF8", // indigo-400
    generatePrompt: generateFewShotPrompt,
  },
  {
    id: "role-based",
    name: "Role-Based",
    tag: "Persona",
    description:
      "Assigns an authoritative expert persona to calibrate analytical depth, tone, and rigor.",
    color: "#F59E0B", // amber-500
    generatePrompt: generateRoleBasedPrompt,
  },
  {
    id: "constraint-based",
    name: "Constraint-Based",
    tag: "Boundaries",
    description:
      "Enforces strict negative boundaries and factuality limits to minimize bloat and hallucination.",
    color: "#FB923C", // orange-400
    generatePrompt: generateConstraintBasedPrompt,
  },
  {
    id: "structured",
    name: "Structured",
    tag: "Hierarchical",
    description:
      "Enforces an explicit architectural schema (# Objective, Context, Schema) for deterministic layout.",
    color: "#34D399", // emerald-400
    generatePrompt: generateStructuredPrompt,
  },
];

export const TECHNIQUE_IDS: TechniqueId[] = [
  "zero-shot",
  "one-shot",
  "few-shot",
  "role-based",
  "constraint-based",
  "structured",
];

export function getTechnique(id: string): TechniqueDefinition | undefined {
  return TECHNIQUES.find((t) => t.id === id);
}

export function generatePromptForTechnique(id: TechniqueId, task: string): string {
  const technique = getTechnique(id);
  if (!technique) {
    return generateZeroShotPrompt(task);
  }
  return technique.generatePrompt(task);
}

export function generateAllPrompts(task: string): Record<TechniqueId, string> {
  const result: Partial<Record<TechniqueId, string>> = {};
  for (const t of TECHNIQUES) {
    result[t.id] = t.generatePrompt(task);
  }
  return result as Record<TechniqueId, string>;
}
