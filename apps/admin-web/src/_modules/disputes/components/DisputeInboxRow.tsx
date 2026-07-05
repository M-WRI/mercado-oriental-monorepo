import { useTranslation } from "react-i18next";
import { Button, Tag } from "@mercado/shared-ui";
import { DISPUTE_STATUS_VARIANT } from "@/_modules/orders/utils";
import type { IDispute } from "@/_modules/touchpoints/types";

interface DisputeInboxRowProps {
  dispute: IDispute;
  onViewOrder: (orderId: string) => void;
}

export function DisputeInboxRow({ dispute, onViewOrder }: DisputeInboxRowProps) {
  const { t } = useTranslation();
  const customer = dispute.order.customerName || dispute.order.customerEmail;

  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Tag variant={DISPUTE_STATUS_VARIANT[dispute.status]} className="!text-[10px] uppercase">
            {t(`touchpoints.status.${dispute.status}`)}
          </Tag>
          <span className="text-xs text-gray-400">
            {new Date(dispute.createdAt).toLocaleString()}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-900 truncate">{dispute.reason}</p>
        <p className="text-xs text-gray-500 mt-1">
          {customer} · {t("orders.orderNumber", { id: dispute.orderId.slice(0, 8) })}
        </p>
      </div>
      <Button
        style="primaryOutline"
        className="!text-xs shrink-0"
        onClick={() => onViewOrder(dispute.orderId)}
      >
        {t("disputes.viewOrder")}
      </Button>
    </div>
  );
}
