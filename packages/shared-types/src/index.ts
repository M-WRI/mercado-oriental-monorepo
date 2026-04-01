import { z } from "zod";

export const ERROR_CODES = {
  NOT_FOUND: "NOT_FOUND",
  MISSING: "MISSING",
  INVALID: "INVALID",
  DUPLICATE: "DUPLICATE",
  SERVER_ERROR: "SERVER_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
} as const;

export const BaseProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const BaseVariantSchema = z.object({
  name: z.string().trim().min(1, "Variant name is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().int().min(0, "Stock must be positive").default(0),
  reservedStock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).nullable().optional(),
});

export const CreateProductVariantRequestBody = z.object({
  name: z.string().trim().min(1, "Variant name is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().int().min(0, "Stock must be positive").default(0),
  productVariantAttributeValues: z.object({
    create: z.array(z.object({
      productAttributeValueId: z.string()
    }))
  }).optional()
});

export const CreateProductRequestBody = BaseProductSchema.extend({
  shopId: z.string(),
  productVariants: z.object({
    create: z.array(CreateProductVariantRequestBody)
  }).optional()
});

export const UpdateProductRequestBody = BaseProductSchema;

export const UpdateProductVariantRequestBody = z.object({
  name: z.string().trim().min(1, "Variant name is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().int().min(0, "Stock must be positive").default(0),
  productVariantAttributeValues: z.object({
    create: z.array(z.object({
      productAttributeValueId: z.string()
    }))
  }).optional()
}).partial();
