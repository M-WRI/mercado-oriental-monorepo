import { useTranslation } from "react-i18next";
import { useFetch } from "@/_shared/queryProvider";
import { Button } from "@mercado/shared-ui";
import { getInventoryMovements, type IInventoryMovement } from "@/_modules/inventory/api";

export type InventoryHistoryModalProps = {
  onClose: () => void;
  variantId: string;
  variantName: string;
};

function formatDelta(delta: number): string {
  if (delta > 0) return `+${delta}`;
  return String(delta);
}

export function InventoryHistoryModal({
  onClose,
  variantId,
  variantName,
}: InventoryHistoryModalProps) {
  const { t } = useTranslation();

  const { data: movements, isLoading } = useFetch<IInventoryMovement[]>({
    queryKey: getInventoryMovements.queryKey(variantId),
    url: getInventoryMovements.url(variantId),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="shrink-0 px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("inventory.historyTitle")}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{variantName}</p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <p className="text-sm text-gray-400">{t("common.loading")}</p>
          ) : !movements || movements.length === 0 ? (
            <p className="text-sm text-gray-400">{t("inventory.noMovements")}</p>
          ) : (
            <div className="divide-y divide-gray-100">
              {movements.map((m) => (
                <div key={m.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {t(`inventory.reasons.${m.reason}`, { defaultValue: m.reason })}
                    </p>
                    {m.note && <p className="text-xs text-gray-500 mt-0.5">{m.note}</p>}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-medium ${
                        m.stockDelta > 0
                          ? "text-green-600"
                          : m.stockDelta < 0
                            ? "text-red-600"
                            : "text-gray-600"
                      }`}
                    >
                      {t("inventory.stockDelta")}: {formatDelta(m.stockDelta)}
                    </p>
                    {m.reservedDelta !== 0 && (
                      <p className="text-xs text-gray-500">
                        {t("inventory.reservedDelta")}: {formatDelta(m.reservedDelta)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-gray-200 flex justify-end">
          <Button style="ghost" onClick={onClose}>
            {t("common.cancel")}
          </Button>
        </div>
      </div>
    </div>
  );
}
