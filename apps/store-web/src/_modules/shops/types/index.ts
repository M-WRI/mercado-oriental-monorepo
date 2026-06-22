export interface ShopListItem {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
  avgRating: number | null;
  reviewCount: number;
  createdAt: string;
}

export interface ShopListResponse {
  data: ShopListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ShopProduct {
  id: string;
  name: string;
  description: string | null;
  priceMin: number;
  priceMax: number;
  variantCount: number;
  inStock: boolean;
  avgRating: number | null;
  reviewCount: number;
  categories: { id: string; name: string; slug: string }[];
  createdAt: string;
}

export interface ShopDetail {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
  avgRating: number | null;
  reviewCount: number;
  memberSince: string;
  products: ShopProduct[];
}
