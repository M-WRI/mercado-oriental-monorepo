import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePost, usePatch, useDelete } from "@/_shared/queryProvider";
import { Button, Card, Tag, useToast } from "@mercado/shared-ui";
import { getProductReviews, replyToReview, deleteReviewReply } from "@/_modules/reviews/api";
import type { IProductReview } from "@/_modules/reviews/types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-sm">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < rating ? "text-amber-400" : "text-gray-200"}>
          ★
        </span>
      ))}
    </span>
  );
}

interface Props {
  productId: string;
}

export const ProductReviews = ({ productId }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  const { data: reviews, isLoading } = useFetch<IProductReview[]>({
    queryKey: getProductReviews.queryKey(productId),
    url: getProductReviews.url(productId),
  });

  const { mutate: postReply, isPending: isReplying } = usePost<{ body: string }, unknown>();
  const { mutate: patchReply, isPending: isEditing } = usePatch();
  const { mutate: delReply } = useDelete();

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [editingReply, setEditingReply] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getProductReviews.queryKey(productId) });
  };

  const handleReply = (reviewId: string) => {
    if (!replyBody.trim()) return;
    postReply(
      { url: replyToReview.url(reviewId), data: { body: replyBody.trim() } },
      {
        onSuccess: () => {
          setReplyBody("");
          setReplyingTo(null);
          toastSuccess(t("reviews.replySent"));
          invalidate();
        },
      }
    );
  };

  const handleEditReply = (reviewId: string) => {
    if (!editBody.trim()) return;
    patchReply(
      { url: replyToReview.url(reviewId), data: { body: editBody.trim() } },
      {
        onSuccess: () => {
          setEditBody("");
          setEditingReply(null);
          toastSuccess(t("reviews.replyUpdated"));
          invalidate();
        },
      }
    );
  };

  const handleDeleteReply = (reviewId: string) => {
    delReply(
      { url: deleteReviewReply.url(reviewId) },
      {
        onSuccess: () => {
          toastSuccess(t("reviews.replyDeleted"));
          invalidate();
        },
      }
    );
  };

  if (isLoading) {
    return <p className="text-sm text-gray-400 py-4">{t("common.loading")}</p>;
  }

  const list = reviews ?? [];
  const avgRating = list.length > 0
    ? (list.reduce((sum, r) => sum + r.rating, 0) / list.length).toFixed(1)
    : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <h5 className="text-sm font-medium text-gray-700">
            {t("reviews.title")} ({list.length})
          </h5>
          {avgRating && (
            <Tag variant="warning">
              <Stars rating={Math.round(Number(avgRating))} /> {avgRating}
            </Tag>
          )}
        </div>
      </div>

      {list.length === 0 && (
        <Card>
          <p className="text-sm text-gray-400">{t("reviews.noReviews")}</p>
        </Card>
      )}

      <div className="space-y-3">
        {list.map((review) => (
          <Card key={review.id}>
            {/* Review header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Stars rating={review.rating} />
                  {review.title && (
                    <span className="text-sm font-medium text-gray-900">{review.title}</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {review.customerName || review.customerEmail} ·{" "}
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Review body */}
            <p className="text-sm text-gray-700 mb-3">{review.body}</p>

            {/* Existing reply */}
            {review.reply && editingReply !== review.id && (
              <div className="ml-4 pl-3 border-l-2 border-gray-200 mt-3">
                <p className="text-xs font-medium text-gray-500 mb-1">{t("reviews.yourReply")}</p>
                <p className="text-sm text-gray-700">{review.reply.body}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {new Date(review.reply.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2 mt-2">
                  <Button
                    onClick={() => {
                      setEditingReply(review.id);
                      setEditBody(review.reply!.body);
                    }}
                    style="link"
                    className="!text-xs"
                  >
                    {t("common.edit")}
                  </Button>
                  <Button
                    onClick={() => handleDeleteReply(review.id)}
                    style="danger"
                    className="!text-xs"
                  >
                    {t("common.delete")}
                  </Button>
                </div>
              </div>
            )}

            {/* Edit reply form */}
            {editingReply === review.id && (
              <div className="ml-4 pl-3 border-l-2 border-gray-200 mt-3 space-y-2">
                <textarea
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  rows={2}
                />
                <div className="flex gap-2 justify-end">
                  <Button onClick={() => setEditingReply(null)} style="primaryOutline" className="!text-xs">
                    {t("common.cancel")}
                  </Button>
                  <Button
                    onClick={() => handleEditReply(review.id)}
                    disabled={isEditing || !editBody.trim()}
                    className="!text-xs"
                  >
                    {isEditing ? t("common.loading") : t("common.save")}
                  </Button>
                </div>
              </div>
            )}

            {/* Reply button + form */}
            {!review.reply && replyingTo !== review.id && (
              <Button
                onClick={() => setReplyingTo(review.id)}
                style="link"
                className="!text-xs mt-1"
              >
                {t("reviews.reply")}
              </Button>
            )}

            {replyingTo === review.id && !review.reply && (
              <div className="ml-4 pl-3 border-l-2 border-gray-200 mt-3 space-y-2">
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
                  rows={2}
                  placeholder={t("reviews.replyPlaceholder")}
                />
                <div className="flex gap-2 justify-end">
                  <Button onClick={() => setReplyingTo(null)} style="primaryOutline" className="!text-xs">
                    {t("common.cancel")}
                  </Button>
                  <Button
                    onClick={() => handleReply(review.id)}
                    disabled={isReplying || !replyBody.trim()}
                    className="!text-xs"
                  >
                    {isReplying ? t("common.loading") : t("reviews.sendReply")}
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
