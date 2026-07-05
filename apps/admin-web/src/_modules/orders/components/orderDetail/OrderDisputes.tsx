import { useTranslation } from "react-i18next";
import { Button, Card } from "@mercado/shared-ui";
import { useOrderDisputes } from "../../hooks";
import { DisputeCard } from "./DisputeCard";
import { DisputeCreateForm } from "./DisputeCreateForm";

type OrderDisputesProps = {
  orderId: string;
};

export function OrderDisputes({ orderId }: OrderDisputesProps) {
  const { t } = useTranslation();
  const disputes = useOrderDisputes(orderId);

  if (disputes.isLoading) {
    return <p className="text-sm text-gray-400 py-4">{t("common.loading")}</p>;
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-sm font-medium text-gray-700">
          {t("touchpoints.disputes")} ({disputes.disputes.length})
        </h5>
        {!disputes.hasActive && !disputes.showCreate && (
          <Button
            onClick={() => disputes.setShowCreate(true)}
            style="primaryOutline"
            className="!text-xs"
          >
            {t("touchpoints.openDispute")}
          </Button>
        )}
      </div>

      {disputes.showCreate && (
        <DisputeCreateForm
          reason={disputes.reason}
          isCreating={disputes.isCreating}
          onReasonChange={disputes.setReason}
          onCancel={() => disputes.setShowCreate(false)}
          onSubmit={disputes.createDisputeRecord}
        />
      )}

      {disputes.disputes.length === 0 && (
        <p className="text-sm text-gray-400">{t("touchpoints.noDisputes")}</p>
      )}

      <div className="space-y-3">
        {disputes.disputes.map((dispute) => (
          <DisputeCard
            key={dispute.id}
            dispute={dispute}
            isExpanded={disputes.expandedId === dispute.id}
            replyBody={disputes.replyBody}
            isUpdatingStatus={disputes.isUpdatingStatus}
            isReplying={disputes.isReplying}
            onToggle={() => disputes.toggleExpanded(dispute.id)}
            onReplyBodyChange={disputes.setReplyBody}
            onStatusChange={(status) => disputes.changeDisputeStatus(dispute.id, status)}
            onReply={() => disputes.replyToDispute(dispute.id)}
          />
        ))}
      </div>
    </Card>
  );
}
