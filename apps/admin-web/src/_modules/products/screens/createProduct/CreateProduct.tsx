import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { FlowWizard } from "@mercado/shared-ui/components/flowWizard";
import type { WizardStep } from "@mercado/shared-ui/components/flowWizard";
import { usePost } from "@/_shared/queryProvider";
import { useToast } from "@mercado/shared-ui";
import { createProduct, createAttribute } from "../../api";
import { ProductInfoStep } from "./steps/ProductInfoStep";
import { ProductAttributesStep } from "./steps/ProductAttributesStep";
import { ProductVariantsStep } from "./steps/ProductVariantsStep";
import { ProductReviewStep } from "./steps/ProductReviewStep";
import type { INewAttribute, IWizardVariant, IProductAttribute } from "../../types";

export const CreateProduct = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { success: toastSuccess } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps: WizardStep[] = [
    {
      key: "productInfo",
      title: t("products.wizard.info"),
      component: ProductInfoStep,
    },
    {
      key: "attributes",
      title: t("products.wizard.attributes"),
      component: ProductAttributesStep,
    },
    {
      key: "variants",
      title: t("products.wizard.variants"),
      component: ProductVariantsStep,
    },
    {
      key: "review",
      title: t("products.wizard.review"),
      component: ProductReviewStep,
    },
  ];

  const { mutateAsync: postMutation } = usePost<any, any>();

  const handleFinish = async (allData: Record<string, any>) => {
    setIsSubmitting(true);

    try {
      const { productInfo, attributes, variants } = allData;

      // 1. Create new attributes and collect a mapping of tempId → real attribute (with value IDs)
      const newAttrIdMap = new Map<string, IProductAttribute>();

      if (attributes.newAttributes?.length > 0) {
        for (const newAttr of attributes.newAttributes as INewAttribute[]) {
          const created = await postMutation({
            url: createAttribute.url,
            data: {
              name: newAttr.name,
              description: newAttr.description,
              shopId: productInfo.shopId,
              productAttributeValues: newAttr.values.map((v: string) => ({ value: v })),
            },
          });
          newAttrIdMap.set(newAttr.tempId, created as IProductAttribute);
        }
      }

      // 2. Build variant payloads — resolve attribute value IDs
      const variantPayloads = (variants.variants as IWizardVariant[]).map((v) => {
        const attributeValueLinks = v.attributeSelections
          .map((sel) => {
            if (!sel.attributeId.startsWith("new-")) {
              return { productAttributeValueId: sel.valueId };
            }
            const realAttr = newAttrIdMap.get(sel.attributeId);
            if (!realAttr) return null;
            const realValue = realAttr.productAttributeValues.find(
              (rv) => rv.value === sel.valueName
            );
            if (!realValue) return null;
            return { productAttributeValueId: realValue.id };
          })
          .filter(Boolean);

        return {
          name: v.name,
          price: v.price,
          stock: v.stock,
          productVariantAttributeValues: {
            create: attributeValueLinks,
          },
        };
      });

      // 3. Create the product with variants in a single call
      await postMutation({
        url: createProduct.url,
        data: {
          name: productInfo.name,
          description: productInfo.description,
          shopId: productInfo.shopId,
          productVariants: {
            create: variantPayloads,
          },
        },
      });

      // 4. Invalidate caches and navigate back
      queryClient.invalidateQueries({ queryKey: [["products"]] });
      queryClient.invalidateQueries({ queryKey: [["attributes"]] });
      toastSuccess(t("success.product_created"));
      navigate("/products");
    } catch {
      // Error toast is handled automatically by the axios interceptor
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FlowWizard
      steps={steps}
      onFinish={handleFinish}
      onCancel={() => navigate("/products")}
      isSubmitting={isSubmitting}
      finishText={t("products.wizard.createProduct")}
    />
  );
};
