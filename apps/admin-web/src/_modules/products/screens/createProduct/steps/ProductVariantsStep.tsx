import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { StepProps } from "@mercado/shared-ui/components/flowWizard";
import { Input } from "@mercado/shared-ui/components/inputs/components/Input";
import { Button, Tag } from "@mercado/shared-ui";
import type {
  IProductAttribute,
  INewAttribute,
  IWizardVariant,
  IVariantAttributeSelection,
} from "@/_modules/products/types";
import { MdAdd, MdClose } from "react-icons/md";

/** Merges selected existing attributes and new attributes into a unified list */
function getAvailableAttributes(
  selectedAttributes: IProductAttribute[],
  newAttributes: INewAttribute[]
) {
  const existing = selectedAttributes.map((a) => ({
    id: a.id,
    name: a.name,
    isNew: false,
    values: a.productAttributeValues.map((v) => ({ id: v.id, label: v.value })),
  }));

  const newOnes = newAttributes.map((a) => ({
    id: a.tempId,
    name: a.name,
    isNew: true,
    values: a.values.map((v, i) => ({ id: `${a.tempId}-val-${i}`, label: v })),
  }));

  return [...existing, ...newOnes];
}

export const ProductVariantsStep = ({ data, submitRef, onComplete }: StepProps) => {
  const { t } = useTranslation();
  const prevData = data.variants;
  const attributes = data.attributes;
  const availableAttrs = getAvailableAttributes(
    attributes?.selectedAttributes ?? [],
    attributes?.newAttributes ?? []
  );

  const [variants, setVariants] = useState<IWizardVariant[]>(prevData?.variants ?? []);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for a single variant being added
  const [varName, setVarName] = useState("");
  const [varPrice, setVarPrice] = useState("");
  const [varStock, setVarStock] = useState("");
  const [selections, setSelections] = useState<
    Record<string, { valueId: string; valueName: string }>
  >({});

  useEffect(() => {
    submitRef.current = () => {
      setError(null);
      if (variants.length === 0) {
        setError(t("products.variantsStep.addAtLeastOne"));
        return;
      }
      onComplete({ variants });
    };
  }, [variants, submitRef, onComplete, t]);

  const resetForm = () => {
    setVarName("");
    setVarPrice("");
    setVarStock("");
    setSelections({});
    setShowForm(false);
  };

  const handleAddVariant = () => {
    if (!varName.trim()) return;
    const price = parseFloat(varPrice);
    const stock = parseInt(varStock, 10);
    if (isNaN(price) || price < 0) return;

    const attributeSelections: IVariantAttributeSelection[] = Object.entries(
      selections
    ).map(([attrId, sel]) => {
      const attr = availableAttrs.find((a) => a.id === attrId);
      return {
        attributeId: attrId,
        attributeName: attr?.name ?? "",
        valueId: sel.valueId,
        valueName: sel.valueName,
      };
    });

    const variant: IWizardVariant = {
      tempId: `var-${Date.now()}`,
      name: varName.trim(),
      price,
      stock: isNaN(stock) ? 0 : stock,
      attributeSelections,
    };

    setVariants((prev) => [...prev, variant]);
    resetForm();
  };

  const removeVariant = (tempId: string) => {
    setVariants((prev) => prev.filter((v) => v.tempId !== tempId));
  };

  const selectValue = (attrId: string, valueId: string, valueName: string) => {
    setSelections((prev) => ({ ...prev, [attrId]: { valueId, valueName } }));
  };

  return (
    <div className="max-w-2xl">
      <p className="text-sm text-gray-500 mb-5">
        {t("products.variantsStep.description")}
      </p>

      {error && (
        <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">{error}</div>
      )}

      {/* Existing variants list */}
      {variants.length > 0 && (
        <div className="mb-6 grid gap-2">
          {variants.map((v) => (
            <div
              key={v.tempId}
              className="flex items-start gap-3 border border-gray-200 rounded-lg p-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-gray-900 text-sm">{v.name}</span>
                  <span className="text-xs text-gray-400">
                    €{v.price.toFixed(2)} · {v.stock} in stock
                  </span>
                </div>
                {v.attributeSelections.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {v.attributeSelections.map((sel) => (
                      <Tag key={sel.attributeId}>
                        {sel.attributeName}: {sel.valueName}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>
              <Button
                onClick={() => removeVariant(v.tempId)}
                style="ghost"
                icon={<MdClose size={18} />}
                className="shrink-0 mt-0.5"
              />
            </div>
          ))}
        </div>
      )}

      {/* Add variant form */}
      {showForm ? (
        <div className="border border-gray-200 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-700 mb-4">{t("products.variantsStep.newVariant")}</h5>
          <div className="grid gap-4">
            <Input
              name="variantName"
              label={t("products.variantsStep.nameLabel")}
              value={varName}
              onChange={(e) => setVarName(e.target.value)}
              placeholder={t("products.variantsStep.namePlaceholder")}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                name="variantPrice"
                label={t("products.variantsStep.priceLabel")}
                type="number"
                value={varPrice}
                onChange={(e) => setVarPrice(e.target.value)}
                placeholder={t("products.variantsStep.pricePlaceholder")}
              />
              <Input
                name="variantStock"
                label={t("products.variantsStep.stockLabel")}
                type="number"
                value={varStock}
                onChange={(e) => setVarStock(e.target.value)}
                placeholder={t("products.variantsStep.stockPlaceholder")}
              />
            </div>

            {/* Attribute value selection */}
            {availableAttrs.length > 0 && (
              <div className="grid gap-3">
                <label className="text-sm font-medium text-gray-700">{t("products.variantsStep.attributeValues")}</label>
                {availableAttrs.map((attr) => (
                  <div key={attr.id}>
                    <span className="text-sm text-gray-700 font-medium">{attr.name}</span>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {attr.values.map((val) => {
                        const isSelected = selections[attr.id]?.valueId === val.id;
                        return (
                          <button
                            key={val.id}
                            type="button"
                            onClick={() => selectValue(attr.id, val.id, val.label)}
                            className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                              isSelected
                                ? "border-gray-900 bg-gray-900 text-white"
                                : "border-gray-200 text-gray-600 hover:border-gray-400"
                            }`}
                          >
                            {val.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2 justify-end pt-1">
              <Button style="link" onClick={resetForm}>
                {t("common.cancel")}
              </Button>
              <Button
                onClick={handleAddVariant}
                disabled={!varName.trim() || !varPrice}
              >
                {t("products.variantsStep.addVariant")}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setShowForm(true)}
          style="dashed"
          icon={<MdAdd size={18} />}
        >
          {t("products.variantsStep.addVariant")}
        </Button>
      )}
    </div>
  );
};
