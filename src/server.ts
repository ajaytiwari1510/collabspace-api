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
import { authRouter } from "@/modules/auth/auth.routes";

// 1. ADDED: Import the new profile router
import profileRouter from "@/modules/profile/profile.routes"; 

/**
 * Express application factory.
 *
 * Per Architecture Document Section 1.2 (Request Lifecycle) and
 * Section 6.2 (API Security Layers). Middleware order matters:
 * requestId -> security headers -> CORS -> body parsing -> logging
 * -> routes -> 404 handler -> global error handler (always last)
 */
export function createApp(): Application {
  const app = express();

  app.set("trust proxy", 1); // required behind NGINX/Cloudflare per Architecture Doc

  app.use(requestId);
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => {
        const allowed = env.CORS_ORIGIN.split(',').map(o => o.trim());
        if (!origin || allowed.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: origin ${origin} not allowed`));
        }
      },
      credentials: true,
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
  app.use(healthRouter);
  app.use(authRouter);
  
  // 2. ADDED: Mount the profile router to the /api/v1/profile path
  app.use("/api/v1/profile", profileRouter);

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