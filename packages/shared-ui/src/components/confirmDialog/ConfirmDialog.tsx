import { useTranslation } from "react-i18next";
import { Button } from "../button/Button";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: "danger" | "primary";
}

export const ConfirmDialog = ({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  isLoading = false,
  variant = "danger",
}: ConfirmDialogProps) => {
  const { t } = useTranslation();

  return (
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onCancel();
      }}
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 pt-6 pb-2">
          <h5 className="text-base font-semibold text-gray-900 mb-1">{title}</h5>
          <p className="text-sm text-gray-500">{message}</p>
        </div>
        <div className="flex justify-end gap-2 px-6 py-4">
          <Button onClick={onCancel} style="primaryOutline" disabled={isLoading}>
            {cancelLabel ?? t("common.cancel")}
          </Button>
          <Button
            onClick={onConfirm}
            style={variant === "danger" ? "danger" : "primary"}
            disabled={isLoading}
            className={variant === "danger" ? "!bg-red-600 !text-white hover:!bg-red-700" : ""}
          >
            {isLoading ? t("common.loading") : (confirmLabel ?? t("common.delete"))}
          </Button>
        </div>
      </div>
    </div>
  );
};
