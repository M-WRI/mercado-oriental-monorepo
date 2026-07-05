import { useTranslation } from "react-i18next";
import type { FormFromUseFormHook } from "@mercado/shared-ui";
import { Button } from "@mercado/shared-ui";

type NewAttributeFormProps = {
  form: FormFromUseFormHook;
  onCancel: () => void;
};

export function NewAttributeForm({ form, onCancel }: NewAttributeFormProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-3">
      <form.AppField
        name="name"
        validators={{
          onSubmit: ({ value }) =>
            !value?.trim() ? t("products.attributesStep.nameLabel") : undefined,
        }}
      >
        {(field: any) => (
          <field.TextField
            label={t("products.attributesStep.nameLabel")}
            placeholder={t("products.attributesStep.namePlaceholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="description">
        {(field: any) => (
          <field.TextField
            label={t("products.attributesStep.descriptionLabel")}
            placeholder={t("products.attributesStep.descriptionPlaceholder")}
          />
        )}
      </form.AppField>
      <form.AppField name="values">
        {(field: any) => (
          <field.CommaSeparatedField label={t("products.attributesStep.valuesLabel")} />
        )}
      </form.AppField>
      <div className="flex gap-2 justify-end">
        <Button style="link" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button onClick={() => form.handleSubmit()}>{t("common.add")}</Button>
      </div>
    </div>
  );
}
