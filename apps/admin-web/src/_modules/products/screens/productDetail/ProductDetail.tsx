import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePatch } from "@/_shared/queryProvider";
import { Button, Tag, useToast, QueryError } from "@mercado/shared-ui";
import { getProduct, getProducts, updateProduct } from "../../api";
import type { IProductDetailResponse } from "../../types";
import { OverviewCards, SalesChart, InventoryHealth, PerformanceInsights } from "../../components/cards";
import { VariantsTable } from "./VariantsTable";
import { CustomersTable } from "./CustomersTable";
import { ProductReviews } from "./ProductReviews";

export const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  const { data: product, isLoading, isError, refetch } = useFetch<IProductDetailResponse>({
    queryKey: getProduct.queryKey(id),
    url: getProduct.url(id),
  });

  const { mutate: patchProduct, isPending: isToggling } = usePatch();

  const handleToggleActive = () => {
    if (!product || !id) return;
    patchProduct(
      {
        url: updateProduct.url(id),
        data: { isActive: !product.isActive },
      },
      {
        onSuccess: () => {
          toastSuccess(
            product.isActive
              ? t("products.deactivatedSuccess")
              : t("products.activatedSuccess")
          );
          queryClient.invalidateQueries({ queryKey: getProduct.queryKey(id) });
          queryClient.invalidateQueries({ queryKey: getProducts.queryKey });
        },
      }
    );
  };

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

  if (!product) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("products.notFound")}</p>
      </div>
    );
  }

  const a = product.analytics;

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto pb-8">
      {/* Header */}
      <div className="shrink-0 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Button onClick={() => navigate("/products")} style="link" className="!text-xs !p-0">
            {t("products.title")}
          </Button>
          <span className="text-xs text-gray-300">/</span>
          <span className="text-xs text-gray-400">{product.shop.name}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{product.name}</h4>
            {product.description && (
              <p className="text-sm text-gray-500 mt-0.5">{product.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={isToggling}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${
                product.isActive
                  ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                  : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
              } ${isToggling ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${product.isActive ? "bg-green-500" : "bg-gray-400"}`} />
              {product.isActive ? t("products.active") : t("products.inactive")}
            </button>
            <Button onClick={() => navigate(`/products/${product.id}/edit`)} style="primaryOutline">
              {t("common.edit")}
            </Button>
            <span className="text-xs text-gray-400">
              {t("products.created")}{" "}
              {new Date(product.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
            {a.productAge > 0 && (
              <Tag>{t("common.daysOld", { count: a.productAge })}</Tag>
            )}
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <OverviewCards analytics={a} variantCount={product.variants.length} />

      {/* Sales chart + Inventory health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2">
          <SalesChart
            data={a.salesTimeline}
            thisWeek={a.thisWeek}
            lastWeek={a.lastWeek}
          />
        </div>
        <div className="lg:col-span-1">
          <InventoryHealth
            totalStock={a.totalStock}
            totalStockOnHand={a.totalStockOnHand}
            totalReserved={a.totalReserved}
            totalStockValue={a.totalStockValue}
            outOfStockCount={a.outOfStockCount}
            lowStockCount={a.lowStockCount}
            lowStockThreshold={a.lowStockThreshold}
            variants={product.variants}
          />
        </div>
      </div>

      {/* Performance insights */}
      <div className="mt-4">
        <PerformanceInsights
          salesVelocity={a.salesVelocity}
          avgSellingPrice={a.avgSellingPrice}
          daysSinceLastSale={a.daysSinceLastSale}
          bestVariant={a.bestVariant}
          worstVariant={a.worstVariant}
          repeatBuyerCount={a.repeatBuyerCount}
          totalCustomers={a.totalCustomers}
          topBuyer={a.topBuyer}
        />
      </div>

      {/* Variants */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-medium text-gray-700">
            {t("products.variants")} ({product.variants.length})
          </h5>
        </div>
        <VariantsTable variants={product.variants} />
      </div>

      {/* Customers */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-medium text-gray-700">
            {t("products.customers")} ({a.totalCustomers})
          </h5>
          {a.repeatBuyerCount > 0 && (
            <Tag variant="success">
              {a.repeatBuyerCount} {a.repeatBuyerCount !== 1 ? t("dashboard.repeatBuyer_plural") : t("dashboard.repeatBuyer")}
            </Tag>
          )}
        </div>
        <CustomersTable customers={a.customers} />
      </div>

      {/* Reviews */}
      <div className="mt-6">
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
};
