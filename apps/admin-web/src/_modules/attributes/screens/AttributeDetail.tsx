import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { deleteAttributeValueRequest, getAttribute } from "../api";
import { useDelete, useFetch } from "@/_shared/queryProvider";
import { Button, useToast } from "@mercado/shared-ui";
import type { ColumnDef } from "@tanstack/react-table";
import { MdAdd, MdOutlineDeleteForever } from "react-icons/md";
import { DefaultListLayout } from "@/_shared/layout";
import type { IAttributeDetailResponse, IAttributeValueDetail } from "../types";

export const AttributeDetail = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  const { data: attribute } = useFetch<IAttributeDetailResponse>({
    queryKey: getAttribute.queryKey(id),
    url: getAttribute.url(id),
  });

  const { mutate: deleteAttributeValue } = useDelete<any, any>();

  const handleDeleteAttributeValue = (valueId: string) => {
    deleteAttributeValue(
      { url: deleteAttributeValueRequest.url(id, valueId) },
      {
        onSuccess: () => {
          toastSuccess(t("success.attribute_value_deleted"));
          queryClient.invalidateQueries({ queryKey: getAttribute.queryKey(id) });
        },
      }
    );
  };

  const columns: ColumnDef<IAttributeValueDetail>[] = [
    {
      accessorKey: "value",
      header: t("attributes.value"),
      cell: ({ row }) => (
        <span className="text-sm font-medium text-gray-900">{row.original.value}</span>
      ),
    },
    {
      id: "usageCount",
      header: t("attributes.usedBy"),
      cell: ({ row }) => {
        const { usageCount, products } = row.original;
        if (usageCount === 0) {
          return <span className="text-xs text-gray-400">{t("attributes.notUsed")}</span>;
        }
        return (
          <div>
            <span className="text-sm text-gray-700">
              {usageCount} {usageCount !== 1 ? t("common.variant_plural") : t("common.variant")}
            </span>
            <p className="text-xs text-gray-400 truncate max-w-[200px]">
              {products.map((p) => p.name).join(", ")}
            </p>
          </div>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          onClick={() => handleDeleteAttributeValue(row.original.id)}
          style="danger"
          icon={<MdOutlineDeleteForever size={18} />}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 pb-4 mb-6 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h4 className="text-lg font-semibold text-gray-900">{attribute?.name}</h4>
            {attribute?.description && (
              <p className="text-sm text-gray-500 mt-1">{attribute.description}</p>
            )}
          </div>
          {id && (
            <Button
              onClick={() => navigate(`/attributes/${id}/edit`)}
              style="primaryOutline"
              className="shrink-0"
            >
              {t("common.edit")}
            </Button>
          )}
        </div>
        {attribute && (
          <div className="flex gap-4 mt-3">
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-400">{t("attributes.values")}</span>
              <p className="text-sm font-semibold text-gray-900">{attribute.totalValues}</p>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-400">{t("attributes.usedInProducts")}</span>
              <p className="text-sm font-semibold text-gray-900">{attribute.totalProducts}</p>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0">
        <DefaultListLayout<IAttributeValueDetail>
          title={t("attributes.values")}
          actions={
            <Button onClick={() => console.log("<------ here we go")} icon={<MdAdd size={16} />}>
              {t("attributes.addValue")}
            </Button>
          }
          tableData={attribute?.productAttributeValues || []}
          tableColumns={columns}
        />
      </div>
    </div>
  );
};
