import { useTranslation } from "react-i18next";
import type { ICategory } from "@/_modules/categories/types";
import { ProductInfoFields } from "../forms";

interface EditProductInfoSectionProps {
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
  isActive: boolean;
  onToggleActive: () => void;
}

export function EditProductInfoSection({
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
  isActive,
  onToggleActive,
}: EditProductInfoSectionProps) {
  const { t } = useTranslation();

  return (
    <div className="max-w-lg grid gap-5 mb-8">
      <ProductInfoFields
        name={name}
        onNameChange={onNameChange}
        description={description}
        onDescriptionChange={onDescriptionChange}
        imageUrl={imageUrl}
        onImageUrlChange={onImageUrlChange}
        categoryIds={categoryIds}
        categoryNames={categoryNames}
        onToggleCategory={onToggleCategory}
        categoryTree={categoryTree}
        shopName={shopName}
      />

      <div className="grid gap-1.5">
        <label className="text-sm font-medium text-gray-700">{t("products.activeStatus")}</label>
        <button
          type="button"
          onClick={onToggleActive}
          className={`flex items-center gap-2 w-fit px-3 py-2 rounded-lg border text-sm transition-colors duration-150 ${
            isActive
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-gray-300 bg-gray-50 text-gray-500"
          }`}
        >
          <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`} />
          {isActive ? t("products.active") : t("products.inactive")}
        </button>
        <p className="text-xs text-gray-400">{t("products.activeStatusHint")}</p>
      </div>
    </div>
  );
}
