import { useTranslation } from "react-i18next";
import {
  ShopDeleteDialog,
  ShopPickerEmptyState,
  ShopPickerGrid,
  ShopPickerHeader,
  ShopPickerToolbar,
} from "../components";
import { useShopPicker } from "../hooks";

export const ShopPickerScreen = () => {
  const { t } = useTranslation();
  const picker = useShopPicker();

  return (
    <div className="min-h-screen bg-gray-50">
      <ShopPickerHeader onLogout={picker.handleLogout} />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <ShopPickerToolbar onCreateShop={picker.goToCreate} />

        {picker.isLoading && (
          <p className="text-sm text-gray-400 text-center py-16">{t("common.loading")}</p>
        )}

        {!picker.isLoading && picker.shops.length === 0 && (
          <ShopPickerEmptyState onCreateShop={picker.goToCreate} />
        )}

        {!picker.isLoading && picker.shops.length > 0 && (
          <ShopPickerGrid
            shops={picker.shops}
            onSelect={picker.goToShop}
            onEdit={picker.goToEdit}
            onDelete={picker.setShopToDelete}
          />
        )}
      </div>

      <ShopDeleteDialog
        shop={picker.shopToDelete}
        isDeleting={picker.isDeleting}
        onConfirm={picker.confirmDelete}
        onCancel={() => picker.setShopToDelete(null)}
      />
    </div>
  );
};
