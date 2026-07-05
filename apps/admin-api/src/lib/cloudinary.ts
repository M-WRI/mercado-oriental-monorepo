import { randomUUID } from "crypto";
import { Readable } from "stream";
import { v2 as cloudinary } from "cloudinary";
import { AppError, ERROR_CODES } from "./error";

function readCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloudName, apiKey, apiSecret };
}

export function isCloudinaryConfigured(): boolean {
  return readCloudinaryConfig() !== null;
}

export function assertCloudinaryConfigured() {
  const config = readCloudinaryConfig();
  if (!config) {
    throw new AppError({
      case: "cloudinary_not_configured",
      code: ERROR_CODES.SERVER_ERROR,
      statusCode: 503,
      payload: {
        message:
          "Image uploads require CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      },
    });
  }

  cloudinary.config({
    cloud_name: config.cloudName,
    api_key: config.apiKey,
    api_secret: config.apiSecret,
    secure: true,
  });

  return config;
}

export async function uploadProductImageBuffer(buffer: Buffer): Promise<string> {
  assertCloudinaryConfigured();

  const folder = process.env.CLOUDINARY_FOLDER?.trim() || "mercado-oriental/products";

  try {
    const secureUrl = await new Promise<string>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: randomUUID(),
          resource_type: "image",
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (!result?.secure_url) {
            reject(new Error("Cloudinary upload returned no URL"));
            return;
          }
          resolve(result.secure_url);
        }
      );

      Readable.from(buffer).pipe(uploadStream);
    });

    return secureUrl;
  } catch (error) {
    throw new AppError({
      case: "image_upload_failed",
      code: ERROR_CODES.SERVER_ERROR,
      statusCode: 502,
      payload: {
        message: error instanceof Error ? error.message : "Image upload failed",
      },
    });
  }
}
