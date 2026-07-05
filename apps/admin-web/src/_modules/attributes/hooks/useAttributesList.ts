import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, useDelete } from "@/_shared/queryProvider";
import { useToast } from "@mercado/shared-ui";
import { bulkDeleteAttributes, deleteAttribute, getAttributes } from "../api";
import { useShop } from "@/_modules/shops/context/ShopProvider";
import type { IAttributeListResponse } from "../types";

export type AttributeDeleteState =
  | { type: "single"; attribute: IAttributeListResponse }
  | { type: "bulk" }
  | null;

export function useAttributesList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const { shopId } = useShop();

  const { data: attributes, isLoading } = useFetch<IAttributeListResponse[]>({
    queryKey: getAttributes.queryKey(shopId),
    url: getAttributes.url(shopId),
  });

  const { mutate: deleteOne, isPending: isDeletingOne } = useDelete();
  const { mutate: deleteBulk, isPending: isDeletingBulk } = useDelete();
  const isDeleting = isDeletingOne || isDeletingBulk;

  const [selected, setSelected] = useState<IAttributeListResponse[]>([]);
  const [confirmState, setConfirmState] = useState<AttributeDeleteState>(null);

  const handleSelectionChange = useCallback(
    (rows: IAttributeListResponse[]) => setSelected(rows),
    []
  );

  const onDeleteError = () => setConfirmState(null);

  const executeDelete = () => {
    if (!confirmState) return;

    if (confirmState.type === "single") {
      deleteOne(
        { url: deleteAttribute.url(confirmState.attribute.id) },
        {
          onSuccess: () => {
            toastSuccess(t("success.attribute_deleted"));
            queryClient.invalidateQueries({ queryKey: getAttributes.queryKey(shopId) });
            setConfirmState(null);
          },
          onError: onDeleteError,
        }
      );
    } else {
      deleteBulk(
        { url: bulkDeleteAttributes.url, data: { ids: selected.map((a) => a.id) } },
        {
          onSuccess: () => {
            toastSuccess(t("attributes.bulkDeleteSuccess", { count: selected.length }));
            queryClient.invalidateQueries({ queryKey: getAttributes.queryKey(shopId) });
            setSelected([]);
            setConfirmState(null);
          },
          onError: onDeleteError,
        }
      );
    }
  };

  const confirmTitle =
    confirmState?.type === "single"
      ? t("attributes.deleteConfirmTitle")
      : confirmState?.type === "bulk"
        ? t("attributes.bulkDeleteConfirmTitle", { count: selected.length })
        : "";

  const confirmMessage =
    confirmState?.type === "single"
      ? t("attributes.deleteConfirmMessage", { name: confirmState.attribute.name })
      : confirmState?.type === "bulk"
        ? t("attributes.bulkDeleteConfirmMessage", { count: selected.length })
        : "";

  return {
    attributes: attributes ?? [],
    isLoading,
    selected,
    confirmState,
    setConfirmState,
    handleSelectionChange,
    executeDelete,
    isDeleting,
    confirmTitle,
    confirmMessage,
  };
}
