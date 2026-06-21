/**
 * Custom application error class.
 *
 * Per Architecture Document Section 3.4 (Error Handling Strategy).
 * Service-layer code throws AppError with a machine-readable code;
 * the global error handler middleware (errorHandler.middleware.ts)
 * formats it into the standard ApiErrorBody envelope.
 *
 * isOperational distinguishes expected failures (bad input, not found,
 * etc. — safe to show the client) from programming errors (bugs — log
 * to Sentry, show a generic message, never leak internals).
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Array<{ field: string; message: string }>;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    options?: {
      isOperational?: boolean;
      details?: Array<{ field: string; message: string }>;
    },
  ) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = options?.isOperational ?? true;
    this.details = options?.details;

    Error.captureStackTrace(this, this.constructor);
  }
}
