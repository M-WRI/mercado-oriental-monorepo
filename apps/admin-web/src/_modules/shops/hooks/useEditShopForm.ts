import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePut, useDelete } from "@/_shared/queryProvider";
import { useFormHook, useToast } from "@mercado/shared-ui";
import { deleteShop, getShop, getShops, updateShop } from "../api";
import type { IShop, ShopFormValues } from "../types";

export function useEditShopForm(shopId: string | undefined) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  const [error, setError] = useState<string | null>(null);
  const [shopToDelete, setShopToDelete] = useState<IShop | null>(null);

  const { data: shop, isLoading } = useFetch<IShop>({
    queryKey: getShop.queryKey(shopId),
    url: getShop.url(shopId),
    enabled: Boolean(shopId),
  });

  const { mutate: putShop, isPending: isSaving } = usePut();
  const { mutate: removeShop, isPending: isDeleting } = useDelete();

  const { form } = useFormHook({
    defaultValues: { name: "", description: "" } satisfies ShopFormValues,
    onSubmit: ({ value }: { value: ShopFormValues }) => {
      if (!shopId) return;
      setError(null);

      if (!value.name.trim()) {
        setError(t("shops.nameRequired"));
        return;
      }

      putShop(
        {
          url: updateShop.url(shopId),
          data: {
            name: value.name.trim(),
            description: value.description.trim() || null,
          },
        },
        {
          onSuccess: () => {
            toastSuccess(t("shops.updateSuccess"));
            queryClient.invalidateQueries({ queryKey: getShops.queryKey });
            queryClient.invalidateQueries({ queryKey: getShop.queryKey(shopId) });
            navigate("/shops");
          },
        }
      );
    },
  });

  useEffect(() => {
    if (!shop) return;
    form.reset({
      defaultValues: {
        name: shop.name,
        description: shop.description ?? "",
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shop?.name, shop?.description]);

  const confirmDelete = () => {
    if (!shopId) return;
    removeShop(
      { url: deleteShop.url(shopId) },
      {
        onSuccess: () => {
          toastSuccess(t("shops.deleteSuccess"));
          queryClient.invalidateQueries({ queryKey: getShops.queryKey });
          navigate("/shops");
        },
        onError: () => setShopToDelete(null),
      }
    );
  };

  const openDeleteDialog = () => {
    if (shop) setShopToDelete(shop);
  };

  return {
    shop,
    isLoading,
    form,
    error,
    isSaving,
    isDeleting,
    shopToDelete,
    setShopToDelete,
    openDeleteDialog,
    confirmDelete,
    goBack: () => navigate("/shops"),
  };
}
