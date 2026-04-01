import { AppError, ERROR_CODES } from "../../../lib";

// Zod schemas handle the field validations now.

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
