import type { Request, Response } from "express";
import { authService } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schemas";
import { sendSuccess } from "@/utils/response";
import { AppError } from "@/utils/AppError";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

export const authController = {
  async register(req: Request, res: Response) {
    const body = registerSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError(422, "VALIDATION_ERROR", "Please fix the highlighted fields.", {
        details: body.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
    }

    const { name, email, password } = body.data;
    const result = await authService.register(name, email, password);

    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    sendSuccess(res, { user: result.user, accessToken: result.accessToken }, { statusCode: 201 });
  },

  async login(req: Request, res: Response) {
    const body = loginSchema.safeParse(req.body);
    if (!body.success) {
      throw new AppError(422, "VALIDATION_ERROR", "Please fix the highlighted fields.", {
        details: body.error.issues.map((i) => ({
          field: i.path.join("."),
          message: i.message,
        })),
      });
    }

    const { email, password } = body.data;
    const result = await authService.login(email, password);

    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    sendSuccess(res, { user: result.user, accessToken: result.accessToken });
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) {
      throw new AppError(401, "REFRESH_TOKEN_MISSING", "No refresh token provided.");
    }

    const result = await authService.refresh(token);

    res.cookie("refreshToken", result.refreshToken, COOKIE_OPTIONS);

    sendSuccess(res, { accessToken: result.accessToken });
  },

  async logout(req: Request, res: Response) {
    const userId = req.user?.id;
    if (userId) {
      await authService.logout(userId);
    }
    res.clearCookie("refreshToken");
    sendSuccess(res, {});
  },
};