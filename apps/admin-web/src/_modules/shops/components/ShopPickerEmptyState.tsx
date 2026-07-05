import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";
import { MdAdd } from "react-icons/md";

type ShopPickerEmptyStateProps = {
  onCreateShop: () => void;
};

export function ShopPickerEmptyState({ onCreateShop }: ShopPickerEmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
      <p className="text-gray-900 font-medium mb-1">{t("shops.emptyTitle")}</p>
      <p className="text-sm text-gray-500 mb-6">{t("shops.emptySubtitle")}</p>
      <Button onClick={onCreateShop} icon={<MdAdd size={16} />}>
        {t("shops.createFirstShop")}
      </Button>
    </div>
  );
}
