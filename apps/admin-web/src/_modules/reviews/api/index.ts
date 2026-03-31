import type { TQueryKey } from "@mercado/shared-ui";

export const getProductReviews = {
  queryKey: (productId?: string) => [["reviews", productId]] as TQueryKey,
  url: (productId?: string) => `/reviews/products/${productId}/reviews`,
};

export const replyToReview = {
  url: (reviewId: string) => `/reviews/reviews/${reviewId}/reply`,
};

export const deleteReviewReply = {
  url: (reviewId: string) => `/reviews/reviews/${reviewId}/reply`,
};
