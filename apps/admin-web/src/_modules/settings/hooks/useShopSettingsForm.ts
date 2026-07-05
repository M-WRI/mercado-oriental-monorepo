import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { usePut } from "@/_shared/queryProvider";
import { useFormHook, useToast } from "@mercado/shared-ui";
import { getShop, getShops, updateShop } from "@/_modules/shops/api";
import { useShop } from "@/_modules/shops/context/ShopProvider";
import type { ShopFormValues } from "../types";

export function useShopSettingsForm() {
  const { t } = useTranslation();
  const { shop, shopId } = useShop();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const [error, setError] = useState<string | null>(null);
  const { mutate: putShop, isPending: isSaving } = usePut();

  const { form } = useFormHook({
    defaultValues: {
      name: shop.name,
      description: shop.description ?? "",
      defaultLowStockThreshold: shop.defaultLowStockThreshold ?? 5,
    } satisfies ShopFormValues,
    onSubmit: ({ value }: { value: ShopFormValues }) => {
      setError(null);

      if (!value.name.trim()) {
        setError(t("shops.nameRequired"));
        return;
      }

      if (isNaN(value.defaultLowStockThreshold) || value.defaultLowStockThreshold < 0) {
        setError(t("settings.lowStockInvalid"));
        return;
      }

      putShop(
        {
          url: updateShop.url(shopId),
          data: {
            name: value.name.trim(),
            description: value.description.trim() || null,
            defaultLowStockThreshold: value.defaultLowStockThreshold,
          },
        },
        {
          onSuccess: () => {
            toastSuccess(t("success.shop_settings_updated"));
            queryClient.invalidateQueries({ queryKey: getShop.queryKey(shopId) });
            queryClient.invalidateQueries({ queryKey: getShops.queryKey });
          },
        }
      );
    },
  });

  useEffect(() => {
    form.reset({
      defaultValues: {
        name: shop.name,
        description: shop.description ?? "",
        defaultLowStockThreshold: shop.defaultLowStockThreshold ?? 5,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop.name, shop.description, shop.defaultLowStockThreshold]);

  return { form, error, isSaving, shopName: shop.name };
}
