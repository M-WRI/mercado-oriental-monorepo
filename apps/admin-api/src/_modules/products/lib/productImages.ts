import type { Prisma } from "../../../../generated/prisma/client";

export type ProductImageInput = {
  id?: string;
  url: string;
  alt?: string | null;
  sortOrder?: number;
  isPrimary?: boolean;
  productVariantId?: string | null;
  variantIndex?: number;
};

export type SerializedProductImage = {
  id: string;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
  productVariantId: string | null;
};

export function serializeProductImages(
  images: Array<{
    id: string;
    url: string;
    alt: string | null;
    sortOrder: number;
    isPrimary: boolean;
    productVariantId: string | null;
  }>
): SerializedProductImage[] {
  return [...images]
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id))
    .map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      sortOrder: img.sortOrder,
      isPrimary: img.isPrimary,
      productVariantId: img.productVariantId,
    }));
}

export function resolvePrimaryImageUrl(
  images: Array<{ url: string; isPrimary: boolean; sortOrder: number }>
): string | null {
  if (images.length === 0) return null;
  const primary = images.find((img) => img.isPrimary);
  if (primary) return primary.url;
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  return sorted[0]?.url ?? null;
}

export async function replaceProductImages(
  tx: Prisma.TransactionClient,
  productId: string,
  inputs: ProductImageInput[],
  variantIdsInOrder?: string[]
): Promise<string | null> {
  await tx.productImage.deleteMany({ where: { productId } });

  if (inputs.length === 0) {
    await tx.product.update({ where: { id: productId }, data: { imageUrl: null } });
    return null;
  }

  const variantIdSet = new Set(variantIdsInOrder ?? []);
  const hasExplicitPrimary = inputs.some((img) => img.isPrimary);

  const createData = inputs.map((img, index) => {
    let productVariantId: string | null = null;

    if (img.productVariantId) {
      productVariantId = img.productVariantId;
    } else if (img.variantIndex != null && variantIdsInOrder) {
      productVariantId = variantIdsInOrder[img.variantIndex] ?? null;
    }

    if (productVariantId && variantIdSet.size > 0 && !variantIdSet.has(productVariantId)) {
      productVariantId = null;
    }

    return {
      url: img.url.trim(),
      alt: img.alt?.trim() || null,
      sortOrder: img.sortOrder ?? index,
      isPrimary: img.isPrimary ?? (!hasExplicitPrimary && index === 0),
      productId,
      productVariantId,
    };
  });

  await tx.productImage.createMany({ data: createData });

  const primaryUrl = resolvePrimaryImageUrl(createData);
  await tx.product.update({ where: { id: productId }, data: { imageUrl: primaryUrl } });
  return primaryUrl;
}

export function getVariantImageUrl(
  variantId: string,
  images: SerializedProductImage[],
  fallback: string | null
): string | null {
  const linked = images.find((img) => img.productVariantId === variantId);
  if (linked) return linked.url;
  return fallback;
}
