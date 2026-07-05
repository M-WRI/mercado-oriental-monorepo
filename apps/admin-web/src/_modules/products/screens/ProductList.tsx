import { useTranslation } from "react-i18next";
import { QueryError } from "@mercado/shared-ui";
import { useProductList } from "../hooks";
import { ProductListView } from "../components/productList";

export const ProductList = () => {
  const { t } = useTranslation();
  const list = useProductList();

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

  return <ProductListView list={list} />;
};
