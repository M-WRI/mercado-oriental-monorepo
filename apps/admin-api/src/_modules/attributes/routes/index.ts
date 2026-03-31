import { Router } from "express";
import {
  createProductAttribute,
  listProductAttribute,
  updateProductAttribute,
  deleteProductAttribute,
  bulkDeleteProductAttributes,
  getProductAttribute,
} from "../controller";
import { deleteProductAttributeValue } from "../_modules/controller";

const router = Router();

router.get("/", listProductAttribute);
router.get("/:id", getProductAttribute);
router.post("/", createProductAttribute);
router.put("/:id", updateProductAttribute);
router.delete("/bulk", bulkDeleteProductAttributes);
router.delete("/:id", deleteProductAttribute);

router.delete("/:attributeId/values/:valueId", deleteProductAttributeValue);

export default router;
