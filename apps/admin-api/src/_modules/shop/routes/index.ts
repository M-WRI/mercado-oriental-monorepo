import { Router } from "express";
import {
  createShop,
  listShop,
  showShop,
  updateShop,
  deleteShop,
  createStripeConnect,
  getStripeConnectStatus,
} from "../controller";

const router = Router();

router.get("/", listShop);
router.get("/:id", showShop);
router.post("/", createShop);
router.put("/:id", updateShop);
router.delete("/:id", deleteShop);
router.post("/:id/stripe/connect", createStripeConnect);
router.get("/:id/stripe/status", getStripeConnectStatus);

export default router;
