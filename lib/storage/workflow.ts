/**
 * PromptForge Workflow Storage Helper
 * Persists and retrieves custom user workflows from localStorage.
 */

import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./index";
import { WorkflowDefinition } from "@/lib/workflow/types";
import { STARTER_TEMPLATES } from "@/lib/workflow/templates";

/**
 * Loads all saved workflows, initialized with starter templates if empty.
 */
export function getSavedWorkflows(): WorkflowDefinition[] {
  const stored = getStorageItem(STORAGE_KEYS.WORKFLOWS);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    // Return starter templates as default
    return STARTER_TEMPLATES;
  }
  return stored;
}

/**
 * Saves or updates a workflow in localStorage.
 */
export function saveWorkflow(workflow: WorkflowDefinition): WorkflowDefinition[] {
  const current = getSavedWorkflows();
  const existingIndex = current.findIndex((w) => w.id === workflow.id);

  let updated: WorkflowDefinition[];
  if (existingIndex >= 0) {
    updated = [...current];
    updated[existingIndex] = {
      ...workflow,
      updatedAt: Date.now(),
    };
  } else {
    updated = [
      {
        ...workflow,
        createdAt: workflow.createdAt || Date.now(),
        updatedAt: Date.now(),
      },
      ...current,
    ];
  }

  setStorageItem(STORAGE_KEYS.WORKFLOWS, updated);
  return updated;
}

/**
 * Deletes a workflow by ID (starter templates cannot be permanently deleted, but will reset).
 */
export function deleteWorkflow(id: string): WorkflowDefinition[] {
  const current = getSavedWorkflows();
  const filtered = current.filter((w) => w.id !== id);
  const result = filtered.length > 0 ? filtered : STARTER_TEMPLATES;
  setStorageItem(STORAGE_KEYS.WORKFLOWS, result);
  return result;
}

/**
 * Exports workflow definition to formatted JSON string.
 */
export function exportWorkflowJson(workflow: WorkflowDefinition): string {
  return JSON.stringify(workflow, null, 2);
}

/**
 * Parses and validates an imported JSON workflow string.
 */
export function importWorkflowJson(jsonString: string): WorkflowDefinition {
  const parsed = JSON.parse(jsonString);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid workflow file: Root must be a JSON object.");
  }
  if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
    throw new Error("Invalid workflow schema: Must contain nodes and edges arrays.");
  }

  return {
    id: typeof parsed.id === "string" ? parsed.id : `imported-${Date.now()}`,
    name: typeof parsed.name === "string" ? parsed.name : "Imported Workflow",
    description: typeof parsed.description === "string" ? parsed.description : "",
    nodes: parsed.nodes,
    edges: parsed.edges,
    createdAt: parsed.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
}
