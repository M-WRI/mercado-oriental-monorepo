export interface IAttributeListResponse {
  id: string;
  name: string;
  description: string;
  shopId: string;
  productAttributeValues: IProductAttributeValue[];
}

export interface IProductAttributeValue {
  id: string;
  value: string;
  productAttributeId: string;
}

// ── Attribute detail (enriched) ──────────────────────────────────────

export interface IAttributeValueProduct {
  id: string;
  name: string;
}

export interface IAttributeValueDetail {
  id: string;
  value: string;
  productAttributeId: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  products: IAttributeValueProduct[];
}

export interface IAttributeDetailResponse {
  id: string;
  name: string;
  description: string | null;
  shopId: string;
  createdAt: string;
  updatedAt: string;
  totalValues: number;
  totalProducts: number;
  productAttributeValues: IAttributeValueDetail[];
}
