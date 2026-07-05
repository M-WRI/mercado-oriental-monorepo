import { useState } from "react";
import { useTranslation } from "react-i18next";
import { usePatch } from "@/_shared/queryProvider";
import { useToast } from "@mercado/shared-ui";
import { updateOrder } from "../api";

export function useOrderNoteEditor(
  orderId: string | undefined,
  savedNote: string | null | undefined,
  onInvalidate: () => void
) {
  const { t } = useTranslation();
  const { success: toastSuccess } = useToast();
  const { mutate: patchOrder, isPending: isUpdating } = usePatch();

  const [editingNote, setEditingNote] = useState(false);
  const [internalNote, setInternalNote] = useState("");

  const startEditing = () => {
    setInternalNote(savedNote ?? "");
    setEditingNote(true);
  };

  const cancelEditing = () => setEditingNote(false);

  const saveNote = () => {
    if (!orderId) return;
    patchOrder(
      { url: updateOrder.url(orderId), data: { internalNote } },
      {
        onSuccess: () => {
          toastSuccess(t("orders.noteUpdated"));
          onInvalidate();
          setEditingNote(false);
        },
      }
    );
  };

  return {
    editingNote,
    internalNote,
    setInternalNote,
    startEditing,
    cancelEditing,
    saveNote,
    isUpdating,
  };
}
