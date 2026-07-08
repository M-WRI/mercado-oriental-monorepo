import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUpload } from "@/_shared/queryProvider";
import { Button } from "@mercado/shared-ui";
import {
  uploadProductImage,
  type UploadProductImageResponse,
} from "@/_modules/uploads/api";
import { isProductImageUrlValid } from "./ProductImageField";
import type { IProductImageDraft, IProductImageVariantOption } from "../types";

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 5 * 1024 * 1024;

interface ProductImagesFieldProps {
  images: IProductImageDraft[];
  onChange: (images: IProductImageDraft[]) => void;
  variantOptions?: IProductImageVariantOption[];
}

export function ProductImagesField({
  images,
  onChange,
  variantOptions = [],
}: ProductImagesFieldProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { mutate: upload, isPending } = useUpload<UploadProductImageResponse>();

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  const updateImages = (next: IProductImageDraft[]) => {
    onChange(
      next.map((img, index) => ({
        ...img,
        sortOrder: index,
        isPrimary: img.isPrimary,
      }))
    );
  };

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;
    setUploadError(null);

    const validFiles = Array.from(files).filter((file) => {
      if (!ACCEPTED_TYPES.split(",").includes(file.type)) {
        setUploadError(t("products.infoStep.imageUploadInvalidType"));
        return false;
      }
      if (file.size > MAX_BYTES) {
        setUploadError(t("products.infoStep.imageUploadTooLarge"));
        return false;
      }
      return true;
    });

    validFiles.forEach((file) => {
      const formData = new FormData();
      formData.append("image", file);

      upload(
        { url: uploadProductImage.url, formData },
        {
          onSuccess: (data) => {
            if (!isProductImageUrlValid(data.url)) return;
            onChange([
              ...images,
              {
                tempId: `img-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                url: data.url,
                sortOrder: images.length,
                isPrimary: images.length === 0,
              },
            ]);
          },
          onError: () => {
            setUploadError(t("products.infoStep.imageUploadFailed"));
          },
        }
      );
    });
  };

  const setPrimary = (tempId: string) => {
    updateImages(
      images.map((img) => ({
        ...img,
        isPrimary: img.tempId === tempId,
      }))
    );
  };

  const removeImage = (tempId: string) => {
    const remaining = images.filter((img) => img.tempId !== tempId);
    if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
      remaining[0] = { ...remaining[0], isPrimary: true };
    }
    updateImages(remaining);
  };

  const moveImage = (tempId: string, direction: -1 | 1) => {
    const list = [...sorted];
    const index = list.findIndex((img) => img.tempId === tempId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    updateImages(list);
  };

  const linkVariant = (tempId: string, variantKey: string) => {
    updateImages(
      images.map((img) => {
        if (img.tempId === tempId) {
          if (!variantKey) {
            return { ...img, productVariantId: null, variantTempId: null };
          }
          const variant = variantOptions.find(
            (v) => v.id === variantKey || v.tempId === variantKey
          );
          return {
            ...img,
            productVariantId: variant?.id ?? null,
            variantTempId: variant?.tempId ?? null,
          };
        }
        if (variantKey) {
          const variant = variantOptions.find(
            (v) => v.id === variantKey || v.tempId === variantKey
          );
          const matchesVariant =
            (variant?.id && img.productVariantId === variant.id) ||
            (variant?.tempId && img.variantTempId === variant.tempId);
          if (matchesVariant) {
            return { ...img, productVariantId: null, variantTempId: null };
          }
        }
        return img;
      })
    );
  };

  const getLinkedVariantKey = (img: IProductImageDraft): string => {
    if (img.productVariantId) return img.productVariantId;
    if (img.variantTempId) return img.variantTempId;
    return "";
  };

  return (
    <div className="grid gap-3">
      <label className="text-sm font-medium text-gray-700">
        {t("products.infoStep.imagesLabel")}
      </label>
      <p className="text-xs text-gray-500">{t("products.infoStep.imagesHint")}</p>

      {sorted.length > 0 && (
        <div className="grid gap-3">
          {sorted.map((img) => (
            <div
              key={img.tempId}
              className="flex gap-3 p-3 border border-gray-200 rounded-lg bg-white"
            >
              <div className="relative shrink-0">
                <img
                  src={img.url}
                  alt={img.alt ?? t("products.infoStep.imagePreviewAlt")}
                  className="w-24 h-24 rounded-lg object-cover border border-gray-100"
                />
                {img.isPrimary && (
                  <span className="absolute top-1 left-1 text-[10px] font-semibold bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                    {t("products.infoStep.imagePrimaryBadge")}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0 grid gap-2">
                <div className="flex flex-wrap gap-2">
                  {!img.isPrimary && (
                    <Button
                      type="button"
                      style="ghost"
                      onClick={() => setPrimary(img.tempId)}
                    >
                      {t("products.infoStep.imageSetPrimary")}
                    </Button>
                  )}
                  <Button
                    type="button"
                    style="ghost"
                    onClick={() => moveImage(img.tempId, -1)}
                  >
                    ↑
                  </Button>
                  <Button
                    type="button"
                    style="ghost"
                    onClick={() => moveImage(img.tempId, 1)}
                  >
                    ↓
                  </Button>
                  <Button
                    type="button"
                    style="ghost"
                    onClick={() => removeImage(img.tempId)}
                  >
                    {t("products.infoStep.imageRemove")}
                  </Button>
                </div>

                {variantOptions.length > 0 && (
                  <div className="grid gap-1">
                    <label className="text-xs font-medium text-gray-500">
                      {t("products.infoStep.imageLinkVariant")}
                    </label>
                    <select
                      value={getLinkedVariantKey(img)}
                      onChange={(e) => linkVariant(img.tempId, e.target.value)}
                      className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
                    >
                      <option value="">{t("products.infoStep.imageNoVariant")}</option>
                      {variantOptions.map((v) => (
                        <option key={v.id ?? v.tempId} value={v.id ?? v.tempId!}>
                          {v.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        disabled={isPending}
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center gap-2 w-full max-w-sm h-28 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 transition-colors disabled:opacity-50"
      >
        <span className="text-sm font-medium">
          {isPending
            ? t("products.infoStep.imageUploading")
            : t("products.infoStep.imagesUploadPrompt")}
        </span>
        <span className="text-xs text-gray-400">
          {t("products.infoStep.imageUploadHint")}
        </span>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        multiple
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />

      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
    </div>
  );
}
