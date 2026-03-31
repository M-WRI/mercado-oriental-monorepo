import { Router } from "express";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware";
import { createOrder, listOrders, showOrder } from "../controller";

const router = Router();

router.post("/", customerAuthMiddleware, createOrder);
router.get("/", customerAuthMiddleware, listOrders);
router.get("/:id", customerAuthMiddleware, showOrder);

export default router;
