import { useTranslation } from "react-i18next";
import { Card, Tag } from "@mercado/shared-ui";
import { useProductReviews } from "../../hooks";
import { ReviewCard } from "./ReviewCard";
import { Stars } from "./Stars";

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const { t } = useTranslation();
  const reviews = useProductReviews(productId);

  if (reviews.isLoading) {
    return <p className="text-sm text-gray-400 py-4">{t("common.loading")}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h5 className="text-sm font-medium text-gray-700">
            {t("reviews.title")} ({reviews.list.length})
          </h5>
          {reviews.avgRating && (
            <Tag variant="warning">
              <Stars rating={Math.round(Number(reviews.avgRating))} /> {reviews.avgRating}
            </Tag>
          )}
        </div>
      </div>

      {reviews.list.length === 0 && (
        <Card>
          <p className="text-sm text-gray-400">{t("reviews.noReviews")}</p>
        </Card>
      )}

      <div className="space-y-3">
        {reviews.list.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            replyingTo={reviews.replyingTo}
            replyBody={reviews.replyBody}
            onReplyBodyChange={reviews.setReplyBody}
            editingReply={reviews.editingReply}
            editBody={reviews.editBody}
            onEditBodyChange={reviews.setEditBody}
            isReplying={reviews.isReplying}
            isEditing={reviews.isEditing}
            onStartReply={(reviewId) => reviews.setReplyingTo(reviewId)}
            onCancelReply={() => reviews.setReplyingTo(null)}
            onSubmitReply={reviews.handleReply}
            onStartEditing={reviews.startEditing}
            onCancelEditing={() => reviews.setEditingReply(null)}
            onSubmitEdit={reviews.handleEditReply}
            onDeleteReply={reviews.handleDeleteReply}
          />
        ))}
      </div>
    </div>
  );
}
