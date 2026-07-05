import type { IEditableVariant, IRawVariant } from "../types";

export function rawVariantToEditable(v: IRawVariant): IEditableVariant {
  return {
    id: v.id,
    tempId: v.id,
    name: v.name,
    price: v.price,
    stock: v.stock,
    attributeValueIds: v.productVariantAttributeValues.map(
      (link) => link.productAttributeValueId
    ),
    attributeSelections: v.productVariantAttributeValues.map((link) => ({
      attributeId: link.productAttributeValue.productAttribute.id,
      attributeName: link.productAttributeValue.productAttribute.name,
      valueId: link.productAttributeValueId,
      valueName: link.productAttributeValue.value,
    })),
  };
}

export function getAttributeValueKey(variant: IEditableVariant): string {
  return [...variant.attributeValueIds].sort().join(",");
}

export function findDuplicateVariants(variants: IEditableVariant[]): Set<string> {
  const seen = new Map<string, string>();
  const duplicates = new Set<string>();
  for (const v of variants) {
    if (v.attributeValueIds.length === 0) continue;
    const key = getAttributeValueKey(v);
    const existing = seen.get(key);
    if (existing) {
      duplicates.add(existing);
      duplicates.add(v.tempId);
    } else {
      seen.set(key, v.tempId);
    }
  }
  return duplicates;
}
