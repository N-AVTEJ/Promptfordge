/**
 * PromptForge Security Arena Content Filter & Sandbox Hardening
 *
 * Invariants:
 * 1. Output length is strictly capped at 500 characters.
 * 2. Fake flags follow the educational pattern `FLAG{...}` and are never real credentials.
 * 3. No real environment variable, API key, token, or password can EVER appear in output.
 * 4. Accidental secrets, process.env leaks, or bearer tokens are actively scrubbed and replaced with [REDACTED_CREDENTIAL].
 */

export const ARENA_MAX_OUTPUT_LENGTH = 500;
export const ARENA_TRUNCATION_NOTICE = " ...[OUTPUT CAPPED AT 500 CHARACTERS]";

/** Common regex patterns for real-world secrets and tokens */
const SENSITIVE_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Google API Key pattern: AIzaSy + 33 chars
  {
    pattern: /AIzaSy[A-Za-z0-9_-]{33}/gi,
    replacement: "[REDACTED_GOOGLE_API_KEY]",
  },
  // OpenAI API Key pattern: sk- + alphanumeric
  {
    pattern: /sk-[A-Za-z0-9_-]{20,}/gi,
    replacement: "[REDACTED_OPENAI_API_KEY]",
  },
  // Anthropic API Key pattern: sk-ant- + alphanumeric
  {
    pattern: /sk-ant-[A-Za-z0-9_-]{20,}/gi,
    replacement: "[REDACTED_ANTHROPIC_API_KEY]",
  },
  // Bearer tokens
  {
    pattern: /Bearer\s+[A-Za-z0-9_.\-~+/]{20,}=*/gi,
    replacement: "Bearer [REDACTED_BEARER_TOKEN]",
  },
  // JWT tokens (3 base64url segments)
  {
    pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_.\-~+/]{10,}/gi,
    replacement: "[REDACTED_JWT_TOKEN]",
  },
  // Generic key assignments: API_KEY=..., SECRET=..., PASSWORD=...
  {
    pattern:
      /(?:api[-_]?key|secret[-_]?key|auth[-_]?token|access[-_]?token|password|client[-_]?secret)\s*[:=]\s*['"]?([a-zA-Z0-9_\-.~]{8,})['"]?/gi,
    replacement: "[REDACTED_SENSITIVE_CREDENTIAL]",
  },
  // process.env literal dumps (property access, index access, or standalone)
  {
    pattern: /process\.env(?:\.[A-Za-z0-9_]+|\[['"][A-Za-z0-9_]+['"]\])?/gi,
    replacement: "[REDACTED_ENV_VAR]",
  },
  // Private key headers
  {
    pattern: /-----BEGIN\s+(?:RSA|EC|DSA|OPENSSH|PRIVATE)\s+KEY-----[\s\S]*?-----END\s+(?:RSA|EC|DSA|OPENSSH|PRIVATE)\s+KEY-----/gi,
    replacement: "[REDACTED_PRIVATE_KEY]",
  },
];

export interface FilterResult {
  filteredText: string;
  originalLength: number;
  filteredLength: number;
  wasTruncated: boolean;
  redactedCount: number;
  redactedItems: string[];
}

/**
 * Validates that a flag string is an educational fake flag and not a real credential.
 */
export function isEducationalFakeFlag(flag: string): boolean {
  if (typeof flag !== "string") return false;
  const trimmed = flag.trim();
  // Must match format FLAG{lowercase_or_digits_and_underscores}
  if (!/^FLAG\{[a-z0-9_]{4,64}\}$/.test(trimmed)) {
    return false;
  }
  // Must not contain real credential identifiers
  const lower = trimmed.toLowerCase();
  if (
    lower.includes("aizasy") ||
    lower.includes("sk-") ||
    lower.includes("password") ||
    lower.includes("process.env")
  ) {
    return false;
  }
  return true;
}

/**
 * Filters model output for the Arena sandbox:
 * 1. Checks and scrubs actual runtime environment variable values (e.g. GEMINI_API_KEY).
 * 2. Applies regex patterns to scrub any leaked credential shapes.
 * 3. Enforces strict length capping of 500 characters.
 */
export function filterArenaOutput(rawText: string): FilterResult {
  if (!rawText) {
    return {
      filteredText: "",
      originalLength: 0,
      filteredLength: 0,
      wasTruncated: false,
      redactedCount: 0,
      redactedItems: [],
    };
  }

  let text = String(rawText);
  const originalLength = text.length;
  const redactedItems: string[] = [];
  let redactedCount = 0;

  // 1. Scrub actual live process.env values if present in runtime
  if (typeof process !== "undefined" && process.env) {
    const sensitiveEnvKeys = Object.keys(process.env).filter((k) => {
      const upper = k.toUpperCase();
      return (
        upper.includes("KEY") ||
        upper.includes("SECRET") ||
        upper.includes("TOKEN") ||
        upper.includes("PASSWORD") ||
        upper.includes("CREDENTIAL") ||
        upper.includes("AUTH") ||
        upper.includes("PRIVATE") ||
        upper.includes("DATABASE") ||
        upper.includes("SIGNING")
      );
    });

    for (const key of sensitiveEnvKeys) {
      const val = process.env[key];
      if (val && typeof val === "string" && val.trim().length >= 6) {
        const trimmedVal = val.trim();
        if (text.includes(trimmedVal)) {
          text = text.split(trimmedVal).join("[REDACTED_ENV_SECRET]");
          redactedCount++;
          redactedItems.push(`process.env.${key}`);
        }
      }
    }
  }

  // 2. Scrub pattern-matched secrets
  for (const { pattern, replacement } of SENSITIVE_PATTERNS) {
    // Reset regex state if global
    pattern.lastIndex = 0;
    if (pattern.test(text)) {
      pattern.lastIndex = 0;
      text = text.replace(pattern, () => {
        redactedCount++;
        return replacement;
      });
      redactedItems.push(replacement);
    }
  }

  // 3. Length capping: enforce max 500 characters
  let wasTruncated = false;
  if (text.length > ARENA_MAX_OUTPUT_LENGTH) {
    wasTruncated = true;
    const maxSlice = Math.max(0, ARENA_MAX_OUTPUT_LENGTH - ARENA_TRUNCATION_NOTICE.length);
    text = text.slice(0, maxSlice) + ARENA_TRUNCATION_NOTICE;
  }

  return {
    filteredText: text,
    originalLength,
    filteredLength: text.length,
    wasTruncated,
    redactedCount,
    redactedItems: Array.from(new Set(redactedItems)),
  };
}
