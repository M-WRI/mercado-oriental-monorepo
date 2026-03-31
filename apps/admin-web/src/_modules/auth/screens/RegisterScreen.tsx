import { useNavigate, Link } from "react-router";
import { useTranslation } from "react-i18next";
import { useFormHook } from "@mercado/shared-ui";
import { Button, useAuth, usePost, useToast } from "@mercado/shared-ui";
import { registerEndpoint } from "../api";
import type { IRegisterRequest, IAuthResponse } from "../types";

export const RegisterScreen = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { success: toastSuccess } = useToast();
  const {
    mutate,
    isPending,
    error,
  } = usePost<IRegisterRequest, IAuthResponse>();

  const { form } = useFormHook({
    defaultValues: { name: "", email: "", password: "" } as IRegisterRequest,
    onSubmit: ({ value }: { value: IRegisterRequest }) => {
      const payload = { ...value, name: value.name || undefined };
      mutate(
        { url: registerEndpoint.url, data: payload },
        {
          onSuccess: (response) => {
            login(response.token, response.user);
            toastSuccess(t("success.register"));
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
          <h1 className="text-xl font-semibold text-gray-900">
            {t("auth.createYourAccount")}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t("auth.getStarted")}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2 mb-4">
              {t("auth.registrationFailed")}
            </div>
          )}

          <div className="grid gap-4">
            <form.AppField name="name">
              {(field: any) => (
                <field.TextField label={t("auth.name")} placeholder={t("auth.namePlaceholder")} />
              )}
            </form.AppField>

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
                onSubmit: ({ value }) => !value ? t("auth.passwordRequired") : value.length < 6 ? t("auth.passwordMinLength") : undefined,
              }}
            >
              {(field: any) => (
                <field.TextField
                  label={t("auth.password")}
                  type="password"
                  placeholder={t("auth.choosePlaceholder")}
                />
              )}
            </form.AppField>

            <Button
              onClick={() => form.handleSubmit()}
              disabled={isPending}
              fullWidth
              className="mt-1"
            >
              {isPending ? t("auth.creatingAccount") : t("auth.createAccount")}
            </Button>
          </div>
        </div>

        <p className="text-sm text-gray-500 text-center mt-4">
          {t("auth.hasAccount")}{" "}
          <Link
            to="/login"
            className="text-gray-900 font-medium hover:underline"
          >
            {t("auth.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
};
