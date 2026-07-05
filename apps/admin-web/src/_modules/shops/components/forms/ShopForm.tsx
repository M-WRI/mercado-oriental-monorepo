import { useTranslation } from "react-i18next";
import type { FormFromUseFormHook } from "@mercado/shared-ui";
import { Button } from "@mercado/shared-ui";
import { FormError } from "./FormError";

type ShopFormProps = {
  form: FormFromUseFormHook;
  error: string | null;
  isPending: boolean;
  submitLabel: string;
  onCancel: () => void;
};

export function ShopForm({ form, error, isPending, submitLabel, onCancel }: ShopFormProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-5">
      <FormError message={error} />

      <form.AppField
        name="name"
        validators={{
          onSubmit: ({ value }) =>
            !value?.trim() ? t("shops.nameRequired") : undefined,
        }}
      >
        {(field: any) => (
          <field.TextField label={t("shops.nameLabel")} placeholder={t("shops.namePlaceholder")} />
        )}
      </form.AppField>

      <form.AppField name="description">
        {(field: any) => (
          <field.TextAreaField
            label={t("shops.descriptionLabel")}
            placeholder={t("shops.descriptionPlaceholder")}
            rows={3}
          />
        )}
      </form.AppField>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={() => form.handleSubmit()} disabled={isPending}>
          {isPending ? t("common.submitting") : submitLabel}
        </Button>
        <Button type="button" style="ghost" onClick={onCancel} disabled={isPending}>
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );
}
