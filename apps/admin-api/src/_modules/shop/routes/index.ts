import { Router } from "express";
import {
  createShop,
  listShop,
  showShop,
  updateShop,
  deleteShop,
} from "../controller";

const router = Router();

router.get("/", listShop);
router.get("/:id", showShop);
router.post("/", createShop);
router.put("/:id", updateShop);
router.delete("/:id", deleteShop);

export default router;
