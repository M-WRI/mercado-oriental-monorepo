import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { serializeOrderDetail } from "../serializers";

export const showOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const order = await prisma.order.findFirst({
    where: { id, shopId: { in: shopIds } },
    include: {
      shop: { select: { id: true, name: true } },
      orderItems: {
        include: {
          productVariant: {
            include: {
              product: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError({
      case: "order",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  return res.json(serializeOrderDetail(order));
});
