import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";
import { MdLogout } from "react-icons/md";

type ShopPickerHeaderProps = {
  onLogout: () => void;
};

export function ShopPickerHeader({ onLogout }: ShopPickerHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
          <span className="text-white text-sm font-semibold">M</span>
        </div>
        <span className="text-sm font-medium text-gray-900">{t("shops.title")}</span>
      </div>
      <Button onClick={onLogout} style="link" icon={<MdLogout size={16} />}>
        {t("common.logout")}
      </Button>
    </div>
  );
}
