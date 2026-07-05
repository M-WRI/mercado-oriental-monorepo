import { useTranslation } from "react-i18next";
import { Button, useAuth } from "@mercado/shared-ui";
import { MdAdd } from "react-icons/md";

type ShopPickerToolbarProps = {
  onCreateShop: () => void;
};

export function ShopPickerToolbar({ onCreateShop }: ShopPickerToolbarProps) {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">
          {user?.name ? t("shops.greeting", { name: user.name }) : t("shops.selectShop")}
        </h1>
        <p className="text-sm text-gray-500 mt-1">{t("shops.subtitle")}</p>
      </div>
      <Button onClick={onCreateShop} icon={<MdAdd size={16} />}>
        {t("shops.createShop")}
      </Button>
    </div>
  );
}
