import fs from "fs";
import path from "path";
import crypto from "crypto";
import type { Request } from "express";
import multer from "multer";
import { AppError, ERROR_CODES } from "./error";

export const UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");
export const PRODUCT_IMAGES_DIR = path.join(UPLOADS_ROOT, "products");

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export function ensureUploadDirs() {
  fs.mkdirSync(PRODUCT_IMAGES_DIR, { recursive: true });
}

export function getPublicBaseUrl(req: Request): string {
  if (process.env.PUBLIC_BASE_URL) {
    return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  }
  const protocol = req.get("x-forwarded-proto") ?? req.protocol;
  const host = req.get("host");
  return `${protocol}://${host}`;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureUploadDirs();
    cb(null, PRODUCT_IMAGES_DIR);
  },
  filename: (_req, file, cb) => {
    const ext =
      path.extname(file.originalname).toLowerCase() ||
      MIME_TO_EXT[file.mimetype] ||
      ".bin";
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const productImageUpload = multer({
  storage,
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIMES.has(file.mimetype)) {
      cb(
        new AppError({
          case: "invalid_file_type",
          code: ERROR_CODES.INVALID,
          statusCode: 400,
          payload: { allowed: [...ALLOWED_MIMES] },
        })
      );
      return;
    }
    cb(null, true);
  },
});
