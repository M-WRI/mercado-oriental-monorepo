import { Response } from "express";
import { prisma, AppError, ERROR_CODES, asyncHandler, getShopIdsForUser } from "../../../lib";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";

export const updateOrder = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { internalNote, trackingNumber, carrier } = req.body;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const order = await prisma.order.findFirst({
    where: { id, shopId: { in: shopIds } },
    select: { id: true },
  });

  if (!order) {
    throw new AppError({
      case: "order",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  const data: any = {};
  if (internalNote !== undefined) data.internalNote = internalNote || null;
  if (trackingNumber !== undefined) data.trackingNumber = trackingNumber || null;
  if (carrier !== undefined) data.carrier = carrier || null;

  const updated = await prisma.order.update({
    where: { id },
    data,
  });

  return res.json(updated);
});
