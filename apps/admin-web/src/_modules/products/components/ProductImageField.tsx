import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useUpload } from "@/_shared/queryProvider";
import { Button } from "@mercado/shared-ui";
import { Input } from "@mercado/shared-ui/components/inputs/components/Input";
import {
  uploadProductImage,
  type UploadProductImageResponse,
} from "@/_modules/uploads/api";

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const MAX_BYTES = 5 * 1024 * 1024;

function isValidImageUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith("/uploads/")) return true;
  if (trimmed.includes("res.cloudinary.com")) return true;
  try {
    new URL(trimmed);
    return true;
  } catch {
    return false;
  }
}

export function isProductImageUrlValid(value: string): boolean {
  return isValidImageUrl(value);
}

interface ProductImageFieldProps {
  value: string;
  onChange: (url: string) => void;
}

export function ProductImageField({ value, onChange }: ProductImageFieldProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(Boolean(value && !value.includes("/uploads/")));

  const { mutate: upload, isPending } = useUpload<UploadProductImageResponse>();

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    setUploadError(null);

    if (!ACCEPTED_TYPES.split(",").includes(file.type)) {
      setUploadError(t("products.infoStep.imageUploadInvalidType"));
      return;
    }
    if (file.size > MAX_BYTES) {
      setUploadError(t("products.infoStep.imageUploadTooLarge"));
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    upload(
      { url: uploadProductImage.url, formData },
      {
        onSuccess: (data) => {
          onChange(data.url);
          setShowUrlInput(false);
        },
        onError: () => {
          setUploadError(t("products.infoStep.imageUploadFailed"));
        },
      }
    );
  };

  return (
    <div className="grid gap-3">
      <label className="text-sm font-medium text-gray-700">
        {t("products.infoStep.imageLabel")}
      </label>

      {value.trim() ? (
        <div className="flex items-start gap-4">
          <div className="rounded-lg border border-gray-200 overflow-hidden w-32 h-32 bg-gray-50 shrink-0">
            <img
              src={value.trim()}
              alt={t("products.infoStep.imagePreviewAlt")}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="flex flex-col gap-2 pt-1">
            <Button
              type="button"
              style="primaryOutline"
              disabled={isPending}
              onClick={() => fileInputRef.current?.click()}
            >
              {isPending
                ? t("products.infoStep.imageUploading")
                : t("products.infoStep.imageReplace")}
            </Button>
            <Button
              type="button"
              style="ghost"
              disabled={isPending}
              onClick={() => {
                onChange("");
                setShowUrlInput(false);
              }}
            >
              {t("products.infoStep.imageRemove")}
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 w-full max-w-sm h-36 rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-600 transition-colors disabled:opacity-50"
        >
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          <span className="text-sm font-medium">
            {isPending
              ? t("products.infoStep.imageUploading")
              : t("products.infoStep.imageUploadPrompt")}
          </span>
          <span className="text-xs text-gray-400">
            {t("products.infoStep.imageUploadHint")}
          </span>
        </button>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={(e) => {
          handleFileSelect(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />

      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}

      {!value.trim() && (
        <button
          type="button"
          className="text-xs text-indigo-600 hover:text-indigo-800 w-fit"
          onClick={() => setShowUrlInput((prev) => !prev)}
        >
          {showUrlInput
            ? t("products.infoStep.imageHideUrl")
            : t("products.infoStep.imageUseUrl")}
        </button>
      )}

      {showUrlInput && (
        <Input
          name="imageUrl"
          label={t("products.infoStep.imageUrlLabel")}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t("products.infoStep.imageUrlPlaceholder")}
        />
      )}
    </div>
  );
}
