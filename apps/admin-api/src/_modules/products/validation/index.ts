import { AppError, ERROR_CODES } from "../../../lib";

/**
 * Validates required fields on a variant payload (name, price, stock).
 */
export function validateVariantFields(v: any) {
  if (!v.name || typeof v.name !== "string" || !v.name.trim()) {
    throw new AppError({
      case: "variant_name",
      code: ERROR_CODES.MISSING,
      statusCode: 400,
    });
  }

  if (v.price == null || typeof v.price !== "number" || v.price < 0) {
    throw new AppError({
      case: "variant_price",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }

  if (v.stock != null && (typeof v.stock !== "number" || v.stock < 0)) {
    throw new AppError({
      case: "variant_stock",
      code: ERROR_CODES.INVALID,
      statusCode: 400,
    });
  }
}

/**
 * Given a list of variants (with their attribute value links), throws if any
 * two variants share the exact same combination of attribute value IDs.
 */
export function assertNoAttributeValueDuplicates(
  variants: { id: string; productVariantAttributeValues: { productAttributeValueId: string }[] }[]
) {
  const seen = new Set<string>();

  for (const v of variants) {
    const key = v.productVariantAttributeValues
      .map((av) => av.productAttributeValueId)
      .sort()
      .join(",");

    if (seen.has(key)) {
      throw new AppError({
        case: "variant_duplicate",
        code: ERROR_CODES.DUPLICATE,
        statusCode: 409,
      });
    }
    seen.add(key);
  }
}
