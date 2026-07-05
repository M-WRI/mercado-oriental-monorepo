import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";
import { Input } from "@mercado/shared-ui/components/inputs/components/Input";
import { MdClose } from "react-icons/md";
import type { IEditableVariant, IProductAttribute } from "../../types";

interface VariantEditorCardProps {
  variant: IEditableVariant;
  shopAttributes: IProductAttribute[] | undefined;
  isDuplicate: boolean;
  onUpdateField: (tempId: string, field: "name" | "price" | "stock", value: string) => void;
  onToggleAttrValue: (
    tempId: string,
    attrId: string,
    attrName: string,
    valueId: string,
    valueName: string
  ) => void;
  onRemove: (tempId: string) => void;
}

export function VariantEditorCard({
  variant,
  shopAttributes,
  isDuplicate,
  onUpdateField,
  onToggleAttrValue,
  onRemove,
}: VariantEditorCardProps) {
  const { t } = useTranslation();

  return (
    <div
      className={`border rounded-lg p-4 ${
        isDuplicate ? "border-red-300 bg-red-50" : "border-gray-200"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <Input
              name={`var-name-${variant.tempId}`}
              label={t("products.variantsStep.nameLabel")}
              value={variant.name}
              onChange={(e) => onUpdateField(variant.tempId, "name", e.target.value)}
            />
            <Input
              name={`var-price-${variant.tempId}`}
              label={t("products.variantsStep.priceLabel")}
              type="number"
              value={variant.price}
              onChange={(e) => onUpdateField(variant.tempId, "price", e.target.value)}
            />
            <Input
              name={`var-stock-${variant.tempId}`}
              label={t("products.variantsStep.stockLabel")}
              type="number"
              value={variant.stock}
              onChange={(e) => onUpdateField(variant.tempId, "stock", e.target.value)}
            />
          </div>

          {shopAttributes && shopAttributes.length > 0 && (
            <div className="grid gap-2">
              {shopAttributes.map((attr) => {
                const selected = variant.attributeSelections.find((s) => s.attributeId === attr.id);
                return (
                  <div key={attr.id}>
                    <span className="text-xs font-medium text-gray-500">{attr.name}</span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {attr.productAttributeValues.map((av) => {
                        const isSelected = selected?.valueId === av.id;
                        return (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() =>
                              onToggleAttrValue(
                                variant.tempId,
                                attr.id,
                                attr.name,
                                av.id,
                                av.value
                              )
                            }
                            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                              isSelected
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-200 text-gray-600 hover:border-gray-400"
                            }`}
                          >
                            {av.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {isDuplicate && (
            <p className="text-xs text-red-500 mt-2">
              {t("products.editProduct_variantDuplicate")}
            </p>
          )}
          {variant.attributeValueIds.length === 0 && (
            <p className="text-xs text-red-500 mt-2">
              {t("products.editProduct_variantNeedsAttribute")}
            </p>
          )}
        </div>
        <Button
          onClick={() => onRemove(variant.tempId)}
          style="ghost"
          icon={<MdClose size={18} />}
          className="shrink-0 mt-0.5"
        />
      </div>
    </div>
  );
}
