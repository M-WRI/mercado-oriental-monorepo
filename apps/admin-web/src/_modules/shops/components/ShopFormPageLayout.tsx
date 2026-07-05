import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";

type ShopFormPageLayoutProps = {
  title: string;
  subtitle?: string;
  onBack: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function ShopFormPageLayout({
  title,
  subtitle,
  onBack,
  children,
  footer,
}: ShopFormPageLayoutProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <Button onClick={onBack} style="link" className="!text-xs !p-0 mb-2">
            {t("shops.backToPicker")}
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">{children}</div>

        {footer}
      </div>
    </div>
  );
}
