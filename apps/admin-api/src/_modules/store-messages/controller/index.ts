import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import { CustomerAuthenticatedRequest } from "../../../middleware/customerAuthMiddleware";

export const createMessage = asyncHandler(async (req: CustomerAuthenticatedRequest, res: Response) => {
  const customerId = req.customer!.customerId;
  const { orderId } = req.params;
  const { body } = req.body as { body: string };

  if (!body || typeof body !== "string" || !body.trim()) {
    throw new AppError({ case: "message_body", code: ERROR_CODES.MISSING, statusCode: 400 });
  }

  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId },
    select: { id: true },
  });
  if (!order) {
    throw new AppError({ case: "order", code: ERROR_CODES.NOT_FOUND, statusCode: 404 });
  }

  const message = await prisma.orderMessage.create({
    data: {
      orderId,
      sender: "customer",
      body: body.trim(),
    },
  });

  return res.status(201).json(message);
});

export const listMessages = asyncHandler(async (req: CustomerAuthenticatedRequest, res: Response) => {
  const customerId = req.customer!.customerId;
  const { orderId } = req.params;

  const order = await prisma.order.findFirst({
    where: { id: orderId, customerId },
    select: { id: true },
  });
  if (!order) {
    throw new AppError({ case: "order", code: ERROR_CODES.NOT_FOUND, statusCode: 404 });
  }

  const messages = await prisma.orderMessage.findMany({
    where: { orderId },
    orderBy: { createdAt: "asc" },
  });

  return res.json(messages);
});
