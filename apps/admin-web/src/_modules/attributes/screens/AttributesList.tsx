import { useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { type ColumnDef } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, useDelete } from "@/_shared/queryProvider";
import { Button, Tag, ConfirmDialog, useToast } from "@mercado/shared-ui";
import { getAttributes } from "../api";
import { useNavigate } from "react-router";
import { MdAdd, MdDeleteOutline } from "react-icons/md";
import { useModal } from "@mercado/shared-ui";
import type { IAttributeListResponse } from "../types";
import { AddAttributeModal } from "../components";
import { DefaultListLayout } from "@/_shared/layout";

export const AttributesList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  const { data: attributes, isLoading } = useFetch<IAttributeListResponse[]>({
    queryKey: getAttributes.queryKey,
    url: getAttributes.url,
  });

  const { openModal, ModalRenderer, closeModal } = useModal({ isLoading });
  const { mutate: deleteOne, isPending: isDeletingOne } = useDelete();
  const { mutate: deleteBulk, isPending: isDeletingBulk } = useDelete();
  const isDeleting = isDeletingOne || isDeletingBulk;

  const [selected, setSelected] = useState<IAttributeListResponse[]>([]);
  const [confirmState, setConfirmState] = useState<
    | { type: "single"; attribute: IAttributeListResponse }
    | { type: "bulk" }
    | null
  >(null);

  const handleSelectionChange = useCallback(
    (rows: IAttributeListResponse[]) => setSelected(rows),
    []
  );

  const handleAddAttribute = () => {
    openModal(AddAttributeModal, { onClose: closeModal });
  };

  const handleDeleteSingle = (attribute: IAttributeListResponse) => {
    setConfirmState({ type: "single", attribute });
  };

  const handleDeleteBulk = () => {
    if (selected.length === 0) return;
    setConfirmState({ type: "bulk" });
  };

  /** Close dialog on failure. API errors are already toasted by the axios response interceptor. */
  const onDeleteError = () => {
    setConfirmState(null);
  };

  const executeDelete = () => {
    if (!confirmState) return;

    if (confirmState.type === "single") {
      deleteOne(
        { url: `/attributes/${confirmState.attribute.id}` },
        {
          onSuccess: () => {
            toastSuccess(t("success.attribute_deleted"));
            queryClient.invalidateQueries({ queryKey: getAttributes.queryKey });
            setConfirmState(null);
          },
          onError: onDeleteError,
        }
      );
    } else {
      deleteBulk(
        {
          url: "/attributes/bulk",
          data: { ids: selected.map((a) => a.id) },
        },
        {
          onSuccess: () => {
            toastSuccess(t("attributes.bulkDeleteSuccess", { count: selected.length }));
            queryClient.invalidateQueries({ queryKey: getAttributes.queryKey });
            setSelected([]);
            setConfirmState(null);
          },
          onError: onDeleteError,
        }
      );
    }
  };

  const columns: ColumnDef<IAttributeListResponse>[] = [
    {
      accessorKey: "name",
      header: t("attributes.name"),
    },
    {
      accessorKey: "description",
      header: t("attributes.description"),
    },
    {
      id: "values",
      header: t("attributes.values"),
      cell: ({ row }) => {
        const values = row.original.productAttributeValues;
        if (!values || values.length === 0)
          return <span className="text-xs text-gray-400">{t("attributes.noValues")}</span>;
        return (
          <div className="flex flex-wrap gap-1">
            {values.map((v) => (
              <Tag key={v.id}>{v.value}</Tag>
            ))}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            onClick={() => navigate(`/attributes/${row.original.id}`)}
            style="primaryOutline"
            className="!text-xs !px-2 !py-1"
          >
            {t("common.show")}
          </Button>
          <Button
            onClick={() => navigate(`/attributes/${row.original.id}/edit`)}
            style="primary"
            className="!text-xs !px-2 !py-1"
          >
            {t("common.edit")}
          </Button>
          <button
            type="button"
            onClick={() => handleDeleteSingle(row.original)}
            className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <MdDeleteOutline size={16} />
          </button>
        </div>
      ),
    },
  ];

  const confirmTitle =
    confirmState?.type === "single"
      ? t("attributes.deleteConfirmTitle")
      : t("attributes.bulkDeleteConfirmTitle", { count: selected.length });

  const confirmMessage =
    confirmState?.type === "single"
      ? t("attributes.deleteConfirmMessage", { name: confirmState.attribute.name })
      : t("attributes.bulkDeleteConfirmMessage", { count: selected.length });

  return (
    <>
      {ModalRenderer}
      <DefaultListLayout<IAttributeListResponse>
        title={t("attributes.title")}
        actions={
          <Button onClick={handleAddAttribute} icon={<MdAdd />}>
            {t("attributes.addAttribute")}
          </Button>
        }
        tableData={attributes || []}
        tableColumns={columns}
        isMultiSelect
        onSelectionChange={handleSelectionChange}
        selectedCount={selected.length}
        bulkActions={
          <Button
            onClick={handleDeleteBulk}
            style="danger"
            icon={<MdDeleteOutline size={16} />}
          >
            {t("attributes.bulkDelete", { count: selected.length })}
          </Button>
        }
      />

      {confirmState && (
        <ConfirmDialog
          title={confirmTitle}
          message={confirmMessage}
          confirmLabel={t("common.delete")}
          onConfirm={executeDelete}
          onCancel={() => setConfirmState(null)}
          isLoading={isDeleting}
        />
      )}
    </>
  );
};
