import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import type { CustomerAuthenticatedRequest } from "../../../middleware/customerAuthMiddleware";

export const me = asyncHandler(async (req: CustomerAuthenticatedRequest, res: Response) => {
  const customerId = req.customer?.customerId;

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      createdAt: true,
    },
  });

  if (!customer) {
    throw new AppError({
      case: "customer",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  res.status(200).json(customer);
});
