import { useTranslation } from "react-i18next";
import type { FormFromUseFormHook } from "@mercado/shared-ui";
import { Button } from "@mercado/shared-ui";

type WizardVariantFormProps = {
  form: FormFromUseFormHook;
  availableAttrs: ReturnType<
    typeof import("../../utils/wizardAttributes").getAvailableAttributes
  >;
  selections: Record<string, { valueId: string; valueName: string }>;
  onSelectValue: (attrId: string, valueId: string, valueName: string) => void;
  onCancel: () => void;
};

export function WizardVariantForm({
  form,
  availableAttrs,
  selections,
  onSelectValue,
  onCancel,
}: WizardVariantFormProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4">
      <form.AppField
        name="name"
        validators={{
          onSubmit: ({ value }) =>
            !value?.trim() ? t("products.variantsStep.nameLabel") : undefined,
        }}
      >
        {(field: any) => (
          <field.TextField
            label={t("products.variantsStep.nameLabel")}
            placeholder={t("products.variantsStep.namePlaceholder")}
          />
        )}
      </form.AppField>

      <div className="grid grid-cols-2 gap-3">
        <form.AppField name="price">
          {(field: any) => (
            <field.TextField
              label={t("products.variantsStep.priceLabel")}
              type="number"
              placeholder={t("products.variantsStep.pricePlaceholder")}
            />
          )}
        </form.AppField>
        <form.AppField name="stock">
          {(field: any) => (
            <field.TextField
              label={t("products.variantsStep.stockLabel")}
              type="number"
              placeholder={t("products.variantsStep.stockPlaceholder")}
            />
          )}
        </form.AppField>
      </div>

      {availableAttrs.length > 0 && (
        <div className="grid gap-3">
          <label className="text-sm font-medium text-gray-700">
            {t("products.variantsStep.attributeValues")}
          </label>
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
                      onClick={() => onSelectValue(attr.id, val.id, val.label)}
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

      <div className="flex gap-2 justify-end pt-1">
        <Button style="link" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button onClick={() => form.handleSubmit()}>{t("products.variantsStep.addVariant")}</Button>
      </div>
    </div>
  );
}
