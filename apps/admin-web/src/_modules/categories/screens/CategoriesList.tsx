import { useTranslation } from "react-i18next";
import { Button, ConfirmDialog, useModal } from "@mercado/shared-ui";
import { MdAdd } from "react-icons/md";
import { CategoryFormModal, CategoryTreeAdmin } from "../components";
import { useCategoriesList } from "../hooks";

export const CategoriesList = () => {
  const { t } = useTranslation();
  const { openModal, ModalRenderer, closeModal } = useModal({});
  const categories = useCategoriesList();

  if (categories.isLoading) {
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
              {t("categories.totalCount", { count: categories.total })}
            </p>
          </div>
          <Button
            icon={<MdAdd size={16} />}
            onClick={() => openModal(CategoryFormModal, { onClose: closeModal, parent: null })}
          >
            {t("categories.addRoot")}
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {categories.categories.length > 0 ? (
            <CategoryTreeAdmin
              categories={categories.categories}
              onAddChild={(parent) =>
                openModal(CategoryFormModal, { onClose: closeModal, parent })
              }
              onEdit={(category) =>
                openModal(CategoryFormModal, { onClose: closeModal, category })
              }
              onDelete={categories.setDeleteTarget}
            />
          ) : (
            <p className="text-sm text-gray-400">{t("categories.empty")}</p>
          )}
        </div>
      </div>

      {categories.deleteTarget && (
        <ConfirmDialog
          title={t("categories.deleteConfirmTitle")}
          message={t("categories.deleteConfirmMessage", {
            name: categories.deleteTarget.name,
            children: categories.deleteTarget.children.length,
          })}
          confirmLabel={t("common.delete")}
          onConfirm={categories.confirmDelete}
          onCancel={() => categories.setDeleteTarget(null)}
          isLoading={categories.isDeleting}
        />
      )}
    </>
  );
};
