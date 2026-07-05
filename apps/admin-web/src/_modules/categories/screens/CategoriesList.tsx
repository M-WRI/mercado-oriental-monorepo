import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, useDelete } from "@/_shared/queryProvider";
import { Button, ConfirmDialog, useModal, useToast } from "@mercado/shared-ui";
import { MdAdd } from "react-icons/md";
import { deleteCategory, getCategories } from "../api";
import type { ICategory } from "../types";
import { CategoryFormModal, CategoryTreeAdmin } from "../components";

function countCategories(categories: ICategory[]): number {
  return categories.reduce(
    (sum, cat) => sum + 1 + countCategories(cat.children ?? []),
    0
  );
}

export const CategoriesList = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const { openModal, ModalRenderer, closeModal } = useModal({});

  const { data: categories, isLoading } = useFetch<ICategory[]>({
    queryKey: getCategories.queryKey,
    url: getCategories.url,
  });

  const { mutate: removeCategory, isPending: isDeleting } = useDelete();
  const [deleteTarget, setDeleteTarget] = useState<ICategory | null>(null);

  const total = categories ? countCategories(categories) : 0;

  const handleDelete = () => {
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <>
      {ModalRenderer}
      <div className="flex flex-col h-full min-h-0">
        <div className="shrink-0 flex items-start justify-between gap-4 mb-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{t("categories.title")}</h4>
            <p className="text-sm text-gray-500 mt-1">{t("categories.subtitle")}</p>
            <p className="text-xs text-gray-400 mt-2">
              {t("categories.totalCount", { count: total })}
            </p>
          </div>
          <Button
            icon={<MdAdd size={16} />}
            onClick={() =>
              openModal(CategoryFormModal, { onClose: closeModal, parent: null })
            }
          >
            {t("categories.addRoot")}
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {categories && categories.length > 0 ? (
            <CategoryTreeAdmin
              categories={categories}
              onAddChild={(parent) =>
                openModal(CategoryFormModal, { onClose: closeModal, parent })
              }
              onEdit={(category) =>
                openModal(CategoryFormModal, { onClose: closeModal, category })
              }
              onDelete={setDeleteTarget}
            />
          ) : (
            <p className="text-sm text-gray-400">{t("categories.empty")}</p>
          )}
        </div>
      </div>

      {deleteTarget && (
        <ConfirmDialog
          title={t("categories.deleteConfirmTitle")}
          message={t("categories.deleteConfirmMessage", {
            name: deleteTarget.name,
            children: deleteTarget.children.length,
          })}
          confirmLabel={t("common.delete")}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
};
