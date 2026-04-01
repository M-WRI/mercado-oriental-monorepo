import { Response } from "express";
import {
  prisma,
  AppError,
  ERROR_CODES,
  asyncHandler,
  getShopIdsForUser,
  assertShopBelongsToUser,
} from "../../../lib";
import { INV_REASON, recordMovement, syncLowStockNotificationsForVariants } from "../../../lib/inventory";
import { AuthenticatedRequest } from "../../../middleware/authMiddleware";
import { assertNoAttributeValueDuplicates } from "../validation";

export const updateProduct = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const data = req.body;
  const shopIds = await getShopIdsForUser(req.user!.userId);

  const owned = await prisma.product.findFirst({
    where: { id, shopId: { in: shopIds } },
    select: { id: true },
  });

  if (!owned) {
    throw new AppError({
      case: "product",
      code: ERROR_CODES.NOT_FOUND,
      statusCode: 404,
    });
  }

  if (data.shopId !== undefined) {
    assertShopBelongsToUser(data.shopId, shopIds);
  }

  if (data.name !== undefined && (typeof data.name !== "string" || !data.name.trim())) {
    throw new AppError({
      case: "product_name",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  await prisma.$transaction(async (tx) => {
    // Update product basic fields
    await tx.product.update({
      where: { id },
      data: {
        name: data.name?.trim(),
        description: data.description !== undefined ? (data.description?.trim() || null) : undefined,
        shopId: data.shopId,
        isActive: typeof data.isActive === "boolean" ? data.isActive : undefined,
      },
    });

    if (data.variants) {
      if (data.variants.delete?.length) {
        await tx.productVariantAttributeValue.deleteMany({
          where: { productVariant: { id: { in: data.variants.delete }, productId: id } },
        });
        await tx.productVariant.deleteMany({
          where: { id: { in: data.variants.delete }, productId: id },
        });
      }

      if (data.variants.update?.length) {
        for (const v of data.variants.update) {
          // Zod handles basic validation where applied

          const cur = await tx.productVariant.findFirst({
            where: { id: v.id, productId: id },
            select: { stock: true, reservedStock: true, price: true },
          });

          if (!cur) {
            throw new AppError({
              case: "variant",
              code: ERROR_CODES.NOT_FOUND,
              statusCode: 404,
            });
          }

          if (v.stock != null && v.stock < cur.reservedStock) {
            throw new AppError({
              case: "variant_stock_reserved",
              code: ERROR_CODES.INVALID,
              statusCode: 409,
            });
          }

          await tx.productVariant.update({
            where: { id: v.id },
            data: {
              name: v.name?.trim(),
              price: v.price,
              stock: v.stock,
            },
          });

          if (v.stock != null && v.stock !== cur.stock) {
            await recordMovement(tx, {
              productVariantId: v.id,
              stockDelta: v.stock - cur.stock,
              reservedDelta: 0,
              reason: INV_REASON.ADJUSTMENT,
              userId: req.user!.userId,
              note: "Product edit",
            });
          }

          if (v.price != null && v.price !== cur.price) {
            await tx.priceHistory.create({
              data: {
                productVariantId: v.id,
                oldPrice: cur.price,
                newPrice: v.price,
                userId: req.user!.userId,
              },
            });
          }

          if (Array.isArray(v.attributeValueIds)) {
            if (v.attributeValueIds.length === 0) {
              throw new AppError({
                case: "variant_attribute_values",
                code: ERROR_CODES.MISSING,
                statusCode: 400,
              });
            }
            await tx.productVariantAttributeValue.deleteMany({
              where: { productVariantId: v.id },
            });
            await tx.productVariantAttributeValue.createMany({
              data: v.attributeValueIds.map((avId: string) => ({
                productVariantId: v.id,
                productAttributeValueId: avId,
              })),
            });
          }
        }
      }

      if (data.variants.create?.length) {
        for (const v of data.variants.create) {
          // Zod handles basic validation where applied

          if (!Array.isArray(v.attributeValueIds) || v.attributeValueIds.length === 0) {
            throw new AppError({
              case: "variant_attribute_values",
              code: ERROR_CODES.MISSING,
              statusCode: 400,
            });
          }

          await tx.productVariant.create({
            data: {
              name: v.name.trim(),
              price: v.price,
              stock: v.stock ?? 0,
              productId: id,
              productVariantAttributeValues: {
                create: v.attributeValueIds.map((avId: string) => ({
                  productAttributeValueId: avId,
                })),
              },
            },
          });
        }
      }

      const allVariants = await tx.productVariant.findMany({
        where: { productId: id },
        include: {
          productVariantAttributeValues: {
            select: { productAttributeValueId: true },
          },
        },
      });

      if (allVariants.length === 0) {
        throw new AppError({
          case: "product_variants",
          code: ERROR_CODES.MISSING,
          statusCode: 400,
        });
      }

      for (const v of allVariants) {
        if (v.productVariantAttributeValues.length === 0) {
          throw new AppError({
            case: "variant_attribute_values",
            code: ERROR_CODES.MISSING,
            statusCode: 400,
          });
        }
      }

      assertNoAttributeValueDuplicates(allVariants);
    }
  });

  const product = await prisma.product.findUnique({
    where: { id },
    include: { productVariants: true },
  });

  if (product && data.variants) {
    await syncLowStockNotificationsForVariants(product.productVariants.map((v) => v.id));
  }

  res.json(product);
});
