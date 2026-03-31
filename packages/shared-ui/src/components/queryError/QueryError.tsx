import { useTranslation } from "react-i18next";

interface QueryErrorProps {
  onRetry?: () => void;
}

export const QueryError = ({ onRetry }: QueryErrorProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 p-8 text-center">
      <p className="text-sm text-gray-500">{t("common.error")}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
        >
          {t("common.retry")}
        </button>
      )}
    </div>
  );
};
