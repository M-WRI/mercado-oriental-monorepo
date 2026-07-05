import { QueryError } from "@mercado/shared-ui";
import { DisputeInboxRow } from "../components";
import { useDisputesList } from "../hooks";

export const DisputesList = () => {
  const {
    t,
    disputes,
    openCount,
    statusFilter,
    setStatusFilter,
    statusOptions,
    isLoading,
    isError,
    refetch,
    goToOrder,
  } = useDisputesList();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  if (isError) {
    return <QueryError onRetry={() => refetch()} />;
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto pb-8">
      <div className="shrink-0 mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{t("disputes.title")}</h4>
          <p className="text-sm text-gray-500 mt-0.5">{t("disputes.subtitle")}</p>
        </div>
        {openCount > 0 && (
          <span className="text-sm font-medium text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
            {t("disputes.openCount", { count: openCount })}
          </span>
        )}
      </div>

      <div className="shrink-0 mb-4">
        <label className="text-sm text-gray-600 flex items-center gap-2">
          <span>{t("orders.status")}</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
          >
            {statusOptions.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="space-y-3">
        {disputes.length === 0 && (
          <div className="rounded-lg border border-dashed border-gray-200 py-12 text-center">
            <p className="text-sm text-gray-400">{t("disputes.empty")}</p>
          </div>
        )}
        {disputes.map((dispute) => (
          <DisputeInboxRow key={dispute.id} dispute={dispute} onViewOrder={goToOrder} />
        ))}
      </div>
    </div>
  );
};
