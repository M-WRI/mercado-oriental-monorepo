import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePut } from "@/_shared/queryProvider";
import { useFormHook, useToast } from "@mercado/shared-ui";
import { getAttribute, getAttributes, updateAttribute } from "../api";
import { useShop } from "@/_modules/shops/context/ShopProvider";
import type { AttributeFormValues, IAttributeDetailResponse } from "../types";

export function useEditAttributeForm(attributeId: string) {
  const navigate = useNavigate();
  const { shopId, paths } = useShop();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const [error, setError] = useState<string | null>(null);

  const { data: attribute, isLoading } = useFetch<IAttributeDetailResponse>({
    queryKey: getAttribute.queryKey(attributeId),
    url: getAttribute.url(attributeId),
  });

  const { mutate: putAttribute, isPending } = usePut();

  const { form } = useFormHook({
    defaultValues: { name: "", description: "" } satisfies AttributeFormValues,
    onSubmit: ({ value }: { value: AttributeFormValues }) => {
      setError(null);
      if (!value.name.trim()) {
        setError(t("attributes.nameRequired"));
        return;
      }

      putAttribute(
        {
          url: updateAttribute.url(attributeId),
          data: {
            name: value.name.trim(),
            description: value.description.trim() || null,
          },
        },
        {
          onSuccess: () => {
            toastSuccess(t("success.attribute_updated"));
            queryClient.invalidateQueries({ queryKey: getAttributes.queryKey(shopId) });
            queryClient.invalidateQueries({ queryKey: getAttribute.queryKey(attributeId) });
            navigate(paths.attribute(attributeId));
          },
        }
      );
    },
  });

  useEffect(() => {
    if (!attribute) return;
    form.reset({
      defaultValues: {
        name: attribute.name,
        description: attribute.description ?? "",
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attribute?.name, attribute?.description]);

  return {
    attribute,
    isLoading,
    form,
    error,
    isPending,
    goBack: () => navigate(paths.attribute(attributeId)),
  };
}
