import { useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useFormHook } from "@mercado/shared-ui";
import { Button, useAuth, usePost, useToast } from "@mercado/shared-ui";
import { loginEndpoint } from "../api";
import type { ILoginRequest, IAuthResponse } from "../types";

export const LoginScreen = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { success: toastSuccess } = useToast();
  const { mutate, isPending, error } = usePost<ILoginRequest, IAuthResponse>();

  const { form } = useFormHook({
    defaultValues: { email: "", password: "" } as ILoginRequest,
    onSubmit: ({ value }: { value: ILoginRequest }) => {
      mutate(
        { url: loginEndpoint.url, data: value },
        {
          onSuccess: (response) => {
            login(response.token, response.user);
            toastSuccess(t("success.login"));
            navigate("/");
          },
        }
      );
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-semibold">M</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">{t("auth.welcomeBack")}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("auth.signInTo")}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
              {t("auth.loginFailed")}
            </div>
          )}

          <div className="grid gap-4">
            <form.AppField
              name="email"
              validators={{
                onSubmit: ({ value }) => !value?.trim() ? t("auth.emailRequired") : !value.includes("@") ? t("auth.emailInvalid") : undefined,
              }}
            >
              {(field: any) => (
                <field.TextField
                  label={t("auth.email")}
                  type="email"
                  placeholder={t("auth.emailPlaceholder")}
                />
              )}
            </form.AppField>

            <form.AppField
              name="password"
              validators={{
                onSubmit: ({ value }) => !value ? t("auth.passwordRequired") : undefined,
              }}
            >
              {(field: any) => (
                <field.TextField
                  label={t("auth.password")}
                  type="password"
                  placeholder={t("auth.passwordPlaceholder")}
                />
              )}
            </form.AppField>

            <Button
              onClick={() => form.handleSubmit()}
              disabled={isPending}
              fullWidth
              className="mt-1"
            >
              {isPending ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center mt-4">
          {t("auth.noAccount")}{" "}
          <Link
            to="/register"
            className="text-gray-900 font-medium hover:underline"
          >
            {t("auth.createOne")}
          </Link>
        </p>
      </div>
    </div>
  );
};
