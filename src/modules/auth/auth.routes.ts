import { Router } from "express";
import { authController } from "./auth.controller";

export const authRouter = Router();

authRouter.post("/api/v1/auth/register", authController.register);
authRouter.post("/api/v1/auth/login", authController.login);
authRouter.post("/api/v1/auth/refresh", authController.refresh);
authRouter.post("/api/v1/auth/logout", authController.logout);