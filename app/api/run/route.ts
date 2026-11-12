/**
 * PromptForge Prompt Execution API Route
 * POST /api/run
 *
 * Server-side AI route supporting Gemini and OpenAI adapters,
 * per-IP rate limiting, daily token budgets, LRU caching,
 * and optional ephemeral BYOK headers (never logged or stored).
 */

import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { executePrompt } from "@/lib/engine/execute";
import {
  BudgetExhaustedError,
  GuardValidationError,
  RateLimitError,
  guardRequest,
} from "@/lib/engine/guard";
import { MissingApiKeyError, ProviderError } from "@/lib/providers/types";

export const runtime = "nodejs";

function cleanIpString(rawIp: string): string {
  let trimmed = rawIp.trim();
  // Strip mapped IPv4 prefix ::ffff:
  if (trimmed.startsWith("::ffff:")) {
    trimmed = trimmed.slice(7);
  }
  // Strip port from IPv4 with port: 203.0.113.195:443 -> 203.0.113.195
  if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(trimmed)) {
    return trimmed.split(":")[0];
  }
  // Strip port/brackets from bracketed IPv6: [2001:db8::1]:8080 -> 2001:db8::1
  const bracketMatch = /^\[([a-fA-F0-9:]+)\](?::\d+)?$/.exec(trimmed);
  if (bracketMatch && bracketMatch[1]) {
    return bracketMatch[1];
  }
  return trimmed;
}

function extractClientIp(req: NextRequest): string {
  const reqIp = (req as unknown as { ip?: string }).ip;
  if (reqIp && reqIp.trim().length > 0) {
    return cleanIpString(reqIp);
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return cleanIpString(firstIp);
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return cleanIpString(realIp);

  return "127.0.0.1";
}

function extractByokKey(req: NextRequest): string | undefined {
  // Support Authorization: Bearer <key>
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    const token = auth.slice(7).trim();
    if (token.length > 0) return token;
  }

  // Support standard Bring-Your-Own-Key headers
  const key =
    req.headers.get("x-provider-key") ||
    req.headers.get("x-api-key") ||
    req.headers.get("x-gemini-key") ||
    req.headers.get("x-openai-key");

  if (key && key.trim().length > 0) {
    return key.trim();
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  const clientIp = extractClientIp(req);
  const byokKey = extractByokKey(req);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "Malformed JSON payload in request body.",
        },
      },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "Request body must be a valid JSON object.",
        },
      },
      { status: 400 }
    );
  }

  const payload = body as Record<string, unknown>;

  try {
    const promptStr = typeof payload.prompt === "string" ? payload.prompt : "";
    const maxOutputTokens =
      typeof payload.maxOutputTokens === "number"
        ? payload.maxOutputTokens
        : undefined;

    // Route Guard step: enforce payload bounds, daily budget hard stop, and per-IP rate limit
    guardRequest({
      ip: clientIp,
      prompt: promptStr,
      maxOutputTokens,
    });

    const result = await executePrompt({
      prompt: promptStr,
      system: typeof payload.system === "string" ? payload.system : undefined,
      model: typeof payload.model === "string" ? payload.model : undefined,
      temperature:
        typeof payload.temperature === "number"
          ? payload.temperature
          : undefined,
      maxOutputTokens,
      skipCache: Boolean(payload.skipCache),
      apiKey: byokKey,
      ip: clientIp,
      skipRateLimit: true, // Route guard already enforced and tracked per-IP rate limit
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: unknown) {
    // 1. Zod input validation errors
    if (err instanceof ZodError) {
      const firstIssue = err.issues[0];
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            message: firstIssue?.message || "Invalid input parameters.",
            issues: err.issues,
          },
        },
        { status: 400 }
      );
    }

    // 2. Guard validation errors (length/bounds)
    if (err instanceof GuardValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_INPUT",
            field: err.field,
            message: err.message,
          },
        },
        { status: 400 }
      );
    }

    // 3. Per-IP Rate Limit
    if (err instanceof RateLimitError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: err.message,
            retryAfterSeconds: err.retryAfterSeconds,
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(err.retryAfterSeconds),
          },
        }
      );
    }

    // 4. Global Daily Budget Hard Stop
    if (err instanceof BudgetExhaustedError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "BUDGET_EXHAUSTED",
            message: err.message,
            currentUsage: err.currentUsage,
            dailyBudget: err.dailyBudget,
          },
        },
        { status: 429 }
      );
    }

    // 5. Missing API Key
    if (err instanceof MissingApiKeyError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_API_KEY",
            provider: err.provider,
            message: err.message,
          },
        },
        { status: 400 }
      );
    }

    // 6. Provider Failure
    if (err instanceof ProviderError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "PROVIDER_FAILURE",
            provider: err.provider,
            message: err.message,
            statusCode: err.statusCode,
          },
        },
        { status: 502 }
      );
    }

    // 7. Generic Internal Error
    const fallbackMessage =
      err instanceof Error
        ? err.message
        : "An unexpected engine error occurred.";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: fallbackMessage,
        },
      },
      { status: 500 }
    );
  }
}
