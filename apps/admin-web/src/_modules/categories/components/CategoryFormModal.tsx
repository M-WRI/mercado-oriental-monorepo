import { useTranslation } from "react-i18next";
import { CategoryForm } from "./forms";
import { useCategoryForm } from "../hooks";
import type { ICategory } from "../types";

export type CategoryFormModalProps = {
  onClose: () => void;
  category?: ICategory | null;
  parent?: ICategory | null;
};

export function CategoryFormModal({ onClose, category, parent }: CategoryFormModalProps) {
  const { t } = useTranslation();
  const { form, error, isPending, isEdit } = useCategoryForm({ category, parent, onClose });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {isEdit ? t("categories.editCategory") : t("categories.createCategory")}
        </h3>
        {!isEdit && parent && (
          <p className="text-sm text-gray-500 mb-4">
            {t("categories.underParent", { name: parent.name })}
          </p>
        )}
        {!isEdit && !parent && (
          <p className="text-sm text-gray-500 mb-4">{t("categories.rootCategory")}</p>
        )}

        <CategoryForm
          form={form}
          error={error}
          isPending={isPending}
          onCancel={onClose}
        />
      </div>
    </div>
  );
}
