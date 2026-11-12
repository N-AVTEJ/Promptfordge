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
} from "@/lib/engine/guard";
import { MissingApiKeyError, ProviderError } from "@/lib/providers/types";

export const runtime = "nodejs";

function extractClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "127.0.0.1";
}

function extractByokKey(req: NextRequest): string | undefined {
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
    const result = await executePrompt({
      prompt: typeof payload.prompt === "string" ? payload.prompt : "",
      system: typeof payload.system === "string" ? payload.system : undefined,
      model: typeof payload.model === "string" ? payload.model : undefined,
      temperature:
        typeof payload.temperature === "number" ? payload.temperature : undefined,
      maxOutputTokens:
        typeof payload.maxOutputTokens === "number"
          ? payload.maxOutputTokens
          : undefined,
      skipCache: Boolean(payload.skipCache),
      apiKey: byokKey,
      ip: clientIp,
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
      err instanceof Error ? err.message : "An unexpected engine error occurred.";
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
