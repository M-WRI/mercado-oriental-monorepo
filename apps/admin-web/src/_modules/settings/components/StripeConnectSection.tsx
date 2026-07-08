import { useTranslation } from "react-i18next";
import { Button, Tag } from "@mercado/shared-ui";
import { SettingsSection } from "./SettingsSection";
import { useStripeConnect } from "../hooks/useStripeConnect";

export function StripeConnectSection() {
  const { t } = useTranslation();
  const stripe = useStripeConnect();

  const badge = stripe.status?.onboardingComplete
    ? { label: t("settings.stripeStatusReady"), variant: "success" as const }
    : stripe.status?.connected
      ? { label: t("settings.stripeStatusPending"), variant: "warning" as const }
      : { label: t("settings.stripeStatusNotConnected"), variant: "default" as const };

  return (
    <SettingsSection
      title={t("settings.paymentsTitle")}
      subtitle={t("settings.paymentsSubtitle")}
      className="mb-6"
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Tag variant={badge.variant}>{badge.label}</Tag>
        </div>

        <p className="text-sm text-gray-600">{t("settings.paymentsDescription")}</p>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={stripe.startConnect}
            disabled={stripe.isConnecting || stripe.isLoading}
          >
            {stripe.status?.connected
              ? t("settings.stripeContinueSetup")
              : t("settings.stripeConnect")}
          </Button>
          <Button style="secondary" onClick={stripe.refresh} disabled={stripe.isLoading}>
            {t("settings.stripeRefresh")}
          </Button>
        </div>
      </div>
    </SettingsSection>
  );
}
