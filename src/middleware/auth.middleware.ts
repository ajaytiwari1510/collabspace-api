import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { AppError } from "@/utils/AppError";

export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "UNAUTHENTICATED", "Missing or invalid Authorization header");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw new AppError(401, "UNAUTHENTICATED", "Token missing");
    }

    const publicKey = Buffer.from(env.JWT_PUBLIC_KEY_BASE64, "base64").toString("utf8");

    const payload = jwt.verify(token, publicKey, {
      algorithms: ["RS256"],
    }) as unknown as {
      sub: string;
      email: string;
      role: "user" | "admin";
    };

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
      return;
    }
    next(new AppError(401, "UNAUTHENTICATED", "Invalid or expired token"));
  }
}