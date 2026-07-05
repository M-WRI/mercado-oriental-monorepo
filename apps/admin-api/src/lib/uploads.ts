import multer from "multer";
import { AppError, ERROR_CODES } from "./error";

const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const productImageUpload = multer({
  storage: multer.memoryStorage(),
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
