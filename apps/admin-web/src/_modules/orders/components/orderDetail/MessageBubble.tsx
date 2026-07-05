import { useTranslation } from "react-i18next";

type MessageBubbleProps = {
  sender: string;
  body: string;
  createdAt: string;
};

export function MessageBubble({ sender, body, createdAt }: MessageBubbleProps) {
  const { t } = useTranslation();
  const isVendor = sender === "vendor";

  return (
    <div className={`flex ${isVendor ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg px-3 py-2 ${
          isVendor ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        <p className="text-xs font-medium mb-0.5 opacity-70">
          {isVendor ? t("touchpoints.you") : t("touchpoints.customer")}
        </p>
        <p className="text-sm">{body}</p>
        <p className="text-[10px] mt-1 opacity-50">{new Date(createdAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
