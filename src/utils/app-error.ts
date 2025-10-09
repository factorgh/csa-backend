export interface AppErrorOptions {
  statusCode?: number;
  status?: number; // alias for statusCode compatibility
  isOperational?: boolean;
  details?: unknown;
  code?: string; // optional application-specific error code
  cause?: unknown;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details?: unknown;
  public readonly code?: string;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = "AppError";

    // Prefer explicit statusCode, then status, else 500
    this.statusCode = options.statusCode ?? options.status ?? 500;
    this.isOperational = options.isOperational ?? true; // default to operational for explicitly thrown AppErrors
    this.details = options.details;
    this.code = options.code;

    // Preserve original cause if provided (Node >=16.9 supports Error options)
    if ((options as any).cause) {
      (this as any).cause = (options as any).cause;
    }

    // Maintains proper stack trace for where our error was thrown (only V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export function isAppError(err: any): err is AppError {
  return (
    !!err &&
    typeof err === "object" &&
    (err instanceof AppError ||
      (typeof err.message === "string" &&
        (typeof err.statusCode === "number" ||
          typeof err.status === "number") &&
        typeof err.isOperational === "boolean"))
  );
}
