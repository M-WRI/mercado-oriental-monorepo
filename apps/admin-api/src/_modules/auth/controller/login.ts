import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";

const JWT_SECRET = process.env.JWT_SECRET || "mercado-oriental-secret";

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError({
      case: "login_credentials",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  if (typeof email !== "string" || !email.includes("@")) {
    throw new AppError({
      case: "login_email_format",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (!user) {
    throw new AppError({
      case: "login_credentials",
      code: ERROR_CODES.INVALID,
      statusCode: 401,
    });
  }

  const isValidPassword = await bcrypt.compare(password, user.password);

  if (!isValidPassword) {
    throw new AppError({
      case: "login_credentials",
      code: ERROR_CODES.INVALID,
      statusCode: 401,
    });
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(200).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  });
});
