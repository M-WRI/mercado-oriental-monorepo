import { useTranslation } from "react-i18next";
import { Card } from "@mercado/shared-ui";
import type { IOrderDetailResponse, OrderStatus } from "../../types";
import { MdCheck, MdClose } from "react-icons/md";

const FLOW_STEPS: OrderStatus[] = ["pending", "confirmed", "packed", "shipped", "delivered"];

const STEP_INDEX: Record<OrderStatus, number> = {
  pending: 0,
  confirmed: 1,
  packed: 2,
  shipped: 3,
  delivered: 4,
  cancelled: -1,
};

function formatTimestamp(iso: string | null): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const StatusTimeline = ({ order }: { order: IOrderDetailResponse }) => {
  const { t } = useTranslation();

  const timestamps: Record<string, string | null> = {
    pending: order.createdAt,
    confirmed: order.confirmedAt,
    packed: order.packedAt,
    shipped: order.shippedAt,
    delivered: order.deliveredAt,
  };

  if (order.status === "cancelled") {
    return (
      <Card>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <MdClose size={18} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-red-600">{t("orders.statuses.cancelled")}</p>
            <p className="text-xs text-gray-400">{formatTimestamp(order.cancelledAt)}</p>
          </div>
        </div>
      </Card>
    );
  }

  const currentIdx = STEP_INDEX[order.status];

  return (
    <Card>
      <div className="flex items-center justify-between">
        {FLOW_STEPS.map((step, i) => {
          const isDone = i <= currentIdx;
          const isCurrent = i === currentIdx;

          return (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                    isDone
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-400"
                  } ${isCurrent ? "ring-2 ring-gray-300 ring-offset-2" : ""}`}
                >
                  {isDone && i < currentIdx ? <MdCheck size={16} /> : i + 1}
                </div>
                <p className={`text-xs mt-1.5 font-medium ${isDone ? "text-gray-900" : "text-gray-400"}`}>
                  {t(`orders.statuses.${step}`)}
                </p>
                {timestamps[step] && (
                  <p className="text-[10px] text-gray-400 mt-0.5">{formatTimestamp(timestamps[step])}</p>
                )}
              </div>
              {i < FLOW_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-2 ${
                    i < currentIdx ? "bg-gray-900" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
