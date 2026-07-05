import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import { usePost } from "@/_shared/queryProvider";
import { Button, useToast } from "@mercado/shared-ui";
import { Input } from "@mercado/shared-ui/components/inputs/components/Input";
import { createAttributeValue, getAttribute } from "../../api";

export type AddAttributeValueModalProps = {
  onClose: () => void;
  attributeId: string;
};

export function AddAttributeValueModal({ onClose, attributeId }: AddAttributeValueModalProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate: postValue, isPending } = usePost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!value.trim()) {
      setError(t("attributes.valueRequired"));
      return;
    }

    postValue(
      {
        url: createAttributeValue.url(attributeId),
        data: { value: value.trim() },
      },
      {
        onSuccess: () => {
          toastSuccess(t("success.attribute_value_created"));
          queryClient.invalidateQueries({ queryKey: getAttribute.queryKey(attributeId) });
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("attributes.addValue")}</h3>
        <form onSubmit={handleSubmit} className="grid gap-4">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>
          )}
          <Input
            name="value"
            label={t("attributes.value")}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t("attributes.valuePlaceholder")}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" style="ghost" onClick={onClose} disabled={isPending}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? t("common.submitting") : t("common.add")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
