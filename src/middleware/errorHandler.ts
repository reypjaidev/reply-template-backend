import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/index.ts";
import { sendError } from "../utils/response.ts";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction, // required — Express needs all 4 args
): void {
  // Known operational error (we threw this intentionally)
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Mongoose validation error
  if (err instanceof Error && err.name === "ValidationError") {
    sendError(res, err.message, 400);
    return;
  }

  // Mongoose duplicate key (e.g. email already exists)
  if (err instanceof Error && "code" in err && (err as any).code === 11000) {
    sendError(res, "Duplicate field value", 409);
    return;
  }

  // JWT errors
  if (err instanceof Error && err.name === "JsonWebTokenError") {
    sendError(res, "Invalid token", 401);
    return;
  }

  if (err instanceof Error && err.name === "TokenExpiredError") {
    sendError(res, "Token expired", 401);
    return;
  }

  // Unknown — don't leak internals to client
  console.error("Unhandled error:", err);
  sendError(res, "Internal server error", 500);
}
