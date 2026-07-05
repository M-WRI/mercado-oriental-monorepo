import { useTranslation } from "react-i18next";
import type { FormFromUseFormHook } from "@mercado/shared-ui";
import { Button } from "@mercado/shared-ui";
import { FormError } from "./FormError";

type AttributeDetailsFormProps = {
  form: FormFromUseFormHook;
  error: string | null;
  isPending: boolean;
  onCancel: () => void;
};

export function AttributeDetailsForm({
  form,
  error,
  isPending,
  onCancel,
}: AttributeDetailsFormProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-5">
      <FormError message={error} />

      <form.AppField
        name="name"
        validators={{
          onSubmit: ({ value }) =>
            !value?.trim() ? t("attributes.nameRequired") : undefined,
        }}
      >
        {(field: any) => <field.TextField label={t("attributes.name")} />}
      </form.AppField>

      <form.AppField name="description">
        {(field: any) => (
          <field.TextAreaField label={t("attributes.description")} rows={3} />
        )}
      </form.AppField>

      <div className="flex items-center gap-3 pt-2">
        <Button onClick={() => form.handleSubmit()} disabled={isPending}>
          {isPending ? t("common.submitting") : t("common.save")}
        </Button>
        <Button type="button" style="ghost" onClick={onCancel} disabled={isPending}>
          {t("common.cancel")}
        </Button>
      </div>
    </div>
  );
}
