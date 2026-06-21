import { Router } from "express";
import { checkDatabaseConnection } from "@/config/database";
import { checkRedisConnection } from "@/config/redis";
import { sendSuccess } from "@/utils/response";

/**
 * Health check endpoints. Not a business feature — infrastructure
 * verification only, per Architecture Document Section 7.4.
 *
 * GET /health        liveness  — process is up, no dependency checks
 * GET /health/ready   readiness — actually queries Postgres + Redis
 */
export const healthRouter = Router();

const startedAt = Date.now();

healthRouter.get("/health", (_req, res) => {
  sendSuccess(res, {
    status: "ok",
    uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
  });
});

healthRouter.get("/health/ready", async (_req, res) => {
  const checks: Record<string, "ok" | "error"> = {
    database: "ok",
    redis: "ok",
  };

  try {
    await checkDatabaseConnection();
  } catch {
    checks.database = "error";
  }

  try {
    await checkRedisConnection();
  } catch {
    checks.redis = "error";
  }

  const allHealthy = Object.values(checks).every((s) => s === "ok");
  sendSuccess(res, { status: allHealthy ? "ok" : "degraded", checks }, {
    statusCode: allHealthy ? 200 : 503,
  });
});
