import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { ModalWrapper } from "@mercado/shared-ui/components/modalWrapper";
import { useToast } from "@mercado/shared-ui";
import { AddAttributeForm } from "../../forms";
import { usePost, useFetch } from "@/_shared/queryProvider";
import { createAttribute, getAttributes, serializer } from "@/_modules/attributes/api";
import { getAttributesByShop } from "@/_modules/products/api";
import { useFormHook } from "@mercado/shared-ui";
import { getShops } from "@/_modules/shops/api";
import type { IShop } from "@/_modules/products/types";

export type AddAttributeModalProps = {
  onClose: () => void;
  /** When set (e.g. from product edit), shop is fixed and hidden in the form. */
  fixedShopId?: string;
  fixedShopName?: string;
};

export const AddAttributeModal = ({
  onClose,
  fixedShopId,
  fixedShopName,
}: AddAttributeModalProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  const { data: shops } = useFetch<IShop[]>({
    queryKey: getShops.queryKey,
    url: getShops.url,
    enabled: !fixedShopId,
  });

  const { mutate: createAttributeMutation } = usePost<any, any>({
    serializer: {
      request: serializer.createAttributeRequestSerializer,
    },
  });

  const { form } = useFormHook({
    defaultValues: {
      shopId: fixedShopId ?? "",
      name: "",
      description: "",
      values: [] as string[],
    },
    onSubmit: (data) => {
      handleCreateAttribute(data.value);
    },
  });

  const handleCreateAttribute = (values: any) => {
    createAttributeMutation(
      {
        url: createAttribute.url,
        data: values,
      },
      {
        onSuccess: (_res, variables) => {
          toastSuccess(t("success.attribute_created"));
          queryClient.invalidateQueries({ queryKey: getAttributes.queryKey });
          const sid = variables?.data?.shopId as string | undefined;
          if (sid) {
            queryClient.invalidateQueries({ queryKey: getAttributesByShop.queryKey(sid) });
          }
          onClose();
        },
      }
    );
  };

  return (
    <ModalWrapper onClose={onClose} title={t("attributes.addAttribute")}>
      <AddAttributeForm
        form={form}
        shops={shops}
        fixedShopId={fixedShopId}
        fixedShopName={fixedShopName}
      />
    </ModalWrapper>
  );
};
