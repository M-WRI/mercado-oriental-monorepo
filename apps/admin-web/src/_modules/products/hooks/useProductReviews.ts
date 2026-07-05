import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePost, useDelete } from "@/_shared/queryProvider";
import { useToast } from "@mercado/shared-ui";
import { getProductReviews, replyToReview, deleteReviewReply } from "@/_modules/reviews/api";
import type { IProductReview } from "@/_modules/reviews/types";

export function useProductReviews(productId: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  const { data: reviews, isLoading } = useFetch<IProductReview[]>({
    queryKey: getProductReviews.queryKey(productId),
    url: getProductReviews.url(productId),
  });

  const { mutate: postReply, isPending: isReplying } = usePost<{ body: string }, unknown>();
  const { mutate: postEditReply, isPending: isEditing } = usePost<{ body: string }, unknown>();
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
    postEditReply(
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

  const list = reviews ?? [];
  const avgRating =
    list.length > 0
      ? (list.reduce((sum, r) => sum + r.rating, 0) / list.length).toFixed(1)
      : null;

  const startEditing = (reviewId: string, body: string) => {
    setEditingReply(reviewId);
    setEditBody(body);
  };

  return {
    isLoading,
    list,
    avgRating,
    replyingTo,
    setReplyingTo,
    replyBody,
    setReplyBody,
    editingReply,
    setEditingReply,
    editBody,
    setEditBody,
    isReplying,
    isEditing,
    handleReply,
    handleEditReply,
    handleDeleteReply,
    startEditing,
  };
}
