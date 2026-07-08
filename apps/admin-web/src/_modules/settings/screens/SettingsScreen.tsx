import { useTranslation } from "react-i18next";
import {
  AccountSettingsForm,
  SettingsSection,
  ShopSettingsForm,
  StripeConnectSection,
} from "../components";
import { useAccountSettingsForm, useShopSettingsForm } from "../hooks";

export const SettingsScreen = () => {
  const { t } = useTranslation();
  const account = useAccountSettingsForm();
  const shopSettings = useShopSettingsForm();

  return (
    <div className="max-w-2xl pb-8">
      <div className="mb-8">
        <h4 className="text-lg font-semibold text-gray-900">{t("settings.title")}</h4>
        <p className="text-sm text-gray-500 mt-1">{t("settings.subtitle")}</p>
      </div>

      <SettingsSection
        title={t("settings.accountTitle")}
        subtitle={t("settings.accountSubtitle")}
        className="mb-6"
      >
        <AccountSettingsForm
          form={account.form}
          email={account.email}
          error={account.error}
          isSaving={account.isSaving}
        />
      </SettingsSection>

      <StripeConnectSection />

      <SettingsSection
        title={t("settings.shopTitle")}
        subtitle={t("settings.shopSubtitle", { shop: shopSettings.shopName })}
      >
        <ShopSettingsForm
          form={shopSettings.form}
          error={shopSettings.error}
          isSaving={shopSettings.isSaving}
        />
      </SettingsSection>
    </div>
  );
};
