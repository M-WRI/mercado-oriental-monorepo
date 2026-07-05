import { useTranslation } from "react-i18next";
import { type ColumnDef } from "@tanstack/react-table";
import { useNavigate } from "react-router";
import { Button, Tag, ConfirmDialog } from "@mercado/shared-ui";
import { MdAdd, MdDeleteOutline } from "react-icons/md";
import { useModal } from "@mercado/shared-ui";
import type { IAttributeListResponse } from "../types";
import { AddAttributeModal } from "../components";
import { DefaultListLayout } from "@/_shared/layout";
import { useShop } from "@/_modules/shops/context/ShopProvider";
import { useAttributesList } from "../hooks";

export const AttributesList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { shopId, paths } = useShop();
  const list = useAttributesList();
  const { openModal, ModalRenderer, closeModal } = useModal({ isLoading: list.isLoading });

  const columns: ColumnDef<IAttributeListResponse>[] = [
    { accessorKey: "name", header: t("attributes.name") },
    { accessorKey: "description", header: t("attributes.description") },
    {
      id: "values",
      header: t("attributes.values"),
      cell: ({ row }) => {
        const values = row.original.productAttributeValues;
        if (!values?.length) {
          return <span className="text-xs text-gray-400">{t("attributes.noValues")}</span>;
        }
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
            onClick={() => navigate(paths.attribute(row.original.id))}
            style="primaryOutline"
            className="!text-xs !px-2 !py-1"
          >
            {t("common.show")}
          </Button>
          <Button
            onClick={() => navigate(paths.attributeEdit(row.original.id))}
            style="primary"
            className="!text-xs !px-2 !py-1"
          >
            {t("common.edit")}
          </Button>
          <button
            type="button"
            onClick={() => list.setConfirmState({ type: "single", attribute: row.original })}
            className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <MdDeleteOutline size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      {ModalRenderer}
      <DefaultListLayout<IAttributeListResponse>
        title={t("attributes.title")}
        actions={
          <Button
            onClick={() => openModal(AddAttributeModal, { onClose: closeModal, fixedShopId: shopId })}
            icon={<MdAdd />}
          >
            {t("attributes.addAttribute")}
          </Button>
        }
        tableData={list.attributes}
        tableColumns={columns}
        isMultiSelect
        onSelectionChange={list.handleSelectionChange}
        selectedCount={list.selected.length}
        bulkActions={
          <Button
            onClick={() => list.setConfirmState({ type: "bulk" })}
            style="danger"
            icon={<MdDeleteOutline size={16} />}
          >
            {t("attributes.bulkDelete", { count: list.selected.length })}
          </Button>
        }
      />

      {list.confirmState && (
        <ConfirmDialog
          title={list.confirmTitle}
          message={list.confirmMessage}
          confirmLabel={t("common.delete")}
          onConfirm={list.executeDelete}
          onCancel={() => list.setConfirmState(null)}
          isLoading={list.isDeleting}
        />
      )}
    </>
  );
};
