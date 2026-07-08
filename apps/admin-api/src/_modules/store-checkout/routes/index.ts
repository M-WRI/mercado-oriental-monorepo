import { Router } from "express";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware";
import { createCheckout, getCheckoutStatus } from "../controller";

const router = Router();

router.post("/", customerAuthMiddleware, createCheckout);
router.get("/status", customerAuthMiddleware, getCheckoutStatus);

export default router;
