import { Request, Response, NextFunction } from "express";
import { AppError, ERROR_CODES } from "../lib/error";

export function errorMiddleware(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // Prisma known errors
  if ((err as any).code === "P2025") {
    const appError = new AppError({
      case: "record_not_found",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
    res.status(404).json(appError.toJSON());
    return;
  }

  if ((err as any).code === "P2002") {
    const appError = new AppError({
      case: "record_already_exists",
      code: ERROR_CODES.DUPLICATE,
      statusCode: 409,
    });
    res.status(409).json(appError.toJSON());
    return;
  }

  // Unexpected errors
  console.error("Unhandled error:", err);
  res.status(500).json({
    case: "internal_server_error",
    code: ERROR_CODES.SERVER_ERROR,
  });
}
