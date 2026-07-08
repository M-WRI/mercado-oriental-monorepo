import { useTranslation } from "react-i18next";
import { usePost, ForgotPasswordForm, PasswordRecoveryLayout } from "@mercado/shared-ui";

export const ForgotPasswordScreen = () => {
  const { t } = useTranslation();
  const { mutate, isPending, isSuccess } = usePost<{ email: string }, { message: string }>();

  return (
    <PasswordRecoveryLayout
      title={t("auth.forgotPasswordTitle")}
      subtitle={t("auth.forgotPasswordSubtitle")}
      backToLoginHref="/login"
      backToLoginLabel={t("auth.backToLogin")}
    >
      <ForgotPasswordForm
        labels={{
          email: t("auth.email"),
          emailPlaceholder: t("auth.emailPlaceholder"),
          emailRequired: t("auth.emailRequired"),
          emailInvalid: t("auth.emailInvalid"),
          sendResetLink: t("auth.sendResetLink"),
          loading: t("common.loading"),
          forgotPasswordSent: t("auth.forgotPasswordSent"),
        }}
        onSubmit={(email) => mutate({ url: "/auth/forgot-password", data: { email } })}
        isPending={isPending}
        isSuccess={isSuccess}
      />
    </PasswordRecoveryLayout>
  );
};
