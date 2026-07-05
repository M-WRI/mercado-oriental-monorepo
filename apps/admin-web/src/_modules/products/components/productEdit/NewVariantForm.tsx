import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";
import { Input } from "@mercado/shared-ui/components/inputs/components/Input";
import type { IProductAttribute } from "../../types";

interface NewVariantFormProps {
  shopAttributes: IProductAttribute[] | undefined;
  newVarName: string;
  onNewVarNameChange: (value: string) => void;
  newVarPrice: string;
  onNewVarPriceChange: (value: string) => void;
  newVarStock: string;
  onNewVarStockChange: (value: string) => void;
  newSelections: Record<string, { valueId: string; valueName: string }>;
  onNewSelectionChange: (
    attrId: string,
    selection: { valueId: string; valueName: string }
  ) => void;
  onCancel: () => void;
  onAdd: () => void;
}

export function NewVariantForm({
  shopAttributes,
  newVarName,
  onNewVarNameChange,
  newVarPrice,
  onNewVarPriceChange,
  newVarStock,
  onNewVarStockChange,
  newSelections,
  onNewSelectionChange,
  onCancel,
  onAdd,
}: NewVariantFormProps) {
  const { t } = useTranslation();

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h5 className="text-sm font-medium text-gray-700 mb-4">
        {t("products.variantsStep.newVariant")}
      </h5>
      <div className="grid gap-4">
        <Input
          name="newVarName"
          label={t("products.variantsStep.nameLabel")}
          value={newVarName}
          onChange={(e) => onNewVarNameChange(e.target.value)}
          placeholder={t("products.variantsStep.namePlaceholder")}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            name="newVarPrice"
            label={t("products.variantsStep.priceLabel")}
            type="number"
            value={newVarPrice}
            onChange={(e) => onNewVarPriceChange(e.target.value)}
            placeholder={t("products.variantsStep.pricePlaceholder")}
          />
          <Input
            name="newVarStock"
            label={t("products.variantsStep.stockLabel")}
            type="number"
            value={newVarStock}
            onChange={(e) => onNewVarStockChange(e.target.value)}
            placeholder={t("products.variantsStep.stockPlaceholder")}
          />
        </div>

        {shopAttributes && shopAttributes.length > 0 && (
          <div className="grid gap-3">
            <label className="text-sm font-medium text-gray-700">
              {t("products.variantsStep.attributeValues")}
            </label>
            {shopAttributes.map((attr) => (
              <div key={attr.id}>
                <span className="text-sm text-gray-700 font-medium">{attr.name}</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {attr.productAttributeValues.map((av) => {
                    const isSelected = newSelections[attr.id]?.valueId === av.id;
                    return (
                      <button
                        key={av.id}
                        type="button"
                        onClick={() =>
                          onNewSelectionChange(attr.id, {
                            valueId: av.id,
                            valueName: av.value,
                          })
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
            ))}
          </div>
        )}

        <div className="flex gap-2 justify-end pt-1">
          <Button style="link" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button onClick={onAdd} disabled={!newVarName.trim() || !newVarPrice}>
            {t("products.variantsStep.addVariant")}
          </Button>
        </div>
      </div>
    </div>
  );
}
