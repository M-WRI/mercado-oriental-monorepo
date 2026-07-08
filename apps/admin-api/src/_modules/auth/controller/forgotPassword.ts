import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import { emailPasswordReset } from "../../../lib/email";
import { getEmailConfig } from "../../../lib/email/config";

const JWT_SECRET = process.env.JWT_SECRET || "mercado-oriental-secret";
const RESET_EXPIRY = "1h";

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };

  if (!email || typeof email !== "string" || !email.includes("@")) {
    throw new AppError({
      case: "forgot_password_email",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  const normalized = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: normalized } });

  // Always return success to avoid email enumeration
  if (user) {
    const token = jwt.sign(
      { userId: user.id, purpose: "password_reset", nonce: crypto.randomUUID() },
      JWT_SECRET,
      { expiresIn: RESET_EXPIRY }
    );
    const { adminWebUrl } = getEmailConfig();
    const resetUrl = `${adminWebUrl}/reset-password?token=${encodeURIComponent(token)}`;

    emailPasswordReset({ to: user.email, resetUrl }).catch((err) =>
      console.error("[email] password reset failed:", err)
    );
  }

  res.json({ message: "If an account exists, a reset link has been sent." });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body as { token?: string; newPassword?: string };

  if (!token || !newPassword) {
    throw new AppError({
      case: "reset_password",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  if (typeof newPassword !== "string" || newPassword.length < 8) {
    throw new AppError({
      case: "reset_password_length",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  let decoded: { userId?: string; purpose?: string };
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { userId?: string; purpose?: string };
  } catch {
    throw new AppError({
      case: "reset_password_token",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  if (decoded.purpose !== "password_reset" || !decoded.userId) {
    throw new AppError({
      case: "reset_password_token",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user) {
    throw new AppError({
      case: "user",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(newPassword, 10) },
  });

  res.json({ message: "Password updated successfully." });
});
