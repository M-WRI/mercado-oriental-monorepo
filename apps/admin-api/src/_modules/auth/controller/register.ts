import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";

const JWT_SECRET = process.env.JWT_SECRET || "mercado-oriental-secret";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    throw new AppError({
      case: "register_credentials",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  if (typeof email !== "string" || !email.includes("@")) {
    throw new AppError({
      case: "register_email_format",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  if (typeof password !== "string" || password.length < 6) {
    throw new AppError({
      case: "register_password_length",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
  });

  if (existingUser) {
    throw new AppError({
      case: "register_email",
      code: ERROR_CODES.DUPLICATE,
      statusCode: 409,
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: name?.trim() || undefined,
    },
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
    token,
  });
});
