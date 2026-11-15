/**
 * PromptForge Security Arena API Route
 * POST /api/arena/run
 *
 * Implements strict security sandbox invariants:
 * - Rate limiting stricter than standard labs
 * - Content filtering (process.env and real credentials actively scrubbed)
 * - Output length capped at 500 characters
 * - Fake educational flags only
 * - No external tools attached to target models
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  executeLevelAttack,
  executeCompareAttack,
  executeRedVsBlueChallenge,
} from "@/lib/arena/engine";
import {
  ArenaRateLimitError,
  checkArenaRateLimit,
} from "@/lib/arena/rate-limiter";
import { COMPARE_SCENARIOS } from "@/lib/arena/compare-scenarios";

export const runtime = "nodejs";

const LevelModeSchema = z.object({
  mode: z.literal("level"),
  levelId: z.number().int().min(1).max(5),
  attackPayload: z.string().max(2000, "Attack payload exceeds 2000 character limit"),
});

const CompareModeSchema = z.object({
  mode: z.literal("compare"),
  attackPayload: z.string().max(2000, "Attack payload exceeds 2000 character limit"),
  scenarioId: z.string().optional(),
  vulnerableSystem: z.string().max(3000).optional(),
  defendedSystem: z.string().max(3000).optional(),
  defenseTechniqueName: z.string().optional(),
});

const RedVsBlueModeSchema = z.object({
  mode: z.literal("red-vs-blue"),
  defensePrompt: z
    .string()
    .trim()
    .min(1, "Defense prompt cannot be empty")
    .max(4000, "Defense prompt exceeds 4000 character limit"),
});

const ArenaRequestSchema = z.discriminatedUnion("mode", [
  LevelModeSchema,
  CompareModeSchema,
  RedVsBlueModeSchema,
]);

function extractClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

function extractByokKey(req: NextRequest): string | undefined {
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ")) {
    const key = auth.slice(7).trim();
    if (key.length > 0) return key;
  }
  const custom = req.headers.get("x-byok-api-key");
  if (custom && custom.trim().length > 0) {
    return custom.trim();
  }
  return undefined;
}

export async function POST(req: NextRequest) {
  const ip = extractClientIp(req);
  const byokKey = extractByokKey(req);

  // 1. Rate limiting check
  try {
    checkArenaRateLimit(ip);
  } catch (err) {
    if (err instanceof ArenaRateLimitError) {
      return NextResponse.json(
        {
          error: "ARENA_RATE_LIMITED",
          message: err.message,
          limit: err.limit,
          retryAfterSeconds: err.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(err.retryAfterSeconds),
          },
        }
      );
    }
  }

  // 2. Parse request JSON
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "INVALID_JSON", message: "Malformed JSON in request body." },
      { status: 400 }
    );
  }

  // 3. Validate schema
  const parsed = ArenaRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "VALIDATION_ERROR",
        message: "Invalid arena request format.",
        details: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  // 4. Execution dispatch
  try {
    const data = parsed.data;
    switch (data.mode) {
      case "level": {
        const result = await executeLevelAttack(
          data.levelId,
          data.attackPayload,
          { ip, apiKey: byokKey, skipRateLimit: true }
        );
        return NextResponse.json(result);
      }

      case "compare": {
        let scenario = COMPARE_SCENARIOS.find(
          (s) => s.id === data.scenarioId
        );
        if (!scenario) {
          scenario = COMPARE_SCENARIOS[0];
        }

        const result = await executeCompareAttack(
          {
            attackPayload: data.attackPayload,
            vulnerableSystem:
              data.vulnerableSystem || scenario.vulnerableSystem,
            defendedSystem:
              data.defendedSystem || scenario.defendedSystem,
            defenseTechniqueName:
              data.defenseTechniqueName || scenario.defenseTechniqueName,
          },
          { ip, apiKey: byokKey, skipRateLimit: true }
        );
        return NextResponse.json(result);
      }

      case "red-vs-blue": {
        const result = await executeRedVsBlueChallenge(
          data.defensePrompt,
          { ip, apiKey: byokKey, skipRateLimit: true }
        );
        return NextResponse.json(result);
      }

      default: {
        return NextResponse.json(
          { error: "UNKNOWN_MODE", message: "Unsupported arena mode." },
          { status: 400 }
        );
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal arena execution error";
    return NextResponse.json(
      { error: "ARENA_EXECUTION_ERROR", message },
      { status: 500 }
    );
  }
}
