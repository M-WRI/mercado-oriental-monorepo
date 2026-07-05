import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePost } from "@/_shared/queryProvider";
import { useToast } from "@mercado/shared-ui";
import { createOrderMessage, getOrderMessages } from "@/_modules/touchpoints/api";
import type { IOrderMessage } from "@/_modules/touchpoints/types";

export function useOrderMessages(orderId: string) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  const { data: messages, isLoading } = useFetch<IOrderMessage[]>({
    queryKey: getOrderMessages.queryKey(orderId),
    url: getOrderMessages.url(orderId),
  });

  const { mutate: postMessage, isPending: isSending } = usePost<
    { sender: string; body: string },
    IOrderMessage
  >();

  const [body, setBody] = useState("");

  const sendMessage = () => {
    if (!body.trim()) return;
    postMessage(
      {
        url: createOrderMessage.url(orderId),
        data: { sender: "vendor", body: body.trim() },
      },
      {
        onSuccess: () => {
          setBody("");
          toastSuccess(t("touchpoints.messageSent"));
          queryClient.invalidateQueries({ queryKey: getOrderMessages.queryKey(orderId) });
        },
      }
    );
  };

  return {
    messages: messages ?? [],
    isLoading,
    body,
    setBody,
    sendMessage,
    isSending,
  };
}
