import { Router } from "express";
import { listProducts, showProduct } from "../controller";

const router = Router();

router.get("/", listProducts);
router.get("/:id", showProduct);

export default router;
