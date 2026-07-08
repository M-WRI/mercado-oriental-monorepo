import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router";
import {
  usePost,
  PasswordRecoveryLayout,
  ResetPasswordForm,
} from "@mercado/shared-ui";

export const ResetPasswordScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const { mutate, isPending, error } = usePost<
    { token: string; newPassword: string },
    { message: string }
  >();

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-600">{t("auth.resetTokenMissing")}</p>
      </div>
    );
  }

  return (
    <PasswordRecoveryLayout
      title={t("auth.resetPasswordTitle")}
      backToLoginHref="/login"
      backToLoginLabel={t("auth.backToLogin")}
    >
      <ResetPasswordForm
        labels={{
          newPassword: t("settings.newPasswordLabel"),
          confirmPassword: t("settings.confirmPasswordLabel"),
          resetPasswordSubmit: t("auth.resetPasswordSubmit"),
          loading: t("common.loading"),
          resetPasswordFailed: t("auth.resetPasswordFailed"),
          passwordMismatch: t("settings.passwordMismatch"),
          passwordMinLength: t("auth.passwordMinLength8"),
        }}
        onSubmit={(newPassword) =>
          mutate(
            { url: "/auth/reset-password", data: { token, newPassword } },
            { onSuccess: () => navigate("/login") }
          )
        }
        isPending={isPending}
        hasError={Boolean(error)}
      />
    </PasswordRecoveryLayout>
  );
};
