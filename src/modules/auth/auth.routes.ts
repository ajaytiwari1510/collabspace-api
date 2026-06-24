import { Router } from "express";
import { authController } from "./auth.controller";
import { authenticate } from "@/middleware/auth.middleware";

export const authRouter = Router();

// ── Public routes (no token needed) ─────────────────────────────────
authRouter.post("/api/v1/auth/register", authController.register);
authRouter.post("/api/v1/auth/login", authController.login);
authRouter.post("/api/v1/auth/refresh", authController.refresh);

// ── Protected routes (token required) ───────────────────────────────
authRouter.post("/api/v1/auth/logout", authenticate, authController.logout);
authRouter.get("/api/v1/auth/me", authenticate, authController.me);
