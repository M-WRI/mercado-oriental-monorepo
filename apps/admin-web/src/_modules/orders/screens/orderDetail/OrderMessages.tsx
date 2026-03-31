import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePost } from "@/_shared/queryProvider";
import { Button, Card, useToast } from "@mercado/shared-ui";
import { getOrderMessages, createOrderMessage } from "@/_modules/touchpoints/api";
import type { IOrderMessage } from "@/_modules/touchpoints/types";

interface Props {
  orderId: string;
}

export const OrderMessages = ({ orderId }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  const { data: messages, isLoading } = useFetch<IOrderMessage[]>({
    queryKey: getOrderMessages.queryKey(orderId),
    url: getOrderMessages.url(orderId),
  });

  const { mutate: postMessage, isPending } = usePost<
    { sender: string; body: string },
    IOrderMessage
  >();

  const [body, setBody] = useState("");

  const handleSend = () => {
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

  if (isLoading) {
    return <p className="text-sm text-gray-400 py-4">{t("common.loading")}</p>;
  }

  const list = messages ?? [];

  return (
    <Card>
      <h5 className="text-sm font-medium text-gray-700 mb-4">
        {t("touchpoints.messages")} ({list.length})
      </h5>

      {list.length === 0 && (
        <p className="text-sm text-gray-400 mb-4">{t("touchpoints.noMessages")}</p>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
        {list.map((msg) => (
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
                {msg.sender === "vendor" ? t("touchpoints.you") : t("touchpoints.customer")}
              </p>
              <p className="text-sm">{msg.body}</p>
              <p className="text-[10px] mt-1 opacity-50">
                {new Date(msg.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
          rows={2}
          placeholder={t("touchpoints.messagePlaceholder")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button onClick={handleSend} disabled={isPending || !body.trim()}>
          {isPending ? t("common.loading") : t("touchpoints.send")}
        </Button>
      </div>
    </Card>
  );
};
