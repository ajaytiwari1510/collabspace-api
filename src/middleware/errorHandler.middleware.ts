import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "@/utils/AppError";
import { logger } from "@/config/logger";
import { isProd } from "@/config/env";
import type { ApiErrorBody } from "@/types/api.types";

/**
 * Global error handler — ALL errors pass through here.
 * Per Architecture Document Section 3.4. Must be registered LAST in
 * the Express middleware stack (after all routes).
 *
 * - AppError (operational): formatted to the client as-is.
 * - ZodError (validation, if it escapes the validate middleware):
 *   formatted as a 422 VALIDATION_ERROR.
 * - Anything else: treated as a programming error — logged in full,
 *   client sees a generic 500 message only, no stack trace or
 *   internal details ever leaked.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    if (!err.isOperational) {
      logger.error("Non-operational AppError", {
        requestId: req.requestId,
        message: err.message,
        stack: err.stack,
      });
    }

    const body: ApiErrorBody = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  if (err instanceof ZodError) {
    const body: ApiErrorBody = {
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Please fix the highlighted fields.",
        details: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      },
    };
    res.status(422).json(body);
    return;
  }

  // Unhandled / programming error — log full detail, never expose it.
  logger.error("Unhandled error", {
    requestId: req.requestId,
    message: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  });

  const body: ApiErrorBody = {
    success: false,
    error: {
      code: "SERVER_ERROR",
      message: isProd
        ? "Something went wrong on our end. Please try again."
        : err instanceof Error
          ? err.message
          : String(err),
    },
  };
  res.status(500).json(body);
}
