import { useTranslation } from "react-i18next";
import type { FormFromUseFormHook } from "@mercado/shared-ui";
import { Button } from "@mercado/shared-ui";
import { FormError } from "./FormError";

type ShopSettingsFormProps = {
  form: FormFromUseFormHook;
  error: string | null;
  isSaving: boolean;
};

export function ShopSettingsForm({ form, error, isSaving }: ShopSettingsFormProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4">
      <FormError message={error} />

      <form.AppField
        name="name"
        validators={{
          onSubmit: ({ value }) =>
            !value?.trim() ? t("shops.nameRequired") : undefined,
        }}
      >
        {(field: any) => <field.TextField label={t("shops.nameLabel")} />}
      </form.AppField>

      <form.AppField name="description">
        {(field: any) => (
          <field.TextAreaField label={t("shops.descriptionLabel")} rows={3} />
        )}
      </form.AppField>

      <form.AppField
        name="defaultLowStockThreshold"
        validators={{
          onSubmit: ({ value }) =>
            isNaN(value) || value < 0 ? t("settings.lowStockInvalid") : undefined,
        }}
      >
        {(field: any) => <field.NumberField label={t("settings.lowStockLabel")} />}
      </form.AppField>
      <p className="text-xs text-gray-400 -mt-2">{t("settings.lowStockHint")}</p>

      <div className="pt-2">
        <Button onClick={() => form.handleSubmit()} disabled={isSaving}>
          {isSaving ? t("common.submitting") : t("settings.saveShop")}
        </Button>
      </div>
    </div>
  );
}
