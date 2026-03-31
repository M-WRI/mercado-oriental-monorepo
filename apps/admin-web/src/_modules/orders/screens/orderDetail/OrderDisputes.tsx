import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePost, usePatch } from "@/_shared/queryProvider";
import { Button, Card, Tag, useToast } from "@mercado/shared-ui";
import {
  getOrderDisputes,
  createDispute,
  updateDisputeStatus,
  createDisputeMessage,
} from "@/_modules/touchpoints/api";
import { getNotifications } from "@/_modules/notifications/api";
import type { IDispute, DisputeStatus } from "@/_modules/touchpoints/types";

const STATUS_VARIANT: Record<DisputeStatus, "default" | "warning" | "info" | "success" | "danger"> = {
  open: "danger",
  under_review: "warning",
  resolved: "success",
  closed: "default",
};

const NEXT_DISPUTE_STATUS: Partial<Record<DisputeStatus, { value: DisputeStatus; label: string }>> = {
  open: { value: "under_review", label: "touchpoints.startReview" },
  under_review: { value: "resolved", label: "touchpoints.resolve" },
};

interface Props {
  orderId: string;
}

export const OrderDisputes = ({ orderId }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  const { data: disputes, isLoading } = useFetch<IDispute[]>({
    queryKey: getOrderDisputes.queryKey(orderId),
    url: getOrderDisputes.url(orderId),
  });

  const { mutate: postDispute, isPending: isCreating } = usePost<{ reason: string }, IDispute>();
  const { mutate: patchStatus, isPending: isUpdatingStatus } = usePatch();
  const { mutate: postReply, isPending: isReplying } = usePost<
    { sender: string; body: string },
    unknown
  >();

  const [showCreate, setShowCreate] = useState(false);
  const [reason, setReason] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getOrderDisputes.queryKey(orderId) });
    queryClient.invalidateQueries({ queryKey: getNotifications.queryKey });
  };

  const handleCreate = () => {
    if (!reason.trim()) return;
    postDispute(
      { url: createDispute.url(orderId), data: { reason: reason.trim() } },
      {
        onSuccess: () => {
          setReason("");
          setShowCreate(false);
          toastSuccess(t("touchpoints.disputeCreated"));
          invalidate();
        },
      }
    );
  };

  const handleStatusChange = (disputeId: string, status: DisputeStatus) => {
    patchStatus(
      { url: updateDisputeStatus.url(disputeId), data: { status } },
      {
        onSuccess: () => {
          toastSuccess(t("touchpoints.disputeStatusUpdated"));
          invalidate();
        },
      }
    );
  };

  const handleReply = (disputeId: string) => {
    if (!replyBody.trim()) return;
    postReply(
      {
        url: createDisputeMessage.url(disputeId),
        data: { sender: "vendor", body: replyBody.trim() },
      },
      {
        onSuccess: () => {
          setReplyBody("");
          toastSuccess(t("touchpoints.messageSent"));
          invalidate();
        },
      }
    );
  };

  if (isLoading) {
    return <p className="text-sm text-gray-400 py-4">{t("common.loading")}</p>;
  }

  const list = disputes ?? [];
  const hasActive = list.some((d) => d.status === "open" || d.status === "under_review");

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-sm font-medium text-gray-700">
          {t("touchpoints.disputes")} ({list.length})
        </h5>
        {!hasActive && !showCreate && (
          <Button onClick={() => setShowCreate(true)} style="primaryOutline" className="!text-xs">
            {t("touchpoints.openDispute")}
          </Button>
        )}
      </div>

      {showCreate && (
        <div className="mb-4 p-3 border border-gray-200 rounded-lg space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
            rows={3}
            placeholder={t("touchpoints.disputeReasonPlaceholder")}
          />
          <div className="flex gap-2 justify-end">
            <Button onClick={() => setShowCreate(false)} style="primaryOutline">
              {t("common.cancel")}
            </Button>
            <Button onClick={handleCreate} disabled={isCreating || !reason.trim()}>
              {isCreating ? t("common.loading") : t("touchpoints.submitDispute")}
            </Button>
          </div>
        </div>
      )}

      {list.length === 0 && (
        <p className="text-sm text-gray-400">{t("touchpoints.noDisputes")}</p>
      )}

      <div className="space-y-3">
        {list.map((dispute) => {
          const isExpanded = expandedId === dispute.id;
          const next = NEXT_DISPUTE_STATUS[dispute.status];

          return (
            <div
              key={dispute.id}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Header */}
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : dispute.id)}
                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag variant={STATUS_VARIANT[dispute.status]} className="!text-[10px] uppercase">
                      {t(`touchpoints.status.${dispute.status}`)}
                    </Tag>
                    {dispute._count && (
                      <span className="text-[10px] text-gray-400">
                        {dispute._count.messages} {t("touchpoints.messagesCount")}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 truncate">{dispute.reason}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {new Date(dispute.createdAt).toLocaleString()}
                  </p>
                </div>
                <span className="text-gray-400 text-xs ml-2">{isExpanded ? "▲" : "▼"}</span>
              </button>

              {/* Expanded body */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-3 py-3">
                  {/* Status action */}
                  {next && (
                    <div className="flex justify-end mb-3">
                      <Button
                        onClick={() => handleStatusChange(dispute.id, next.value)}
                        disabled={isUpdatingStatus}
                        className="!text-xs"
                      >
                        {t(next.label)}
                      </Button>
                      {dispute.status !== "resolved" && (
                        <Button
                          onClick={() => handleStatusChange(dispute.id, "closed")}
                          disabled={isUpdatingStatus}
                          style="danger"
                          className="!text-xs ml-2"
                        >
                          {t("touchpoints.close")}
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Messages */}
                  <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
                    {(dispute.messages ?? []).map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === "vendor" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-3 py-2 ${
                            msg.sender === "vendor"
                              ? "bg-gray-900 text-white"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-xs font-medium mb-0.5 opacity-70">
                            {msg.sender === "vendor"
                              ? t("touchpoints.you")
                              : t("touchpoints.customer")}
                          </p>
                          <p className="text-sm">{msg.body}</p>
                          <p className="text-[10px] mt-1 opacity-50">
                            {new Date(msg.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply box (not for closed disputes) */}
                  {dispute.status !== "closed" && (
                    <div className="flex gap-2">
                      <textarea
                        value={replyBody}
                        onChange={(e) => setReplyBody(e.target.value)}
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
                        rows={2}
                        placeholder={t("touchpoints.replyPlaceholder")}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleReply(dispute.id);
                          }
                        }}
                      />
                      <Button
                        onClick={() => handleReply(dispute.id)}
                        disabled={isReplying || !replyBody.trim()}
                      >
                        {isReplying ? t("common.loading") : t("touchpoints.send")}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
