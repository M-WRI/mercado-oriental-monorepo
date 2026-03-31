import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { StepProps } from "@mercado/shared-ui/components/flowWizard";
import { useFetch } from "@/_shared/queryProvider";
import { Input } from "@mercado/shared-ui/components/inputs/components/Input";
import { TextArea } from "@mercado/shared-ui/components/inputs/components/TextArea";
import { getShops } from "@/_modules/shops/api";
import type { IShop } from "@/_modules/products/types";

export const ProductInfoStep = ({ data, submitRef, onComplete }: StepProps) => {
  const { t } = useTranslation();
  const prevData = data.productInfo;
  const [name, setName] = useState(prevData?.name ?? "");
  const [description, setDescription] = useState(prevData?.description ?? "");
  const [shopId, setShopId] = useState(prevData?.shopId ?? "");
  const [shopName, setShopName] = useState(prevData?.shopName ?? "");
  const [error, setError] = useState<string | null>(null);

  const { data: shops } = useFetch<IShop[]>({
    queryKey: getShops.queryKey,
    url: getShops.url,
  });

  useEffect(() => {
    submitRef.current = () => {
      setError(null);
      if (!name.trim()) {
        setError(t("products.infoStep.nameRequired"));
        return;
      }
      if (!shopId) {
        setError(t("products.infoStep.shopRequired"));
        return;
      }
      onComplete({ name: name.trim(), description: description.trim(), shopId, shopName });
    };
  }, [name, description, shopId, shopName, submitRef, onComplete, t]);

  const handleShopChange = (id: string) => {
    setShopId(id);
    const shop = shops?.find((s) => s.id === id);
    setShopName(shop?.name ?? "");
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

        <div className="grid gap-1.5">
          <label className="text-sm font-medium text-gray-700">{t("products.infoStep.shopLabel")}</label>
          {shops && shops.length > 0 ? (
            <div className="grid gap-2">
              {shops.map((shop) => (
                <button
                  key={shop.id}
                  type="button"
                  onClick={() => handleShopChange(shop.id)}
                  className={`text-left px-4 py-3 rounded-lg border text-sm transition-colors duration-150 ${
                    shopId === shop.id
                      ? "border-gray-900 bg-gray-50 text-gray-900"
                      : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium">{shop.name}</span>
                  {shop.description && (
                    <span className="block text-xs text-gray-400 mt-0.5">
                      {shop.description}
                    </span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">{t("products.infoStep.noShops")}</p>
          )}
        </div>
      </div>
    </div>
  );
};
