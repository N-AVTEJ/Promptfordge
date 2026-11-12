import {
  MissingApiKeyError,
  Provider,
  ProviderError,
  ProviderRunOptions,
  ProviderRunResult,
} from "./types";

export const OPENAI_MODELS = ["gpt-4o-mini", "gpt-4o"] as const;

export class OpenAIProvider implements Provider {
  readonly name = "openai";
  readonly defaultModel = "gpt-4o-mini";
  readonly supportedModels = OPENAI_MODELS;

  private resolveApiKey(explicitKey?: string): string | null {
    if (explicitKey && explicitKey.trim().length > 0) {
      return explicitKey.trim();
    }
    const envKey = process.env.OPENAI_API_KEY?.trim();
    return envKey && envKey.length > 0 ? envKey : null;
  }

  isAvailable(apiKey?: string): boolean {
    return this.resolveApiKey(apiKey) !== null;
  }

  async run(options: ProviderRunOptions): Promise<ProviderRunResult> {
    const key = this.resolveApiKey(options.apiKey);
    if (!key) {
      throw new MissingApiKeyError(
        "openai",
        "OpenAI adapter is disabled cleanly: no OPENAI_API_KEY set. Supply a key via header or set OPENAI_API_KEY in the environment."
      );
    }

    const model = options.model || this.defaultModel;
    const url = "https://api.openai.com/v1/chat/completions";

    const messages: Array<{ role: "system" | "user"; content: string }> = [];
    if (options.system && options.system.trim().length > 0) {
      messages.push({ role: "system", content: options.system.trim() });
    }
    messages.push({ role: "user", content: options.prompt });

    const requestBody: Record<string, unknown> = {
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      ...(options.maxOutputTokens
        ? { max_tokens: options.maxOutputTokens }
        : {}),
    };

    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify(requestBody),
      });

      const latencyMs = Math.round(performance.now() - startTime);

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status} (${response.statusText})`;
        try {
          const errorData = await response.json();
          if (errorData?.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch {
          // Non-JSON fallback
        }
        throw new ProviderError("openai", errorMessage, response.status);
      }

      const data = await response.json();
      const choice = data.choices?.[0];
      const text = choice?.message?.content ?? "";

      const tokensIn =
        data.usage?.prompt_tokens ??
        Math.max(1, Math.ceil(options.prompt.length / 4));
      const tokensOut =
        data.usage?.completion_tokens ??
        Math.max(1, Math.ceil(text.length / 4));

      return {
        text,
        tokensIn,
        tokensOut,
        latencyMs,
        finishReason: choice?.finish_reason || "stop",
      };
    } catch (err: unknown) {
      if (err instanceof ProviderError || err instanceof MissingApiKeyError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new ProviderError("openai", `Connection failed: ${message}`);
    }
  }
}

export const openaiProvider = new OpenAIProvider();
