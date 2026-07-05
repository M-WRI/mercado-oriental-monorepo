import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";

interface EditProductActionsProps {
  isPending: boolean;
  onCancel: () => void;
}

export function EditProductActions({ isPending, onCancel }: EditProductActionsProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3 pt-2">
      <Button type="submit" disabled={isPending}>
        {isPending ? t("common.submitting") : t("common.save")}
      </Button>
      <Button type="button" style="ghost" onClick={onCancel} disabled={isPending}>
        {t("common.cancel")}
      </Button>
    </div>
  );
}
