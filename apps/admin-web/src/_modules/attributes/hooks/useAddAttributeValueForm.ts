import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { usePost } from "@/_shared/queryProvider";
import { useFormHook, useToast } from "@mercado/shared-ui";
import { createAttributeValue, getAttribute } from "../api";
import type { AttributeValueFormValues } from "../types";

export function useAddAttributeValueForm(attributeId: string, onClose: () => void) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const [error, setError] = useState<string | null>(null);
  const { mutate: postValue, isPending } = usePost();

  const { form } = useFormHook({
    defaultValues: { value: "" } satisfies AttributeValueFormValues,
    onSubmit: ({ value }: { value: AttributeValueFormValues }) => {
      setError(null);
      if (!value.value.trim()) {
        setError(t("attributes.valueRequired"));
        return;
      }

      postValue(
        { url: createAttributeValue.url(attributeId), data: { value: value.value.trim() } },
        {
          onSuccess: () => {
            toastSuccess(t("success.attribute_value_created"));
            queryClient.invalidateQueries({ queryKey: getAttribute.queryKey(attributeId) });
            onClose();
          },
        }
      );
    },
  });

  return { form, error, isPending };
}
