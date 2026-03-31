import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { StepProps } from "@mercado/shared-ui/components/flowWizard";
import type { IProductInfoData, IAttributesData, IWizardVariant } from "@/_modules/products/types";

export const ProductReviewStep = ({ data, submitRef, onComplete }: StepProps) => {
  const { t } = useTranslation();
  const productInfo: IProductInfoData = data.productInfo;
  const attributes: IAttributesData = data.attributes;
  const variants: IWizardVariant[] = data.variants?.variants ?? [];

  const totalStock = variants.reduce((sum, v) => sum + v.stock, 0);

  useEffect(() => {
    submitRef.current = () => {
      onComplete({ confirmed: true });
    };
  }, [submitRef, onComplete]);

  return (
    <div className="max-w-lg">
      <p className="text-sm text-gray-500 mb-6">
        {t("products.reviewStep.description")}
      </p>

      {/* Product Info */}
      <div className="mb-6">
        <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">{t("products.reviewStep.product")}</h5>
        <div className="border border-gray-200 rounded-lg p-4">
          <p className="font-medium text-gray-900">{productInfo.name}</p>
          {productInfo.description && (
            <p className="text-sm text-gray-500 mt-1">{productInfo.description}</p>
          )}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <span className="text-xs text-gray-400">{t("products.reviewStep.shop")}</span>
            <p className="text-sm text-gray-700">{productInfo.shopName}</p>
          </div>
        </div>
      </div>

      {/* Attributes */}
      <div className="mb-6">
        <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          {t("products.reviewStep.attributes")} ({(attributes.selectedAttributes?.length ?? 0) + (attributes.newAttributes?.length ?? 0)})
        </h5>

        {attributes.selectedAttributes?.length === 0 && attributes.newAttributes?.length === 0 ? (
          <p className="text-sm text-gray-400 border border-gray-200 rounded-lg p-4">
            {t("products.reviewStep.noAttributes")}
          </p>
        ) : (
          <div className="grid gap-2">
            {attributes.selectedAttributes?.map((attr) => (
              <div key={attr.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">{t("products.reviewStep.existing")}</span>
                  <span className="font-medium text-gray-900 text-sm">{attr.name}</span>
                </div>
                {attr.productAttributeValues.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {attr.productAttributeValues.map((v) => (
                      <span key={v.id} className="inline-block bg-gray-50 text-gray-600 text-xs px-2 py-0.5 rounded border border-gray-100">
                        {v.value}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {attributes.newAttributes?.map((attr) => (
              <div key={attr.tempId} className="border border-green-200 bg-green-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{t("products.reviewStep.new")}</span>
                  <span className="font-medium text-gray-900 text-sm">{attr.name}</span>
                </div>
                {attr.values.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {attr.values.map((v, i) => (
                      <span key={i} className="inline-block bg-white text-gray-600 text-xs px-2 py-0.5 rounded border border-green-200">
                        {v}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants */}
      <div>
        <h5 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          {t("products.reviewStep.variants")} ({variants.length}) · {t("products.reviewStep.totalStock")} {totalStock}
        </h5>
        <div className="grid gap-2">
          {variants.map((v) => (
            <div key={v.tempId} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900 text-sm">{v.name}</span>
                <span className="text-sm text-gray-500">
                  €{v.price.toFixed(2)} · {v.stock} {t("common.unit_plural")}
                </span>
              </div>
              {v.attributeSelections.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {v.attributeSelections.map((sel) => (
                    <span
                      key={sel.attributeId}
                      className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded"
                    >
                      {sel.attributeName}: {sel.valueName}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
