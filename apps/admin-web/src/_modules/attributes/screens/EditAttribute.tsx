import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useFetch, usePatch } from "@/_shared/queryProvider";
import { Button, useToast } from "@mercado/shared-ui";
import { Input } from "@mercado/shared-ui/components/inputs/components/Input";
import { TextArea } from "@mercado/shared-ui/components/inputs/components/TextArea";
import { getAttribute, getAttributes, updateAttribute } from "../api";
import type { IAttributeDetailResponse } from "../types";

const EditAttributeForm = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  const { data: attribute, isLoading } = useFetch<IAttributeDetailResponse>({
    queryKey: getAttribute.queryKey(id),
    url: getAttribute.url(id),
  });

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!attribute) return;
    setName(attribute.name);
    setDescription(attribute.description ?? "");
  }, [attribute]);

  const { mutate: patchAttribute, isPending } = usePatch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError(t("attributes.nameRequired"));
      return;
    }

    patchAttribute(
      {
        url: updateAttribute.url(id),
        data: {
          name: name.trim(),
          description: description.trim() || null,
        },
      },
      {
        onSuccess: () => {
          toastSuccess(t("success.attribute_updated"));
          queryClient.invalidateQueries({ queryKey: getAttributes.queryKey });
          queryClient.invalidateQueries({ queryKey: getAttribute.queryKey(id) });
          navigate(`/attributes/${id}`);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-gray-400">{t("common.loading")}</p>
      </div>
    );
  }

  if (!attribute) {
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
          <Button onClick={() => navigate(`/attributes/${id}`)} style="link" className="!text-xs !p-0">
            {attribute.name}
          </Button>
          <span className="text-xs text-gray-300">/</span>
          <span className="text-xs text-gray-400">{t("attributes.editAttribute")}</span>
        </div>
        <h4 className="text-lg font-semibold text-gray-900">{t("attributes.editAttribute")}</h4>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>
        )}

        <Input
          name="name"
          label={t("attributes.name")}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <TextArea
          name="description"
          label={t("attributes.description")}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? t("common.submitting") : t("common.save")}
          </Button>
          <Button type="button" style="ghost" onClick={() => navigate(`/attributes/${id}`)} disabled={isPending}>
            {t("common.cancel")}
          </Button>
        </div>
      </form>
    </div>
  );
};

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

  return <EditAttributeForm id={id} />;
};
