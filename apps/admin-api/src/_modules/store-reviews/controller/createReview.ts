import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler } from "../../../lib";
import { CustomerAuthenticatedRequest } from "../../../middleware/customerAuthMiddleware";

export const createReview = asyncHandler(async (req: CustomerAuthenticatedRequest, res: Response) => {
  const customerId = req.customer!.customerId;
  const { productId } = req.params;
  const { rating, title, body } = req.body as { rating: number; title?: string; body: string };

  if (!rating || rating < 1 || rating > 5) {
    throw new AppError({ case: "review_rating", code: ERROR_CODES.INVALID, statusCode: 400 });
  }
  if (!body || typeof body !== "string" || !body.trim()) {
    throw new AppError({ case: "review_body", code: ERROR_CODES.MISSING, statusCode: 400 });
  }

  const product = await prisma.product.findFirst({
    where: { id: productId, isActive: true },
    select: { id: true },
  });
  if (!product) {
    throw new AppError({ case: "product", code: ERROR_CODES.NOT_FOUND, statusCode: 404 });
  }

  const deliveredOrder = await prisma.order.findFirst({
    where: {
      customerId,
      status: "delivered",
      orderItems: {
        some: {
          productVariant: { productId },
        },
      },
    },
    select: { id: true },
  });

  if (!deliveredOrder) {
    throw new AppError({ case: "review_not_purchased", code: ERROR_CODES.INVALID, statusCode: 403 });
  }

  const existing = await prisma.productReview.findFirst({
    where: { productId, customerId },
    select: { id: true },
  });
  if (existing) {
    throw new AppError({ case: "review_duplicate", code: ERROR_CODES.DUPLICATE, statusCode: 409 });
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { email: true, name: true },
  });

  const review = await prisma.productReview.create({
    data: {
      productId,
      customerId,
      customerEmail: customer!.email,
      customerName: customer!.name,
      rating: Math.round(rating),
      title: title?.trim() || null,
      body: body.trim(),
    },
  });

  return res.status(201).json(review);
});
