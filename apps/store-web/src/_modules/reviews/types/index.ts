export interface CustomerReview {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
  rating: number;
  title: string | null;
  body: string;
  reply: { body: string; createdAt: string } | null;
  createdAt: string;
}

export interface CustomerReviewListResponse {
  data: CustomerReview[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
