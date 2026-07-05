import { useTranslation } from "react-i18next";
import type { FormFromUseFormHook } from "@mercado/shared-ui";
import { Button } from "@mercado/shared-ui";
import { Input } from "@mercado/shared-ui/components/inputs/components/Input";
import { FormError } from "./FormError";

type AccountSettingsFormProps = {
  form: FormFromUseFormHook;
  email: string;
  error: string | null;
  isSaving: boolean;
};

export function AccountSettingsForm({ form, email, error, isSaving }: AccountSettingsFormProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4">
      <FormError message={error} />

      <Input name="email" label={t("settings.emailLabel")} value={email} />

      <form.AppField
        name="name"
        validators={{
          onSubmit: ({ value }) =>
            !value?.trim() ? t("settings.nameRequired") : undefined,
        }}
      >
        {(field: any) => <field.TextField label={t("settings.nameLabel")} />}
      </form.AppField>

      <div className="pt-2 border-t border-gray-100">
        <p className="text-sm font-medium text-gray-700 mb-3">{t("settings.changePassword")}</p>
        <div className="grid gap-4">
          <form.AppField name="currentPassword">
            {(field: any) => (
              <field.TextField label={t("settings.currentPasswordLabel")} type="password" />
            )}
          </form.AppField>
          <form.AppField name="newPassword">
            {(field: any) => (
              <field.TextField label={t("settings.newPasswordLabel")} type="password" />
            )}
          </form.AppField>
          <form.AppField name="confirmPassword">
            {(field: any) => (
              <field.TextField label={t("settings.confirmPasswordLabel")} type="password" />
            )}
          </form.AppField>
        </div>
      </div>

      <div className="pt-2">
        <Button onClick={() => form.handleSubmit()} disabled={isSaving}>
          {isSaving ? t("common.submitting") : t("settings.saveAccount")}
        </Button>
      </div>
    </div>
  );
}
