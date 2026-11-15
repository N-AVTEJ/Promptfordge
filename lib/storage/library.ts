/**
 * PromptForge Prompt Library Management Module
 *
 * Provides typed CRUD operations for saved prompts, versions, and imports/exports.
 *
 * Core Invariant:
 * Restoring an old version creates a new version rather than deleting history.
 */

import {
  STORAGE_KEYS,
  SavedPrompt,
  PromptVersion,
  PromptVersionMetrics,
  getStorageItem,
  setStorageItem,
} from "./index";

export type { SavedPrompt, PromptVersion, PromptVersionMetrics };


/**
 * Normalizes a prompt to ensure its `versions` array is never undefined or empty.
 */
function normalizePrompt(prompt: SavedPrompt): SavedPrompt {
  const versions: PromptVersion[] =
    prompt.versions && prompt.versions.length > 0
      ? [...prompt.versions]
      : [
          {
            id: `ver_init_${prompt.id}`,
            versionNumber: 1,
            content: prompt.content,
            notes: prompt.notes || "Initial version",
            timestamp: prompt.createdAt,
          },
        ];

  // Ensure version numbers are properly sorted
  versions.sort((a, b) => a.versionNumber - b.versionNumber);

  const currentVersionId =
    prompt.currentVersionId || versions[versions.length - 1].id;

  return {
    ...prompt,
    tags: Array.isArray(prompt.tags) ? prompt.tags : [],
    versions,
    currentVersionId,
  };
}

/**
 * Retrieves all saved prompts from localStorage, normalized with version histories.
 */
export function getSavedPrompts(): SavedPrompt[] {
  const rawList = getStorageItem(STORAGE_KEYS.SAVED_PROMPTS);
  if (!Array.isArray(rawList)) return [];
  return rawList.map(normalizePrompt);
}

/**
 * Retrieves a single saved prompt by its ID.
 */
export function getSavedPromptById(id: string): SavedPrompt | undefined {
  const prompts = getSavedPrompts();
  return prompts.find((p) => p.id === id);
}

export interface SavePromptInput {
  id?: string;
  title: string;
  content: string;
  tags?: string[];
  notes?: string;
  metrics?: PromptVersionMetrics;
}

/**
 * Saves a new prompt or creates a new version for an existing prompt.
 * If modifying an existing prompt's content, a new version is created.
 */
export function savePrompt(input: SavePromptInput): SavedPrompt {
  const existingList = getSavedPrompts();
  const now = Date.now();

  if (input.id) {
    const existingIndex = existingList.findIndex((p) => p.id === input.id);
    if (existingIndex !== -1) {
      const existing = existingList[existingIndex];
      const prevVersions = existing.versions || [];
      const highestVerNum = prevVersions.reduce(
        (max, v) => Math.max(max, v.versionNumber),
        0
      );

      // Check if content or notes changed to justify a new version
      const latestVersion = prevVersions[prevVersions.length - 1];
      const isContentChanged = !latestVersion || latestVersion.content !== input.content;

      const updatedVersions = [...prevVersions];
      let newCurrentVersionId = existing.currentVersionId;

      if (isContentChanged) {
        const newVersionNumber = highestVerNum + 1;
        const newVersionId = `ver_${now}_${Math.random().toString(36).slice(2, 7)}`;
        const newVersion: PromptVersion = {
          id: newVersionId,
          versionNumber: newVersionNumber,
          content: input.content,
          notes: input.notes || `Version ${newVersionNumber}`,
          timestamp: now,
          metrics: input.metrics,
        };
        updatedVersions.push(newVersion);
        newCurrentVersionId = newVersionId;
      }

      const updatedPrompt: SavedPrompt = {
        ...existing,
        title: input.title.trim() || existing.title,
        content: input.content,
        tags: input.tags ?? existing.tags,
        notes: input.notes ?? existing.notes,
        updatedAt: now,
        versions: updatedVersions,
        currentVersionId: newCurrentVersionId,
      };

      existingList[existingIndex] = updatedPrompt;
      setStorageItem(STORAGE_KEYS.SAVED_PROMPTS, existingList);
      return updatedPrompt;
    }
  }

  // Create brand new prompt with Version 1
  const promptId = input.id || `prompt_${now}_${Math.random().toString(36).slice(2, 7)}`;
  const initialVersionId = `ver_${now}_v1`;

  const initialVersion: PromptVersion = {
    id: initialVersionId,
    versionNumber: 1,
    content: input.content,
    notes: input.notes || "Initial draft",
    timestamp: now,
    metrics: input.metrics,
  };

  const newPrompt: SavedPrompt = {
    id: promptId,
    title: input.title.trim() || "Untitled Prompt",
    content: input.content,
    tags: input.tags || [],
    notes: input.notes || "",
    createdAt: now,
    updatedAt: now,
    versions: [initialVersion],
    currentVersionId: initialVersionId,
  };

  const updatedList = [newPrompt, ...existingList];
  setStorageItem(STORAGE_KEYS.SAVED_PROMPTS, updatedList);
  return newPrompt;
}

/**
 * Restores an old version of a prompt.
 *
 * CRITICAL INVARIANT:
 * Restoring an old version NEVER deletes history. It creates a NEW version
 * containing the restored content and appends it to the version history.
 */
export function restorePromptVersion(
  promptId: string,
  versionId: string,
  restoreNote?: string
): SavedPrompt {
  const existingList = getSavedPrompts();
  const existingIndex = existingList.findIndex((p) => p.id === promptId);

  if (existingIndex === -1) {
    throw new Error(`Prompt with ID "${promptId}" not found in storage.`);
  }

  const prompt = existingList[existingIndex];
  const targetVersion = prompt.versions?.find((v) => v.id === versionId);

  if (!targetVersion) {
    throw new Error(
      `Version "${versionId}" not found on prompt "${promptId}".`
    );
  }

  const now = Date.now();
  const prevVersions = prompt.versions || [];
  const highestVerNum = prevVersions.reduce(
    (max, v) => Math.max(max, v.versionNumber),
    0
  );

  const newVersionNumber = highestVerNum + 1;
  const newVersionId = `ver_${now}_restored_v${targetVersion.versionNumber}`;

  const restoredVersion: PromptVersion = {
    id: newVersionId,
    versionNumber: newVersionNumber,
    content: targetVersion.content,
    notes:
      restoreNote ||
      `Restored from Version ${targetVersion.versionNumber} (${new Date(
        targetVersion.timestamp
      ).toLocaleDateString()})`,
    timestamp: now,
    metrics: targetVersion.metrics ? { ...targetVersion.metrics } : undefined,
  };

  // Append new version — historical versions are strictly preserved!
  const updatedVersions = [...prevVersions, restoredVersion];

  const updatedPrompt: SavedPrompt = {
    ...prompt,
    content: targetVersion.content,
    updatedAt: now,
    versions: updatedVersions,
    currentVersionId: newVersionId,
  };

  existingList[existingIndex] = updatedPrompt;
  setStorageItem(STORAGE_KEYS.SAVED_PROMPTS, existingList);
  return updatedPrompt;
}

/**
 * Deletes a prompt from storage by ID.
 */
export function deleteSavedPrompt(id: string): boolean {
  const existingList = getSavedPrompts();
  const filtered = existingList.filter((p) => p.id !== id);
  if (filtered.length === existingList.length) return false;
  return setStorageItem(STORAGE_KEYS.SAVED_PROMPTS, filtered);
}

/**
 * Exports all saved prompts to a formatted JSON string.
 */
export function exportLibraryJson(): string {
  const prompts = getSavedPrompts();
  const exportPayload = {
    promptforge_version: "1.0",
    export_date: new Date().toISOString(),
    prompts,
  };
  return JSON.stringify(exportPayload, null, 2);
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  error?: string;
}

/**
 * Imports prompts from a JSON string.
 * Supports merge (default) or replace mode.
 */
export function importLibraryJson(
  jsonString: string,
  mode: "merge" | "replace" = "merge"
): ImportResult {
  if (!jsonString || jsonString.trim().length === 0) {
    return { success: false, importedCount: 0, error: "Empty import data." };
  }

  try {
    const parsed = JSON.parse(jsonString);
    const candidateList: unknown = Array.isArray(parsed)
      ? parsed
      : (parsed as { prompts?: unknown }).prompts;

    if (!Array.isArray(candidateList)) {
      return {
        success: false,
        importedCount: 0,
        error: "Invalid import format: expected an array of prompts.",
      };
    }

    const validPrompts: SavedPrompt[] = [];
    for (const item of candidateList) {
      if (
        item &&
        typeof item === "object" &&
        "title" in item &&
        "content" in item &&
        typeof (item as SavedPrompt).content === "string"
      ) {
        const p = item as Partial<SavedPrompt>;
        const now = Date.now();
        const id = p.id || `prompt_imported_${now}_${Math.random().toString(36).slice(2, 6)}`;
        const normalized = normalizePrompt({
          id,
          title: (p.title || "Imported Prompt").trim(),
          content: p.content || "",
          tags: Array.isArray(p.tags) ? p.tags : [],
          notes: p.notes || "",
          createdAt: typeof p.createdAt === "number" ? p.createdAt : now,
          updatedAt: typeof p.updatedAt === "number" ? p.updatedAt : now,
          versions: Array.isArray(p.versions) ? p.versions : undefined,
          currentVersionId: p.currentVersionId,
        });
        validPrompts.push(normalized);
      }
    }

    if (validPrompts.length === 0) {
      return {
        success: false,
        importedCount: 0,
        error: "No valid prompts found in import file.",
      };
    }

    if (mode === "replace") {
      setStorageItem(STORAGE_KEYS.SAVED_PROMPTS, validPrompts);
      return { success: true, importedCount: validPrompts.length };
    }

    // Merge mode: preserve existing, update or add imported
    const currentList = getSavedPrompts();
    const idMap = new Map<string, SavedPrompt>();
    currentList.forEach((p) => idMap.set(p.id, p));

    let newCount = 0;
    validPrompts.forEach((imported) => {
      const existing = idMap.get(imported.id);
      if (!existing) {
        idMap.set(imported.id, imported);
        newCount++;
      } else {
        // Merge versions
        const existingVerIds = new Set(existing.versions?.map((v) => v.id) || []);
        const mergedVersions = [...(existing.versions || [])];
        imported.versions?.forEach((iv) => {
          if (!existingVerIds.has(iv.id)) {
            mergedVersions.push(iv);
          }
        });
        idMap.set(imported.id, {
          ...existing,
          title: imported.title || existing.title,
          tags: Array.from(new Set([...existing.tags, ...imported.tags])),
          versions: mergedVersions,
          updatedAt: Date.now(),
        });
        newCount++;
      }
    });

    const finalList = Array.from(idMap.values());
    setStorageItem(STORAGE_KEYS.SAVED_PROMPTS, finalList);

    return { success: true, importedCount: newCount };
  } catch (err) {
    return {
      success: false,
      importedCount: 0,
      error: err instanceof Error ? err.message : "Failed to parse JSON file.",
    };
  }
}
