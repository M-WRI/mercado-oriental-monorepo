import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async Express handler so thrown errors are forwarded to the error middleware.
 * Controllers can simply `throw new AppError(...)` instead of try/catch + res.status().
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
