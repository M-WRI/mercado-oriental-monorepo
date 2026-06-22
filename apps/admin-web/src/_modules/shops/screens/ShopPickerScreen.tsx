import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, useDelete } from "@/_shared/queryProvider";
import { Button, ConfirmDialog, useAuth, useToast } from "@mercado/shared-ui";
import { MdAdd, MdLogout } from "react-icons/md";
import { getShops } from "../api";
import { ShopCard } from "../components/ShopCard";
import type { IShop } from "../types";

export const ShopPickerScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout, user } = useAuth();
  const { success: toastSuccess } = useToast();

  const { data: shops, isLoading } = useFetch<IShop[]>({
    queryKey: getShops.queryKey,
    url: getShops.url,
  });

  const { mutate: deleteShop, isPending: isDeleting } = useDelete();
  const [confirmShop, setConfirmShop] = useState<IShop | null>(null);

  useEffect(() => {
    if (shops?.length === 1) {
      navigate(`/s/${shops[0].id}`, { replace: true });
    }
  }, [shops, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDelete = () => {
    if (!confirmShop) return;
    deleteShop(
      { url: `/shops/${confirmShop.id}` },
      {
        onSuccess: () => {
          toastSuccess(t("shops.deleteSuccess"));
          queryClient.invalidateQueries({ queryKey: getShops.queryKey });
          setConfirmShop(null);
        },
        onError: () => setConfirmShop(null),
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center">
            <span className="text-white text-sm font-semibold">M</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{t("shops.title")}</span>
        </div>
        <Button onClick={handleLogout} style="link" icon={<MdLogout size={16} />}>
          {t("common.logout")}
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {user?.name ? t("shops.greeting", { name: user.name }) : t("shops.selectShop")}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{t("shops.subtitle")}</p>
          </div>
          <Button onClick={() => navigate("/shops/new")} icon={<MdAdd size={16} />}>
            {t("shops.createShop")}
          </Button>
        </div>

        {isLoading && (
          <p className="text-sm text-gray-400 text-center py-16">{t("common.loading")}</p>
        )}

        {!isLoading && shops?.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
            <p className="text-gray-900 font-medium mb-1">{t("shops.emptyTitle")}</p>
            <p className="text-sm text-gray-500 mb-6">{t("shops.emptySubtitle")}</p>
            <Button onClick={() => navigate("/shops/new")} icon={<MdAdd size={16} />}>
              {t("shops.createFirstShop")}
            </Button>
          </div>
        )}

        {shops && shops.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shops.map((shop, index) => (
              <ShopCard
                key={shop.id}
                shop={shop}
                index={index}
                onSelect={() => navigate(`/s/${shop.id}`)}
                onEdit={() => navigate(`/shops/${shop.id}/edit`)}
                onDelete={() => setConfirmShop(shop)}
              />
            ))}
          </div>
        )}
      </div>

      {confirmShop && (
        <ConfirmDialog
          title={t("shops.deleteConfirmTitle")}
          message={t("shops.deleteConfirmMessage", { name: confirmShop.name })}
          confirmLabel={t("common.delete")}
          onConfirm={handleDelete}
          onCancel={() => setConfirmShop(null)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
};
