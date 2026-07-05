import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, useDelete } from "@/_shared/queryProvider";
import { useAuth, useToast } from "@mercado/shared-ui";
import { deleteShop, getShops } from "../api";
import type { IShop } from "../types";

export function useShopPicker() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { logout } = useAuth();
  const { success: toastSuccess } = useToast();

  const { data: shops, isLoading } = useFetch<IShop[]>({
    queryKey: getShops.queryKey,
    url: getShops.url,
  });

  const { mutate: removeShop, isPending: isDeleting } = useDelete();
  const [shopToDelete, setShopToDelete] = useState<IShop | null>(null);

  useEffect(() => {
    if (shops?.length === 1) {
      navigate(`/s/${shops[0].id}`, { replace: true });
    }
  }, [shops, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const confirmDelete = () => {
    if (!shopToDelete) return;
    removeShop(
      { url: deleteShop.url(shopToDelete.id) },
      {
        onSuccess: () => {
          toastSuccess(t("shops.deleteSuccess"));
          queryClient.invalidateQueries({ queryKey: getShops.queryKey });
          setShopToDelete(null);
        },
        onError: () => setShopToDelete(null),
      }
    );
  };

  return {
    shops: shops ?? [],
    isLoading,
    isDeleting,
    shopToDelete,
    setShopToDelete,
    confirmDelete,
    handleLogout,
    goToShop: (shopId: string) => navigate(`/s/${shopId}`),
    goToCreate: () => navigate("/shops/new"),
    goToEdit: (shopId: string) => navigate(`/shops/${shopId}/edit`),
  };
}
