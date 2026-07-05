import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePatch, usePost } from "@/_shared/queryProvider";
import { useToast } from "@mercado/shared-ui";
import { getNotifications } from "@/_modules/notifications/api";
import {
  createDispute,
  createDisputeMessage,
  getOrderDisputes,
  updateDisputeStatus,
} from "@/_modules/touchpoints/api";
import { useShop } from "@/_modules/shops/context/ShopProvider";
import type { IDispute, DisputeStatus } from "@/_modules/touchpoints/types";

export function useOrderDisputes(orderId: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const { shopId } = useShop();

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

  const list = disputes ?? [];
  const hasActive = list.some((d) => d.status === "open" || d.status === "under_review");

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getOrderDisputes.queryKey(orderId) });
    queryClient.invalidateQueries({ queryKey: getNotifications.queryKey(shopId) });
  };

  const createDisputeRecord = () => {
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

  const changeDisputeStatus = (disputeId: string, status: DisputeStatus) => {
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

  const replyToDispute = (disputeId: string) => {
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

  const toggleExpanded = (disputeId: string) => {
    setExpandedId((current) => (current === disputeId ? null : disputeId));
  };

  return {
    disputes: list,
    isLoading,
    hasActive,
    showCreate,
    setShowCreate,
    reason,
    setReason,
    createDisputeRecord,
    isCreating,
    expandedId,
    toggleExpanded,
    replyBody,
    setReplyBody,
    replyToDispute,
    isReplying,
    changeDisputeStatus,
    isUpdatingStatus,
  };
}
