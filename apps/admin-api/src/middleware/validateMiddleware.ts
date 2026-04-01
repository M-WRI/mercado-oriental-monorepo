import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { AppError, ERROR_CODES } from "../lib/error";

export function validateRequest(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed; // Override body with validated and parsed data
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        throw new AppError({
          case: "validation_error",
          code: ERROR_CODES.INVALID,
          statusCode: 400,
          payload: error.errors,
        });
      }
      next(error);
    }
  };
}
