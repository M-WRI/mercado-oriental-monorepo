import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import type { CustomerAuthenticatedRequest } from "../../../middleware/customerAuthMiddleware";

export const updateProfile = asyncHandler(async (req: CustomerAuthenticatedRequest, res: Response) => {
  const customerId = req.customer?.customerId;
  const { name, phone } = req.body;

  if (!name && !phone) {
    throw new AppError({
      case: "customer_profile",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new AppError({
      case: "customer",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  const updated = await prisma.customer.update({
    where: { id: customerId },
    data: {
      ...(name !== undefined && { name: name.trim() || null }),
      ...(phone !== undefined && { phone: phone.trim() || null }),
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      createdAt: true,
    },
  });

  res.status(200).json(updated);
});
