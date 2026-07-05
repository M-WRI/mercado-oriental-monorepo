import { useTranslation } from "react-i18next";
import { ConfirmDialog } from "@mercado/shared-ui";
import type { IShop } from "../types";

type ShopDeleteDialogProps = {
  shop: IShop | null;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ShopDeleteDialog({ shop, isDeleting, onConfirm, onCancel }: ShopDeleteDialogProps) {
  const { t } = useTranslation();

  if (!shop) return null;

  return (
    <ConfirmDialog
      title={t("shops.deleteConfirmTitle")}
      message={t("shops.deleteConfirmMessage", { name: shop.name })}
      confirmLabel={t("common.delete")}
      onConfirm={onConfirm}
      onCancel={onCancel}
      isLoading={isDeleting}
    />
  );
}
