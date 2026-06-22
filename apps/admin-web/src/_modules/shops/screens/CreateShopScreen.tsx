import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { usePost } from "@/_shared/queryProvider";
import { Button, useToast } from "@mercado/shared-ui";
import { Input } from "@mercado/shared-ui/components/inputs/components/Input";
import { TextArea } from "@mercado/shared-ui/components/inputs/components/TextArea";
import { createShop, getShops } from "../api";
import type { IShop } from "../types";

export const CreateShopScreen = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { success: toastSuccess } = useToast();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { mutate: postShop, isPending } = usePost<{ name: string; description?: string }, IShop>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError(t("shops.nameRequired"));
      return;
    }

    postShop(
      {
        url: createShop.url,
        data: { name: name.trim(), description: description.trim() || undefined },
      },
      {
        onSuccess: (shop) => {
          toastSuccess(t("shops.createSuccess"));
          queryClient.invalidateQueries({ queryKey: getShops.queryKey });
          navigate(`/s/${shop.id}`);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <Button onClick={() => navigate("/shops")} style="link" className="!text-xs !p-0 mb-2">
            {t("shops.backToPicker")}
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">{t("shops.createShop")}</h1>
          <p className="text-sm text-gray-500 mt-1">{t("shops.createSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 grid gap-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm rounded-lg px-3 py-2">{error}</div>
          )}

          <Input
            name="name"
            label={t("shops.nameLabel")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("shops.namePlaceholder")}
          />

          <TextArea
            name="description"
            label={t("shops.descriptionLabel")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={t("shops.descriptionPlaceholder")}
          />

          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? t("common.submitting") : t("shops.createShop")}
            </Button>
            <Button type="button" style="ghost" onClick={() => navigate("/shops")} disabled={isPending}>
              {t("common.cancel")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
