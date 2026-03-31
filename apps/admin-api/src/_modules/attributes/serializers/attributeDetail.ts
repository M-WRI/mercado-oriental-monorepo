interface VariantLink {
  productVariant: {
    product: { id: string; name: string };
  };
}

interface RawAttributeValue {
  id: string;
  value: string;
  productAttributeId: string;
  createdAt: Date;
  updatedAt: Date;
  productVariantAttributeValues: VariantLink[];
}

interface RawProductAttribute {
  id: string;
  name: string;
  description: string | null;
  shopId: string;
  createdAt: Date;
  updatedAt: Date;
  productAttributeValues: RawAttributeValue[];
}

interface ValueProduct {
  id: string;
  name: string;
}

interface SerializedValue {
  id: string;
  value: string;
  productAttributeId: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount: number;
  products: ValueProduct[];
}

export interface AttributeDetail {
  id: string;
  name: string;
  description: string | null;
  shopId: string;
  createdAt: Date;
  updatedAt: Date;
  totalValues: number;
  totalProducts: number;
  productAttributeValues: SerializedValue[];
}

export function serializeAttributeDetail(
  attribute: RawProductAttribute
): AttributeDetail {
  const productMap = new Map<string, string>();

  const valuesWithUsage = attribute.productAttributeValues.map((val) => {
    const variantLinks = val.productVariantAttributeValues;
    const usageCount = variantLinks.length;

    const valueProducts = new Map<string, string>();
    for (const link of variantLinks) {
      const product = link.productVariant.product;
      valueProducts.set(product.id, product.name);
      productMap.set(product.id, product.name);
    }

    return {
      id: val.id,
      value: val.value,
      productAttributeId: val.productAttributeId,
      createdAt: val.createdAt,
      updatedAt: val.updatedAt,
      usageCount,
      products: Array.from(valueProducts.entries()).map(([pId, pName]) => ({
        id: pId,
        name: pName,
      })),
    };
  });

  return {
    id: attribute.id,
    name: attribute.name,
    description: attribute.description,
    shopId: attribute.shopId,
    createdAt: attribute.createdAt,
    updatedAt: attribute.updatedAt,
    totalValues: valuesWithUsage.length,
    totalProducts: productMap.size,
    productAttributeValues: valuesWithUsage,
  };
}
