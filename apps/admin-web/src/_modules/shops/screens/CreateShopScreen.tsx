import { useTranslation } from "react-i18next";
import {
  ShopForm,
  ShopFormPageLayout,
} from "../components";
import { useCreateShopForm } from "../hooks";

export const CreateShopScreen = () => {
  const { t } = useTranslation();
  const { form, error, isPending, goBack } = useCreateShopForm();

  return (
    <ShopFormPageLayout
      title={t("shops.createShop")}
      subtitle={t("shops.createSubtitle")}
      onBack={goBack}
    >
      <ShopForm
        form={form}
        error={error}
        isPending={isPending}
        submitLabel={t("shops.createShop")}
        onCancel={goBack}
      />
    </ShopFormPageLayout>
  );
};
