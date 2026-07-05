import { useTranslation } from "react-i18next";
import { QueryError } from "@mercado/shared-ui";
import { InventoryListView } from "../components";
import { useInventoryList } from "../hooks";

export const InventoryList = () => {
  const { t } = useTranslation();
  const list = useInventoryList();

  if (list.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  if (list.isError) {
    return <QueryError onRetry={() => list.refetch()} />;
  }

  return <InventoryListView list={list} />;
};
