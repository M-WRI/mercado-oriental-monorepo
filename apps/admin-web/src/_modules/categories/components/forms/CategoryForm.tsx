import { useTranslation } from "react-i18next";
import type { FormFromUseFormHook } from "@mercado/shared-ui";
import { Button } from "@mercado/shared-ui";
import { FormError } from "./FormError";

type CategoryFormProps = {
  form: FormFromUseFormHook;
  error: string | null;
  isPending: boolean;
  onCancel: () => void;
};

export function CategoryForm({ form, error, isPending, onCancel }: CategoryFormProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4">
      <FormError message={error} />

      <form.AppField
        name="name"
        validators={{
          onSubmit: ({ value }) =>
            !value?.trim() ? t("categories.nameRequired") : undefined,
        }}
      >
        {(field: any) => (
          <field.TextField
            label={t("categories.name")}
            placeholder={t("categories.namePlaceholder")}
          />
        )}
      </form.AppField>

      <form.AppField name="slug">
        {(field: any) => (
          <field.TextField
            label={t("categories.slug")}
            placeholder={t("categories.slugPlaceholder")}
          />
        )}
      </form.AppField>
      <p className="text-xs text-gray-400 -mt-2">{t("categories.slugHint")}</p>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" style="ghost" onClick={onCancel} disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button onClick={() => form.handleSubmit()} disabled={isPending}>
          {isPending ? t("common.submitting") : t("common.save")}
        </Button>
      </div>
    </div>
  );
}
