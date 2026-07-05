import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { usePost } from "@/_shared/queryProvider";
import { useFormHook, useToast } from "@mercado/shared-ui";
import { createShop, getShops } from "../api";
import type { IShop, ShopFormValues } from "../types";

export function useCreateShopForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const [error, setError] = useState<string | null>(null);

  const { mutate: postShop, isPending } = usePost<
    { name: string; description?: string },
    IShop
  >();

  const { form } = useFormHook({
    defaultValues: { name: "", description: "" } satisfies ShopFormValues,
    onSubmit: ({ value }: { value: ShopFormValues }) => {
      setError(null);

      if (!value.name.trim()) {
        setError(t("shops.nameRequired"));
        return;
      }

      postShop(
        {
          url: createShop.url,
          data: {
            name: value.name.trim(),
            description: value.description.trim() || undefined,
          },
        },
        {
          onSuccess: (shop) => {
            toastSuccess(t("shops.createSuccess"));
            queryClient.invalidateQueries({ queryKey: getShops.queryKey });
            navigate(`/s/${shop.id}`);
          },
        }
      );
    },
  });

  return {
    form,
    error,
    isPending,
    goBack: () => navigate("/shops"),
  };
}
