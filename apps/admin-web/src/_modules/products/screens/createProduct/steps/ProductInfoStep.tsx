import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { StepProps } from "@mercado/shared-ui/components/flowWizard";
import { useFetch } from "@/_shared/queryProvider";
import { Input } from "@mercado/shared-ui/components/inputs/components/Input";
import { TextArea } from "@mercado/shared-ui/components/inputs/components/TextArea";
import { useShop } from "@/_modules/shops/context/ShopProvider";
import { CategoryPicker } from "@/_modules/categories/components";
import { getCategories } from "@/_modules/categories/api";
import type { ICategory } from "@/_modules/categories/types";
import { ProductImageField, isProductImageUrlValid } from "../../../components/ProductImageField";

export const ProductInfoStep = ({ data, submitRef, onComplete }: StepProps) => {
  const { t } = useTranslation();
  const { shopId, shop } = useShop();
  const prevData = data.productInfo;
  const [name, setName] = useState(prevData?.name ?? "");
  const [description, setDescription] = useState(prevData?.description ?? "");
  const [imageUrl, setImageUrl] = useState(prevData?.imageUrl ?? "");
  const [categoryIds, setCategoryIds] = useState<string[]>(prevData?.categoryIds ?? []);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>(prevData?._categoryNames ?? {});
  const [error, setError] = useState<string | null>(null);

  const { data: categoryTree } = useFetch<ICategory[]>({
    queryKey: getCategories.queryKey,
    url: getCategories.url,
  });

  useEffect(() => {
    submitRef.current = () => {
      setError(null);
      if (!name.trim()) {
        setError(t("products.infoStep.nameRequired"));
        return;
      }
      if (imageUrl.trim() && !isProductImageUrlValid(imageUrl)) {
        setError(t("products.infoStep.imageUrlInvalid"));
        return;
      }
      onComplete({
        name: name.trim(),
        description: description.trim(),
        imageUrl: imageUrl.trim(),
        shopId,
        shopName: shop.name,
        categoryIds,
        _categoryNames: categoryNames,
      });
    };
  }, [name, description, imageUrl, shopId, shop.name, categoryIds, categoryNames, submitRef, onComplete, t]);

  const handleToggleCategory = (id: string, catName: string, path: string) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
    setCategoryNames((prev) => {
      const next = { ...prev };
      if (next[id]) delete next[id];
      else next[id] = path || catName;
      return next;
    });
  };

  return (
    <div className="max-w-lg">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <div className="grid gap-5">
        <Input
          name="name"
          label={t("products.infoStep.nameLabel")}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("products.infoStep.namePlaceholder")}
        />

        <TextArea
          name="description"
          label={t("products.infoStep.descriptionLabel")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t("products.infoStep.descriptionPlaceholder")}
          rows={3}
        />

        <ProductImageField value={imageUrl} onChange={setImageUrl} />

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-gray-700">{t("products.infoStep.shopLabel")}</label>
          <p className="text-sm text-gray-600 px-4 py-3 rounded-lg border border-gray-200 bg-gray-50">
            {shop.name}
          </p>
        </div>

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-gray-700">{t("products.infoStep.categoriesLabel")}</label>
          {categoryIds.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-1">
              {categoryIds.map((id) => (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-xs font-medium px-2 py-1 rounded-full"
                >
                  {categoryNames[id] || id}
                  <button
                    type="button"
                    onClick={() => handleToggleCategory(id, categoryNames[id] || "", categoryNames[id] || "")}
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
              onToggle={handleToggleCategory}
            />
          ) : (
            <p className="text-sm text-gray-400">{t("common.loading")}</p>
          )}
        </div>
      </div>
    </div>
  );
};
