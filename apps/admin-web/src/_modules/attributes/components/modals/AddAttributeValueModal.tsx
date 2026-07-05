import { useTranslation } from "react-i18next";
import { ModalWrapper } from "@mercado/shared-ui/components/modalWrapper";
import { AttributeValueForm } from "../forms";
import { useAddAttributeValueForm } from "../../hooks";

export type AddAttributeValueModalProps = {
  onClose: () => void;
  attributeId: string;
};

export function AddAttributeValueModal({ onClose, attributeId }: AddAttributeValueModalProps) {
  const { t } = useTranslation();
  const { form, error, isPending } = useAddAttributeValueForm(attributeId, onClose);

  return (
    <ModalWrapper onClose={onClose} title={t("attributes.addValue")}>
      <AttributeValueForm
        form={form}
        error={error}
        isPending={isPending}
        onCancel={onClose}
      />
    </ModalWrapper>
  );
}
