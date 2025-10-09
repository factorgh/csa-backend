import { Request, Response, NextFunction } from "express";
import { isAppError } from "../utils/app-error";

export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // If headers are already sent, delegate to the default Express error handler
  if (res.headersSent) {
    return _next(err);
  }

  // Normalize error to an AppError-like shape
  const statusCode: number = err?.statusCode || err?.status || 500;
  const isOperational: boolean = isAppError(err)
    ? err.isOperational
    : // treat common validation/auth errors as operational if they provide a 4xx status
      typeof statusCode === "number" && statusCode >= 400 && statusCode < 500;

  const inProduction = process.env.NODE_ENV === "production";

  // Determine what to expose to the client
  const clientMessage =
    inProduction && !isOperational
      ? "Internal Server Error"
      : err?.message || "Internal Server Error";

  // Normalize details for the client
  let clientDetails: any;
  if (inProduction) {
    // In production, expose only validation messages (not full details objects)
    if (Array.isArray(err?.details)) {
      const msgs = err.details
        .map((d: any) =>
          typeof d === "string"
            ? d
            : typeof d?.message === "string"
            ? d.message
            : undefined
        )
        .filter(Boolean);
      if (msgs.length === 1) clientDetails = msgs[0];
      else if (msgs.length > 1) clientDetails = msgs.join(", ");
    } else if (typeof err?.details?.message === "string") {
      clientDetails = err.details.message;
    } else if (typeof err?.details === "string") {
      clientDetails = err.details;
    } else {
      clientDetails = undefined;
    }
  } else {
    // Non-production: include full details for easier debugging
    clientDetails = err?.details;
  }

  const clientCode = inProduction && !isOperational ? undefined : err?.code;

  const payload: any = {
    success: false,
    message: clientMessage,
    ...(clientCode ? { code: clientCode } : {}),
    ...(clientDetails ? { details: clientDetails } : {}),
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
  };

  // Always log server-side; include stack to logs if available
  // eslint-disable-next-line no-console
  console.error("ErrorHandler:", {
    message: err?.message,
    statusCode,
    isOperational,
    code: err?.code,
    details: err?.details,
    stack: err?.stack,
    path: req.originalUrl,
    method: req.method,
  });

  // Only include stack in client payload in non-production for easier debugging
  if (!inProduction && err?.stack) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};
