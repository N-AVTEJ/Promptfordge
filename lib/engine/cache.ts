/**
 * PromptForge In-Memory LRU Cache & Hashing Engine
 * Designed with a pluggable CacheStore interface so Redis or Upstash
 * can replace it in multi-node production setups.
 */

import { createHash } from "node:crypto";
import { ENGINE_CONFIG } from "./config";

export interface CacheStore<T = unknown> {
  get(key: string): Promise<T | null> | T | null;
  set(key: string, value: T, ttlMs?: number): Promise<void> | void;
  has(key: string): Promise<boolean> | boolean;
  delete(key: string): Promise<boolean> | boolean;
  clear(): Promise<void> | void;
  size(): number;
}

export interface CacheKeyParams {
  prompt: string;
  model: string;
  temperature?: number;
  system?: string;
}

/**
 * Computes a deterministic SHA-256 hash of normalized prompt + model + temperature + system.
 * Uses structured JSON encoding to mathematically prevent delimiter collision injection.
 */
export function computeCacheKey(params: CacheKeyParams): string {
  const normalizedModel = (params.model || "default").trim().toLowerCase();
  const normalizedPrompt = (params.prompt || "").trim();
  const normalizedSystem = (params.system || "").trim();
  const normalizedTemp = (params.temperature ?? 0.7).toFixed(2);

  // Canonical structured JSON prevents delimiter collision vulnerabilities
  const canonicalString = JSON.stringify({
    m: normalizedModel,
    p: normalizedPrompt,
    s: normalizedSystem,
    t: normalizedTemp,
  });

  const hash = createHash("sha256")
    .update(canonicalString, "utf8")
    .digest("hex");
  return `pf_run_${hash}`;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export class MemoryLruCache<T = unknown> implements CacheStore<T> {
  private readonly maxEntries: number;
  private readonly defaultTtlMs: number;
  private readonly store = new Map<string, CacheEntry<T>>();

  constructor(
    maxEntries = ENGINE_CONFIG.cacheMaxEntries,
    defaultTtlMs = ENGINE_CONFIG.cacheTtlMs
  ) {
    this.maxEntries = maxEntries;
    this.defaultTtlMs = defaultTtlMs;
  }

  get(key: string): T | null {
    if (this.maxEntries <= 0) return null;
    const entry = this.store.get(key);
    if (!entry) return null;

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    // Refresh LRU order (delete & re-insert moves to end)
    this.store.delete(key);
    this.store.set(key, entry);

    return entry.value;
  }

  set(key: string, value: T, ttlMs?: number): void {
    if (this.maxEntries <= 0) return;
    const ttl = ttlMs ?? this.defaultTtlMs;
    const expiresAt = Date.now() + ttl;

    // If key already exists, delete it first to reposition
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxEntries) {
      // Evict least recently used (first item in Map)
      const oldestKey = this.store.keys().next().value;
      if (oldestKey !== undefined) {
        this.store.delete(oldestKey);
      }
    }

    this.store.set(key, { value, expiresAt });
  }

  has(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  size(): number {
    return this.store.size;
  }
}

// Global singleton cache instance for the execution engine
export const engineCache = new MemoryLruCache<unknown>();
