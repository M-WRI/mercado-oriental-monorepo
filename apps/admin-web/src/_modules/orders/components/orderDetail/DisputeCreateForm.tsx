import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";

type DisputeCreateFormProps = {
  reason: string;
  isCreating: boolean;
  onReasonChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
};

export function DisputeCreateForm({
  reason,
  isCreating,
  onReasonChange,
  onCancel,
  onSubmit,
}: DisputeCreateFormProps) {
  const { t } = useTranslation();

  return (
    <div className="mb-4 p-3 border border-gray-200 rounded-lg space-y-2">
      <textarea
        value={reason}
        onChange={(e) => onReasonChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
        rows={3}
        placeholder={t("touchpoints.disputeReasonPlaceholder")}
      />
      <div className="flex gap-2 justify-end">
        <Button onClick={onCancel} style="primaryOutline">
          {t("common.cancel")}
        </Button>
        <Button onClick={onSubmit} disabled={isCreating || !reason.trim()}>
          {isCreating ? t("common.loading") : t("touchpoints.submitDispute")}
        </Button>
      </div>
    </div>
  );
}
