import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePatch } from "@/_shared/queryProvider";
import { useAuth, useFormHook, useToast } from "@mercado/shared-ui";
import { updateProfile } from "@/_modules/auth/api";
import type { ProfileFormValues } from "../types";

export function useAccountSettingsForm() {
  const { t } = useTranslation();
  const { user, refreshUser } = useAuth();
  const { success: toastSuccess } = useToast();
  const [error, setError] = useState<string | null>(null);
  const { mutate: patchProfile, isPending: isSaving } = usePatch();

  const { form } = useFormHook({
    defaultValues: {
      name: user?.name ?? "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    } satisfies ProfileFormValues,
    onSubmit: ({ value }: { value: ProfileFormValues }) => {
      setError(null);

      if (!value.name.trim()) {
        setError(t("settings.nameRequired"));
        return;
      }

      const wantsPasswordChange =
        value.currentPassword.trim() ||
        value.newPassword.trim() ||
        value.confirmPassword.trim();

      if (wantsPasswordChange) {
        if (!value.currentPassword.trim()) {
          setError(t("settings.currentPasswordRequired"));
          return;
        }
        if (value.newPassword.length < 8) {
          setError(t("settings.newPasswordTooShort"));
          return;
        }
        if (value.newPassword !== value.confirmPassword) {
          setError(t("settings.passwordMismatch"));
          return;
        }
      }

      const data: {
        name: string;
        currentPassword?: string;
        newPassword?: string;
      } = { name: value.name.trim() };

      if (wantsPasswordChange) {
        data.currentPassword = value.currentPassword;
        data.newPassword = value.newPassword;
      }

      patchProfile(
        { url: updateProfile.url, data },
        {
          onSuccess: async () => {
            toastSuccess(t("success.profile_updated"));
            await refreshUser();
            form.reset({
              defaultValues: {
                name: value.name.trim(),
                currentPassword: "",
                newPassword: "",
                confirmPassword: "",
              },
            });
          },
        }
      );
    },
  });

  useEffect(() => {
    form.reset({
      defaultValues: {
        name: user?.name ?? "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.name]);

  return { form, error, isSaving, email: user?.email ?? "" };
}
