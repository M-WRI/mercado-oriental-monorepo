import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppError, ERROR_CODES } from "../lib";

const JWT_SECRET = process.env.JWT_SECRET || "mercado-oriental-secret";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new AppError({
      case: "auth_token",
      code: ERROR_CODES.MISSING,
      statusCode: 401,
    });
    res.status(401).json(error.toJSON());
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
    };

    req.user = decoded;
    next();
  } catch {
    const error = new AppError({
      case: "auth_token",
      code: ERROR_CODES.INVALID,
      statusCode: 401,
    });
    res.status(401).json(error.toJSON());
  }
}
