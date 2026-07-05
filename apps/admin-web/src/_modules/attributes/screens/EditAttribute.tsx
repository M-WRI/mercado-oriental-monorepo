import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { Button } from "@mercado/shared-ui";
import { AttributeDetailsForm } from "../components/forms";
import { useEditAttributeForm } from "../hooks";

export const EditAttribute = () => {
  const { t } = useTranslation();
  const { id } = useParams();

  if (!id) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("attributes.notFound")}</p>
      </div>
    );
  }

  return <EditAttributeContent attributeId={id} />;
};

function EditAttributeContent({ attributeId }: { attributeId: string }) {
  const { t } = useTranslation();
  const edit = useEditAttributeForm(attributeId);

  if (edit.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  if (!edit.attribute) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("attributes.notFound")}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 overflow-y-auto pb-8 max-w-lg">
      <div className="shrink-0 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Button onClick={edit.goBack} style="link" className="!text-xs !p-0">
            {edit.attribute.name}
          </Button>
          <span className="text-xs text-gray-300">/</span>
          <span className="text-xs text-gray-400">{t("attributes.editAttribute")}</span>
        </div>
        <h4 className="text-lg font-semibold text-gray-900">{t("attributes.editAttribute")}</h4>
      </div>

      <AttributeDetailsForm
        form={edit.form}
        error={edit.error}
        isPending={edit.isPending}
        onCancel={edit.goBack}
      />
    </div>
  );
}
