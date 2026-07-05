import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";

type CancelOrderModalProps = {
  cancelReason: string;
  isAdvancing: boolean;
  onCancelReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export function CancelOrderModal({
  cancelReason,
  isAdvancing,
  onCancelReasonChange,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h5 className="text-base font-semibold text-gray-900 mb-1">{t("orders.cancelOrder")}</h5>
          <p className="text-sm text-gray-500 mb-4">{t("orders.cancelConfirmMessage")}</p>
          <div>
            <label className="text-sm font-medium text-gray-700">
              {t("orders.cancelReasonLabel")}
            </label>
            <textarea
              value={cancelReason}
              onChange={(e) => onCancelReasonChange(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
              rows={3}
              placeholder={t("orders.cancelReasonPlaceholder")}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4">
          <Button onClick={onClose} style="primaryOutline">
            {t("common.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            style="danger"
            disabled={isAdvancing}
            className="!bg-red-600 !text-white hover:!bg-red-700"
          >
            {isAdvancing ? t("common.loading") : t("orders.actions.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
