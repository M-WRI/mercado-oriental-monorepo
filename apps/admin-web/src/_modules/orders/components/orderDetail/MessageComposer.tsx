import { useTranslation } from "react-i18next";
import { Button } from "@mercado/shared-ui";

type MessageComposerProps = {
  value: string;
  isSending: boolean;
  placeholder: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export function MessageComposer({
  value,
  isSending,
  placeholder,
  onChange,
  onSend,
}: MessageComposerProps) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-300 resize-none"
        rows={2}
        placeholder={placeholder}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
          }
        }}
      />
      <Button onClick={onSend} disabled={isSending || !value.trim()}>
        {isSending ? t("common.loading") : t("touchpoints.send")}
      </Button>
    </div>
  );
}
