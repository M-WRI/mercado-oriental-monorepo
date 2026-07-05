import { useTranslation } from "react-i18next";
import { Input } from "@mercado/shared-ui/components/inputs/components/Input";
import { TextArea } from "@mercado/shared-ui/components/inputs/components/TextArea";
import { CategoryPicker } from "@/_modules/categories/components";
import type { ICategory } from "@/_modules/categories/types";
import { ProductImageField } from "../ProductImageField";

export interface ProductInfoFieldsProps {
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  imageUrl: string;
  onImageUrlChange: (value: string) => void;
  categoryIds: string[];
  categoryNames: Record<string, string>;
  onToggleCategory: (id: string, catName: string, path: string) => void;
  categoryTree: ICategory[] | undefined;
  shopName: string;
}

export function ProductInfoFields({
  name,
  onNameChange,
  description,
  onDescriptionChange,
  imageUrl,
  onImageUrlChange,
  categoryIds,
  categoryNames,
  onToggleCategory,
  categoryTree,
  shopName,
}: ProductInfoFieldsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-5">
      <Input
        name="name"
        label={t("products.infoStep.nameLabel")}
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder={t("products.infoStep.namePlaceholder")}
      />

      <TextArea
        name="description"
        label={t("products.infoStep.descriptionLabel")}
        value={description}
        onChange={(e) => onDescriptionChange(e.target.value)}
        placeholder={t("products.infoStep.descriptionPlaceholder")}
        rows={3}
      />

      <ProductImageField value={imageUrl} onChange={onImageUrlChange} />

      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          {t("products.infoStep.categoriesLabel")}
        </label>
        {categoryIds.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {categoryIds.map((catId) => (
              <span
                key={catId}
                className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full"
              >
                {categoryNames[catId] || catId}
                <button
                  type="button"
                  onClick={() =>
                    onToggleCategory(catId, categoryNames[catId] || "", categoryNames[catId] || "")
                  }
                  className="hover:text-indigo-900"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        {categoryTree ? (
          <CategoryPicker
            categories={categoryTree}
            selectedIds={categoryIds}
            onToggle={onToggleCategory}
          />
        ) : (
          <p className="text-sm text-gray-400">{t("common.loading")}</p>
        )}
      </div>

      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-gray-700">
          {t("products.infoStep.shopLabel")}
        </label>
        <p className="text-sm text-gray-600 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50">
          {shopName}
        </p>
      </div>
    </div>
  );
}
