export interface IReviewReply {
  id: string;
  reviewId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}

export interface IProductReview {
  id: string;
  productId: string;
  customerEmail: string;
  customerName: string | null;
  rating: number;
  title: string | null;
  body: string;
  reply: IReviewReply | null;
  createdAt: string;
  updatedAt: string;
}
