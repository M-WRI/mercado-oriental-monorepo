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

const router = Router();

router.get("/", listProduct);
router.get("/:id", showProduct);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/bulk", bulkDeleteProducts);
router.delete("/:id", deleteProduct);

router.get("/:id/variants", listProductVariant);
router.get("/:id/variants/:variantId", showProductVariant);
router.post("/:id/variants", createProductVariant);
router.put("/:id/variants/:variantId", updateProductVariant);
router.delete("/:id/variants/:variantId", deleteProductVariant);

export default router;
