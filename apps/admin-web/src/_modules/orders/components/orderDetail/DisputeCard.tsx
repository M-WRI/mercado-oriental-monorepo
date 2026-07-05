import { useTranslation } from "react-i18next";
import { Button, Tag } from "@mercado/shared-ui";
import { DISPUTE_STATUS_VARIANT, NEXT_DISPUTE_STATUS } from "../../utils";
import { MessageBubble } from "./MessageBubble";
import { MessageComposer } from "./MessageComposer";
import type { DisputeStatus, IDispute } from "@/_modules/touchpoints/types";

type DisputeCardProps = {
  dispute: IDispute;
  isExpanded: boolean;
  replyBody: string;
  isUpdatingStatus: boolean;
  isReplying: boolean;
  onToggle: () => void;
  onReplyBodyChange: (value: string) => void;
  onStatusChange: (status: DisputeStatus) => void;
  onReply: () => void;
};

export function DisputeCard({
  dispute,
  isExpanded,
  replyBody,
  isUpdatingStatus,
  isReplying,
  onToggle,
  onReplyBodyChange,
  onStatusChange,
  onReply,
}: DisputeCardProps) {
  const { t } = useTranslation();
  const next = NEXT_DISPUTE_STATUS[dispute.status];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 transition-colors text-left"
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Tag variant={DISPUTE_STATUS_VARIANT[dispute.status]} className="!text-[10px] uppercase">
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

      {isExpanded && (
        <div className="border-t border-gray-100 px-3 py-3">
          {next && (
            <div className="flex justify-end mb-3">
              <Button
                onClick={() => onStatusChange(next.value)}
                disabled={isUpdatingStatus}
                className="!text-xs"
              >
                {t(next.label)}
              </Button>
              {dispute.status !== "resolved" && (
                <Button
                  onClick={() => onStatusChange("closed")}
                  disabled={isUpdatingStatus}
                  style="danger"
                  className="!text-xs ml-2"
                >
                  {t("touchpoints.close")}
                </Button>
              )}
            </div>
          )}

          <div className="space-y-2 max-h-64 overflow-y-auto mb-3">
            {(dispute.messages ?? []).map((msg) => (
              <MessageBubble
                key={msg.id}
                sender={msg.sender}
                body={msg.body}
                createdAt={msg.createdAt}
              />
            ))}
          </div>

          {dispute.status !== "closed" && (
            <MessageComposer
              value={replyBody}
              isSending={isReplying}
              placeholder={t("touchpoints.replyPlaceholder")}
              onChange={onReplyBodyChange}
              onSend={onReply}
            />
          )}
        </div>
      )}
    </div>
  );
}
