import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { Button } from "@mercado/shared-ui";
import {
  ShopDeleteDialog,
  ShopForm,
  ShopFormPageLayout,
} from "../components";
import { useEditShopForm } from "../hooks";

export const EditShopScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { shopId } = useParams<{ shopId: string }>();
  const edit = useEditShopForm(shopId);

  if (!shopId) {
    navigate("/shops", { replace: true });
    return null;
  }

  if (edit.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  if (!edit.shop) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">{t("shops.notFound")}</p>
      </div>
    );
  }

  return (
    <>
      <ShopFormPageLayout
        title={t("shops.editShop")}
        onBack={edit.goBack}
        footer={
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Button style="danger" onClick={edit.openDeleteDialog} disabled={edit.isDeleting}>
              {t("shops.deleteShop")}
            </Button>
          </div>
        }
      >
        <ShopForm
          form={edit.form}
          error={edit.error}
          isPending={edit.isSaving}
          submitLabel={t("common.save")}
          onCancel={edit.goBack}
        />
      </ShopFormPageLayout>

      <ShopDeleteDialog
        shop={edit.shopToDelete}
        isDeleting={edit.isDeleting}
        onConfirm={edit.confirmDelete}
        onCancel={() => edit.setShopToDelete(null)}
      />
    </>
  );
};
