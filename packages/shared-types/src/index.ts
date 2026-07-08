import { z } from "zod";

export const ERROR_CODES = {
  NOT_FOUND: "NOT_FOUND",
  MISSING: "MISSING",
  INVALID: "INVALID",
  DUPLICATE: "DUPLICATE",
  SERVER_ERROR: "SERVER_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
} as const;

export const ProductImageUrlSchema = z.union([
  z.string().url(),
  z.string().regex(/^\/uploads\//),
]);

export const ProductImageInputSchema = z.object({
  id: z.string().optional(),
  url: ProductImageUrlSchema,
  alt: z.string().nullable().optional(),
  sortOrder: z.number().int().min(0).optional(),
  isPrimary: z.boolean().optional(),
  productVariantId: z.string().nullable().optional(),
  /** 0-based index into productVariants.create — used on product create only */
  variantIndex: z.number().int().min(0).optional(),
});

export const BaseProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required"),
  description: z.string().nullable().optional(),
  imageUrl: z
    .union([
      ProductImageUrlSchema,
      z.literal(""),
      z.null(),
    ])
    .optional(),
  images: z.array(ProductImageInputSchema).optional(),
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

export const UpdateProductVariantInput = z.object({
  name: z.string().trim().min(1, "Variant name is required"),
  price: z.number().min(0, "Price must be positive"),
  stock: z.number().int().min(0, "Stock must be positive"),
  attributeValueIds: z.array(z.string()).min(1),
});

export const UpdateProductVariantPatchInput = UpdateProductVariantInput.extend({
  id: z.string(),
}).partial({ name: true, price: true, stock: true, attributeValueIds: true }).required({ id: true });

export const UpdateProductRequestBody = BaseProductSchema.partial().extend({
  shopId: z.string().optional(),
  categoryIds: z.array(z.string()).optional(),
  variants: z
    .object({
      create: z.array(UpdateProductVariantInput).optional(),
      update: z.array(UpdateProductVariantPatchInput).optional(),
      delete: z.array(z.string()).optional(),
    })
    .optional(),
});

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
