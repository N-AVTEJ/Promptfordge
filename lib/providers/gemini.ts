import {
  MissingApiKeyError,
  Provider,
  ProviderError,
  ProviderRunOptions,
  ProviderRunResult,
} from "./types";

export const GEMINI_MODELS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-2.0-flash",
] as const;

export class GeminiProvider implements Provider {
  readonly name = "gemini";
  readonly defaultModel = "gemini-1.5-flash";
  readonly supportedModels = GEMINI_MODELS;

  private resolveApiKey(explicitKey?: string): string | null {
    if (explicitKey && explicitKey.trim().length > 0) {
      return explicitKey.trim();
    }
    const envKey = process.env.GEMINI_API_KEY?.trim();
    return envKey && envKey.length > 0 ? envKey : null;
  }

  isAvailable(apiKey?: string): boolean {
    return this.resolveApiKey(apiKey) !== null;
  }

  async run(options: ProviderRunOptions): Promise<ProviderRunResult> {
    const key = this.resolveApiKey(options.apiKey);
    if (!key) {
      throw new MissingApiKeyError(
        "gemini",
        "Google Gemini API key is missing. Set GEMINI_API_KEY in your environment or provide an x-provider-key header."
      );
    }

    const model = options.model || this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

    const requestBody: Record<string, unknown> = {
      contents: [
        {
          role: "user",
          parts: [{ text: options.prompt }],
        },
      ],
      generationConfig: {
        temperature: options.temperature ?? 0.7,
        ...(options.maxOutputTokens
          ? { maxOutputTokens: options.maxOutputTokens }
          : {}),
      },
    };

    if (options.system && options.system.trim().length > 0) {
      requestBody.systemInstruction = {
        parts: [{ text: options.system.trim() }],
      };
    }

    const startTime = performance.now();

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
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
          // If response body is not JSON, use standard status text
        }
        throw new ProviderError("gemini", errorMessage, response.status);
      }

      const data = await response.json();
      const candidate = data.candidates?.[0];
      const text =
        candidate?.content?.parts
          ?.map((part: { text?: string }) => part.text || "")
          .join("") ?? "";

      const tokensIn =
        data.usageMetadata?.promptTokenCount ??
        Math.max(1, Math.ceil(options.prompt.length / 4));
      const tokensOut =
        data.usageMetadata?.candidatesTokenCount ??
        Math.max(1, Math.ceil(text.length / 4));

      return {
        text,
        tokensIn,
        tokensOut,
        latencyMs,
        finishReason: candidate?.finishReason || "STOP",
      };
    } catch (err: unknown) {
      if (err instanceof ProviderError || err instanceof MissingApiKeyError) {
        throw err;
      }
      const message = err instanceof Error ? err.message : String(err);
      throw new ProviderError("gemini", `Connection failed: ${message}`);
    }
  }
}

export const geminiProvider = new GeminiProvider();
