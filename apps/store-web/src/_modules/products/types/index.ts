export interface ProductListItem {
  id: string;
  name: string;
  description: string | null;
  shop: { id: string; name: string };
  priceMin: number;
  priceMax: number;
  variantCount: number;
  inStock: boolean;
  avgRating: number | null;
  reviewCount: number;
  createdAt: string;
}

export interface ProductListResponse {
  data: ProductListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface VariantAttribute {
  attributeId: string;
  attributeName: string;
  valueId: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  available: number;
  inStock: boolean;
  attributes: VariantAttribute[];
}

export interface ProductReview {
  id: string;
  customerName: string | null;
  rating: number;
  title: string | null;
  body: string;
  reply: { body: string; createdAt: string } | null;
  createdAt: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  description: string | null;
  shop: { id: string; name: string };
  variants: ProductVariant[];
  reviews: ProductReview[];
  avgRating: number | null;
  reviewCount: number;
  createdAt: string;
}
