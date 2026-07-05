import type { IProductAttribute, INewAttribute } from "../types";

export function getAvailableAttributes(
  selectedAttributes: IProductAttribute[],
  newAttributes: INewAttribute[]
) {
  const existing = selectedAttributes.map((a) => ({
    id: a.id,
    name: a.name,
    isNew: false,
    values: a.productAttributeValues.map((v) => ({ id: v.id, label: v.value })),
  }));

  const newOnes = newAttributes.map((a) => ({
    id: a.tempId,
    name: a.name,
    isNew: true,
    values: a.values.map((v, i) => ({ id: `${a.tempId}-val-${i}`, label: v })),
  }));

  return [...existing, ...newOnes];
}
