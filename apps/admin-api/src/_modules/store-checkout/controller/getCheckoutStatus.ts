import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import { CustomerAuthenticatedRequest } from "../../../middleware/customerAuthMiddleware";

export const getCheckoutStatus = asyncHandler(async (req: CustomerAuthenticatedRequest, res: Response) => {
  const customerId = req.customer!.customerId;
  const { session_id: sessionId } = req.query as { session_id?: string };

  if (!sessionId) {
    throw new AppError({ case: "session_id", code: ERROR_CODES.MISSING, statusCode: 400 });
  }

  const checkout = await prisma.checkoutSession.findFirst({
    where: { stripeSessionId: sessionId, customerId },
    include: {
      orders: {
        select: {
          id: true,
          status: true,
          paymentStatus: true,
          totalAmount: true,
          shopId: true,
        },
      },
    },
  });

  if (!checkout) {
    throw new AppError({ case: "checkout", code: ERROR_CODES.NOT_FOUND, statusCode: 404 });
  }

  return res.json({
    id: checkout.id,
    status: checkout.status,
    totalAmount: checkout.totalAmount,
    orders: checkout.orders,
  });
});
