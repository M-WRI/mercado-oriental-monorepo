import { Router } from "express";
import {
  createProduct,
  listProduct,
  showProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
} from "../controller";

import {
  createProductVariant,
  listProductVariant,
  showProductVariant,
  updateProductVariant,
  deleteProductVariant,
} from "../_modules/productVariants/controller";

import { validateRequest } from "../../../middleware/validateMiddleware";
import { CreateProductRequestBody, UpdateProductRequestBody, CreateProductVariantRequestBody, UpdateProductVariantRequestBody } from "@mercado/shared-types";

const router: Router = Router();

router.get("/", listProduct);
router.get("/:id", showProduct);
router.post("/", validateRequest(CreateProductRequestBody), createProduct);
router.put("/:id", validateRequest(UpdateProductRequestBody), updateProduct);
router.delete("/bulk", bulkDeleteProducts);
router.delete("/:id", deleteProduct);

router.get("/:id/variants", listProductVariant);
router.get("/:id/variants/:variantId", showProductVariant);
router.post("/:id/variants", validateRequest(CreateProductVariantRequestBody), createProductVariant);
router.put("/:id/variants/:variantId", validateRequest(UpdateProductVariantRequestBody), updateProductVariant);
router.delete("/:id/variants/:variantId", deleteProductVariant);

export default router;
