import { geminiProvider } from "./gemini";
import { openaiProvider } from "./openai";
import { Provider } from "./types";

export * from "./gemini";
export * from "./openai";
export * from "./types";

const providersByName: Record<string, Provider> = {
  gemini: geminiProvider,
  openai: openaiProvider,
};

export function getProvider(nameOrModel: string): Provider {
  const normalized = nameOrModel.toLowerCase();

  // Match provider name directly
  if (providersByName[normalized]) {
    return providersByName[normalized];
  }

  // Match supported model
  if (
    geminiProvider.supportedModels.some((m) => m.toLowerCase() === normalized)
  ) {
    return geminiProvider;
  }
  if (
    openaiProvider.supportedModels.some((m) => m.toLowerCase() === normalized)
  ) {
    return openaiProvider;
  }

  // Model prefix heuristics
  if (normalized.startsWith("gemini")) {
    return geminiProvider;
  }
  if (normalized.startsWith("gpt-") || normalized.startsWith("openai")) {
    return openaiProvider;
  }

  // Default provider is Gemini
  return geminiProvider;
}

export function listAvailableProviders(): Array<{
  name: string;
  defaultModel: string;
  supportedModels: readonly string[];
  isAvailable: boolean;
}> {
  return [
    {
      name: geminiProvider.name,
      defaultModel: geminiProvider.defaultModel,
      supportedModels: geminiProvider.supportedModels,
      isAvailable: geminiProvider.isAvailable(),
    },
    {
      name: openaiProvider.name,
      defaultModel: openaiProvider.defaultModel,
      supportedModels: openaiProvider.supportedModels,
      isAvailable: openaiProvider.isAvailable(),
    },
  ];
}
