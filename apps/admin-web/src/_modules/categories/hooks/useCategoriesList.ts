import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, useDelete } from "@/_shared/queryProvider";
import { useToast } from "@mercado/shared-ui";
import { deleteCategory, getCategories } from "../api";
import { countCategories } from "../utils";
import type { ICategory } from "../types";

export function useCategoriesList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  const { data: categories, isLoading } = useFetch<ICategory[]>({
    queryKey: getCategories.queryKey,
    url: getCategories.url,
  });

  const { mutate: removeCategory, isPending: isDeleting } = useDelete();
  const [deleteTarget, setDeleteTarget] = useState<ICategory | null>(null);

  const list = categories ?? [];
  const total = countCategories(list);

  const confirmDelete = () => {
    if (!deleteTarget) return;
    removeCategory(
      { url: deleteCategory.url(deleteTarget.id) },
      {
        onSuccess: () => {
          toastSuccess(t("success.category_deleted"));
          queryClient.invalidateQueries({ queryKey: getCategories.queryKey });
          setDeleteTarget(null);
        },
        onError: () => setDeleteTarget(null),
      }
    );
  };

  return {
    categories: list,
    isLoading,
    total,
    deleteTarget,
    setDeleteTarget,
    confirmDelete,
    isDeleting,
  };
}
