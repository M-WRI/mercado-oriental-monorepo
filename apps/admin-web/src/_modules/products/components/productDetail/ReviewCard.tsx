import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";
import { Card } from "@mercado/shared-ui";
import type { IProductReview } from "@/_modules/reviews/types";
import { Stars } from "./Stars";

interface ReviewCardProps {
  review: IProductReview;
  replyingTo: string | null;
  replyBody: string;
  onReplyBodyChange: (value: string) => void;
  editingReply: string | null;
  editBody: string;
  onEditBodyChange: (value: string) => void;
  isReplying: boolean;
  isEditing: boolean;
  onStartReply: (reviewId: string) => void;
  onCancelReply: () => void;
  onSubmitReply: (reviewId: string) => void;
  onStartEditing: (reviewId: string, body: string) => void;
  onCancelEditing: () => void;
  onSubmitEdit: (reviewId: string) => void;
  onDeleteReply: (reviewId: string) => void;
}

export function ReviewCard({
  review,
  replyingTo,
  replyBody,
  onReplyBodyChange,
  editingReply,
  editBody,
  onEditBodyChange,
  isReplying,
  isEditing,
  onStartReply,
  onCancelReply,
  onSubmitReply,
  onStartEditing,
  onCancelEditing,
  onSubmitEdit,
  onDeleteReply,
}: ReviewCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
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

      <p className="text-sm text-gray-700 mb-3">{review.body}</p>

      {review.reply && editingReply !== review.id && (
        <div className="ml-4 pl-3 border-l-2 border-gray-200 mt-3">
          <p className="text-xs font-medium text-gray-500 mb-1">{t("reviews.yourReply")}</p>
          <p className="text-sm text-gray-700">{review.reply.body}</p>
          <p className="text-[10px] text-gray-400 mt-1">
            {new Date(review.reply.createdAt).toLocaleDateString()}
          </p>
          <div className="flex gap-2 mt-2">
            <Button
              onClick={() => onStartEditing(review.id, review.reply!.body)}
              style="link"
              className="!text-xs"
            >
              {t("common.edit")}
            </Button>
            <Button onClick={() => onDeleteReply(review.id)} style="danger" className="!text-xs">
              {t("common.delete")}
            </Button>
          </div>
        </div>
      )}

      {editingReply === review.id && (
        <div className="ml-4 pl-3 border-l-2 border-gray-200 mt-3 space-y-2">
          <textarea
            value={editBody}
            onChange={(e) => onEditBodyChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
            rows={2}
          />
          <div className="flex gap-2 justify-end">
            <Button onClick={onCancelEditing} style="primaryOutline" className="!text-xs">
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => onSubmitEdit(review.id)}
              disabled={isEditing || !editBody.trim()}
              className="!text-xs"
            >
              {isEditing ? t("common.loading") : t("common.save")}
            </Button>
          </div>
        </div>
      )}

      {!review.reply && replyingTo !== review.id && (
        <Button onClick={() => onStartReply(review.id)} style="link" className="!text-xs mt-1">
          {t("reviews.reply")}
        </Button>
      )}

      {replyingTo === review.id && !review.reply && (
        <div className="ml-4 pl-3 border-l-2 border-gray-200 mt-3 space-y-2">
          <textarea
            value={replyBody}
            onChange={(e) => onReplyBodyChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
            rows={2}
            placeholder={t("reviews.replyPlaceholder")}
          />
          <div className="flex gap-2 justify-end">
            <Button onClick={onCancelReply} style="primaryOutline" className="!text-xs">
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => onSubmitReply(review.id)}
              disabled={isReplying || !replyBody.trim()}
              className="!text-xs"
            >
              {isReplying ? t("common.loading") : t("reviews.sendReply")}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
