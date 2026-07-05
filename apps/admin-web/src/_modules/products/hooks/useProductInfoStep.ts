import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { StepProps } from "@mercado/shared-ui/components/flowWizard";
import { useFetch } from "@/_shared/queryProvider";
import { useShop } from "@/_modules/shops/context/ShopProvider";
import { getCategories } from "@/_modules/categories/api";
import type { ICategory } from "@/_modules/categories/types";
import { isProductImageUrlValid } from "../components/ProductImageField";

export function useProductInfoStep({ data, submitRef, onComplete }: StepProps) {
  const { t } = useTranslation();
  const { shopId, shop } = useShop();
  const prevData = data.productInfo;
  const [name, setName] = useState(prevData?.name ?? "");
  const [description, setDescription] = useState(prevData?.description ?? "");
  const [imageUrl, setImageUrl] = useState(prevData?.imageUrl ?? "");
  const [categoryIds, setCategoryIds] = useState<string[]>(prevData?.categoryIds ?? []);
  const [categoryNames, setCategoryNames] = useState<Record<string, string>>(
    prevData?._categoryNames ?? {}
  );
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
  }, [
    name,
    description,
    imageUrl,
    shopId,
    shop.name,
    categoryIds,
    categoryNames,
    submitRef,
    onComplete,
    t,
  ]);

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

  return {
    error,
    name,
    setName,
    description,
    setDescription,
    imageUrl,
    setImageUrl,
    categoryIds,
    categoryNames,
    categoryTree,
    shopName: shop.name,
    handleToggleCategory,
  };
}
