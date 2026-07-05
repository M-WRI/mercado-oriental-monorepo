import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";

interface EditProductHeaderProps {
  productName: string;
  onBack: () => void;
}

export function EditProductHeader({ productName, onBack }: EditProductHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="shrink-0 mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Button onClick={onBack} style="link" className="!text-xs !p-0">
          {productName}
        </Button>
        <span className="text-xs text-gray-300">/</span>
        <span className="text-xs text-gray-400">{t("products.editProduct")}</span>
      </div>
      <h4 className="text-lg font-semibold text-gray-900">{t("products.editProduct")}</h4>
    </div>
  );
}
