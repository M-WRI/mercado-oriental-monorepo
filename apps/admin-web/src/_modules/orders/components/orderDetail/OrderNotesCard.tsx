import { useTranslation } from "react-i18next";
import { Button, Card } from "@mercado/shared-ui";

type OrderNotesCardProps = {
  customerNote: string | null;
  internalNote: string | null;
  editingNote: boolean;
  draftNote: string;
  isUpdating: boolean;
  onStartEditing: () => void;
  onCancelEditing: () => void;
  onDraftChange: (value: string) => void;
  onSave: () => void;
};

export function OrderNotesCard({
  customerNote,
  internalNote,
  editingNote,
  draftNote,
  isUpdating,
  onStartEditing,
  onCancelEditing,
  onDraftChange,
  onSave,
}: OrderNotesCardProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <div className="flex items-center justify-between mb-3">
        <h5 className="text-sm font-medium text-gray-700">{t("orders.notes")}</h5>
        {!editingNote && (
          <Button onClick={onStartEditing} style="link" className="!text-xs">
            {t("common.edit")}
          </Button>
        )}
      </div>

      {customerNote && (
        <div className="mb-3">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            {t("orders.customerNote")}
          </p>
          <p className="text-sm text-gray-600 bg-amber-50 rounded px-2 py-1.5">{customerNote}</p>
        </div>
      )}

      {editingNote ? (
        <div className="space-y-2">
          <textarea
            value={draftNote}
            onChange={(e) => onDraftChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300"
            rows={3}
            placeholder={t("orders.notePlaceholder")}
          />
          <div className="flex gap-2 justify-end">
            <Button onClick={onCancelEditing} style="primaryOutline">
              {t("common.cancel")}
            </Button>
            <Button onClick={onSave} disabled={isUpdating}>
              {t("common.save")}
            </Button>
          </div>
        </div>
      ) : internalNote ? (
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
            {t("orders.internalNote")}
          </p>
          <p className="text-sm text-gray-600">{internalNote}</p>
        </div>
      ) : (
        <p className="text-sm text-gray-400">{t("orders.noNotes")}</p>
      )}
    </Card>
  );
}
