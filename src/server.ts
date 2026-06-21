import express, { type Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env } from "@/config/env";
import { logger } from "@/config/logger";
import { requestId } from "@/middleware/requestId.middleware";
import { errorHandler } from "@/middleware/errorHandler.middleware";
import { healthRouter } from "@/modules/health/health.routes";

/**
 * Express application factory.
 *
 * Per Architecture Document Section 1.2 (Request Lifecycle) and
 * Section 6.2 (API Security Layers). Middleware order matters:
 *   requestId -> security headers -> CORS -> body parsing -> logging
 *   -> routes -> 404 handler -> global error handler (always last)
 *
 * No business feature routes are mounted yet — modules/ is empty
 * except for health, per this setup's explicit scope.
 */
export function createApp(): Application {
  const app = express();

  app.set("trust proxy", 1); // required behind NGINX/Cloudflare per Architecture Doc

  app.use(requestId);
  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true, // required for the refresh_token HttpOnly cookie
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.COOKIE_SECRET));
  app.use(
    morgan("combined", {
      stream: { write: (msg: string) => logger.http?.(msg.trim()) ?? logger.info(msg.trim()) },
    }),
  );

  // ── Routes ──────────────────────────────────────────────────────────
  // Health checks are infrastructure, not a business feature — see
  // health.routes.ts. All future feature routers (auth, profiles,
  // projects, etc.) mount here under /api/v1 as each module is built.
  app.use(healthRouter);

  // ── 404 handler ─────────────────────────────────────────────────────
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: { code: "NOT_FOUND", message: `No route for ${req.method} ${req.path}` },
    });
  });

  // ── Global error handler — MUST be last ─────────────────────────────
  app.use(errorHandler);

  return app;
}
