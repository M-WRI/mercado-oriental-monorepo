import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";

type ShipOrderModalProps = {
  trackingNumber: string;
  carrier: string;
  isAdvancing: boolean;
  onTrackingNumberChange: (value: string) => void;
  onCarrierChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export function ShipOrderModal({
  trackingNumber,
  carrier,
  isAdvancing,
  onTrackingNumberChange,
  onCarrierChange,
  onClose,
  onSubmit,
}: ShipOrderModalProps) {
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
          <h5 className="text-base font-semibold text-gray-900 mb-1">{t("orders.shipOrder")}</h5>
          <p className="text-sm text-gray-500 mb-4">{t("orders.shipOrderHint")}</p>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">
                {t("orders.trackingNumber")} *
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => onTrackingNumberChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                placeholder="e.g. DHL123456789"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">{t("orders.carrier")}</label>
              <input
                type="text"
                value={carrier}
                onChange={(e) => onCarrierChange(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                placeholder="e.g. DHL, FedEx, UPS"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4">
          <Button onClick={onClose} style="primaryOutline">
            {t("common.cancel")}
          </Button>
          <Button
            onClick={onSubmit}
            disabled={!trackingNumber.trim() || isAdvancing}
          >
            {isAdvancing ? t("common.loading") : t("orders.actions.shipped")}
          </Button>
        </div>
      </div>
    </div>
  );
}
