/**
 * PromptForge Provider Interfaces & Types
 * Shared AI Backend (Phase 3)
 */

export interface ProviderRunOptions {
  prompt: string;
  system?: string;
  temperature?: number;
  maxOutputTokens?: number;
  apiKey?: string;
  model?: string;
}

export interface ProviderRunResult {
  text: string;
  tokensIn: number;
  tokensOut: number;
  latencyMs: number;
  finishReason?: string;
}

export interface Provider {
  /** Unique provider identifier e.g. "gemini" | "openai" */
  readonly name: string;
  /** Default model identifier for this provider */
  readonly defaultModel: string;
  /** List of model IDs supported by this provider */
  readonly supportedModels: readonly string[];
  /** Check if the provider is configured and available to execute calls */
  isAvailable(apiKey?: string): boolean;
  /** Execute prompt against provider endpoint */
  run(options: ProviderRunOptions): Promise<ProviderRunResult>;
}

export class MissingApiKeyError extends Error {
  readonly code = "MISSING_API_KEY";
  readonly provider: string;

  constructor(provider: string, message?: string) {
    super(
      message ||
        `No API key configured for provider "${provider}". Please configure the server environment variable or supply your own key.`
    );
    this.name = "MissingApiKeyError";
    this.provider = provider;
  }
}

export class ProviderError extends Error {
  readonly code = "PROVIDER_FAILURE";
  readonly provider: string;
  readonly statusCode?: number;

  constructor(provider: string, message: string, statusCode?: number) {
    super(`[${provider}] ${message}`);
    this.name = "ProviderError";
    this.provider = provider;
    this.statusCode = statusCode;
  }
}
