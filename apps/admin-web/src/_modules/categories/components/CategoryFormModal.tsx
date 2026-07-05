import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { usePost, usePut } from "@/_shared/queryProvider";
import { Button, useToast } from "@mercado/shared-ui";
import { Input } from "@mercado/shared-ui/components/inputs/components/Input";
import { createCategory, getCategories, updateCategory } from "../api";
import type { ICategory } from "../types";

export type CategoryFormModalProps = {
  onClose: () => void;
  category?: ICategory | null;
  parent?: ICategory | null;
};

export function CategoryFormModal({ onClose, category, parent }: CategoryFormModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const isEdit = Boolean(category);

  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(category?.name ?? "");
    setSlug(category?.slug ?? "");
  }, [category]);

  const { mutate: postCategory, isPending: isCreating } = usePost();
  const { mutate: putCategory, isPending: isUpdating } = usePut();
  const isPending = isCreating || isUpdating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError(t("categories.nameRequired"));
      return;
    }

    const payload = {
      name: name.trim(),
      ...(slug.trim() ? { slug: slug.trim() } : {}),
      parentId: isEdit ? category!.parentId : parent?.id ?? null,
    };

    const onSuccess = () => {
      toastSuccess(isEdit ? t("success.category_updated") : t("success.category_created"));
      queryClient.invalidateQueries({ queryKey: getCategories.queryKey });
      onClose();
    };

    if (isEdit && category) {
      putCategory(
        { url: updateCategory.url(category.id), data: payload },
        { onSuccess }
      );
    } else {
      postCategory(
        { url: createCategory.url, data: payload },
        { onSuccess }
      );
    }
  };

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

        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>
          )}

          <Input
            name="name"
            label={t("categories.name")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("categories.namePlaceholder")}
          />

          <Input
            name="slug"
            label={t("categories.slug")}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={t("categories.slugPlaceholder")}
          />
          <p className="text-xs text-gray-400 -mt-2">{t("categories.slugHint")}</p>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" style="ghost" onClick={onClose} disabled={isPending}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("common.submitting") : t("common.save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
