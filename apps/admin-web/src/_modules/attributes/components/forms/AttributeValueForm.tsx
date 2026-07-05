import { useTranslation } from "react-i18next";
import type { FormFromUseFormHook } from "@mercado/shared-ui";
import { Button } from "@mercado/shared-ui";
import { FormError } from "./FormError";

type AttributeValueFormProps = {
  form: FormFromUseFormHook;
  error: string | null;
  isPending: boolean;
  onCancel: () => void;
};

export function AttributeValueForm({
  form,
  error,
  isPending,
  onCancel,
}: AttributeValueFormProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4">
      <FormError message={error} />

      <form.AppField
        name="value"
        validators={{
          onSubmit: ({ value }) =>
            !value?.trim() ? t("attributes.valueRequired") : undefined,
        }}
      >
        {(field: any) => (
          <field.TextField
            label={t("attributes.value")}
            placeholder={t("attributes.valuePlaceholder")}
          />
        )}
      </form.AppField>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" style="ghost" onClick={onCancel} disabled={isPending}>
          {t("common.cancel")}
        </Button>
        <Button onClick={() => form.handleSubmit()} disabled={isPending}>
          {isPending ? t("common.submitting") : t("common.add")}
        </Button>
      </div>
    </div>
  );
}
