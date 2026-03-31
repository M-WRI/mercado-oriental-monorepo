import { Router } from "express";
import { listOrder, showOrder, updateOrderStatus, updateOrder, restockOrder } from "../controller";

const router = Router();

router.get("/", listOrder);
router.get("/:id", showOrder);
router.put("/:id", updateOrder);
router.put("/:id/status", updateOrderStatus);
router.post("/:id/restock", restockOrder);

export default router;
