import { Router } from "express";
import { listShops, showShop } from "../controller";

const router = Router();

router.get("/", listShops);
router.get("/:id", showShop);

export default router;
