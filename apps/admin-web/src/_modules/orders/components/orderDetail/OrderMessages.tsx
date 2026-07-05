import { useTranslation } from "react-i18next";
import { Card } from "@mercado/shared-ui";
import { useOrderMessages } from "../../hooks";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";

type OrderMessagesProps = {
  orderId: string;
};

export function OrderMessages({ orderId }: OrderMessagesProps) {
  const { t } = useTranslation();
  const { messages, isLoading, body, setBody, sendMessage, isSending } = useOrderMessages(orderId);

  if (isLoading) {
    return <p className="text-sm text-gray-400 py-4">{t("common.loading")}</p>;
  }

  return (
    <Card>
      <h5 className="text-sm font-medium text-gray-700 mb-4">
        {t("touchpoints.messages")} ({messages.length})
      </h5>

      {messages.length === 0 && (
        <p className="text-sm text-gray-400 mb-4">{t("touchpoints.noMessages")}</p>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            sender={msg.sender}
            body={msg.body}
            createdAt={msg.createdAt}
          />
        ))}
      </div>

      <MessageComposer
        value={body}
        isSending={isSending}
        placeholder={t("touchpoints.messagePlaceholder")}
        onChange={setBody}
        onSend={sendMessage}
      />
    </Card>
  );
}
