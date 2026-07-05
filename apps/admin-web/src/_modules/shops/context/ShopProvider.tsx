import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useFetch } from "@/_shared/queryProvider";
import { getShop } from "../api";
import type { IShop } from "../types";

export type ShopPaths = {
  base: string;
  dashboard: string;
  products: string;
  productCreate: string;
  product: (id: string) => string;
  productEdit: (id: string) => string;
  inventory: string;
  orders: string;
  order: (id: string) => string;
  disputes: string;
  attributes: string;
  attribute: (id: string) => string;
  attributeEdit: (id: string) => string;
  categories: string;
  settings: string;
  notifications: string;
};

type ShopContextValue = {
  shopId: string;
  shop: IShop;
  isLoading: boolean;
  paths: ShopPaths;
};

const ShopContext = createContext<ShopContextValue | null>(null);

function buildPaths(shopId: string): ShopPaths {
  const base = `/s/${shopId}`;
  return {
    base,
    dashboard: base,
    products: `${base}/products`,
    productCreate: `${base}/products/create`,
    product: (id) => `${base}/products/${id}`,
    productEdit: (id) => `${base}/products/${id}/edit`,
    inventory: `${base}/inventory`,
    orders: `${base}/orders`,
    order: (id) => `${base}/orders/${id}`,
    disputes: `${base}/disputes`,
    attributes: `${base}/attributes`,
    attribute: (id) => `${base}/attributes/${id}`,
    attributeEdit: (id) => `${base}/attributes/${id}/edit`,
    categories: `${base}/categories`,
    settings: `${base}/settings`,
    notifications: `${base}/notifications`,
  };
}

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const { t } = useTranslation();
  const { shopId = "" } = useParams<{ shopId: string }>();
  const navigate = useNavigate();

  const { data: shop, isLoading, isError } = useFetch<IShop>({
    queryKey: getShop.queryKey(shopId),
    url: getShop.url(shopId),
    enabled: Boolean(shopId),
  });

  const paths = useMemo(() => buildPaths(shopId), [shopId]);

  if (!shopId) {
    navigate("/shops", { replace: true });
    return null;
  }

  if (!isLoading && (isError || !shop)) {
    navigate("/shops", { replace: true });
    return null;
  }

  if (isLoading || !shop) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <ShopContext.Provider value={{ shopId, shop, isLoading, paths }}>
      {children}
    </ShopContext.Provider>
  );
};

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) {
    throw new Error("useShop must be used within ShopProvider");
  }
  return ctx;
}
