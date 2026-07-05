import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { usePost, usePut } from "@/_shared/queryProvider";
import { useFormHook, useToast } from "@mercado/shared-ui";
import { createCategory, getCategories, updateCategory } from "../api";
import type { ICategory } from "../types";
import type { CategoryFormValues } from "../utils";

type UseCategoryFormOptions = {
  category?: ICategory | null;
  parent?: ICategory | null;
  onClose: () => void;
};

export function useCategoryForm({ category, parent, onClose }: UseCategoryFormOptions) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const isEdit = Boolean(category);
  const [error, setError] = useState<string | null>(null);

  const { mutate: postCategory, isPending: isCreating } = usePost();
  const { mutate: putCategory, isPending: isUpdating } = usePut();
  const isPending = isCreating || isUpdating;

  const { form } = useFormHook({
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
    } satisfies CategoryFormValues,
    onSubmit: ({ value }: { value: CategoryFormValues }) => {
      setError(null);
      if (!value.name.trim()) {
        setError(t("categories.nameRequired"));
        return;
      }

      const payload = {
        name: value.name.trim(),
        ...(value.slug.trim() ? { slug: value.slug.trim() } : {}),
        parentId: isEdit ? category!.parentId : parent?.id ?? null,
      };

      const onSuccess = () => {
        toastSuccess(isEdit ? t("success.category_updated") : t("success.category_created"));
        queryClient.invalidateQueries({ queryKey: getCategories.queryKey });
        onClose();
      };

      if (isEdit && category) {
        putCategory({ url: updateCategory.url(category.id), data: payload }, { onSuccess });
      } else {
        postCategory({ url: createCategory.url, data: payload }, { onSuccess });
      }
    },
  });

  useEffect(() => {
    form.reset({
      defaultValues: {
        name: category?.name ?? "",
        slug: category?.slug ?? "",
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category?.id, category?.name, category?.slug]);

  return { form, error, isPending, isEdit };
}
