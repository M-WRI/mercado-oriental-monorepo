import { Router } from "express";
import { adjustStock, bulkAdjustStock, listMovements } from "../controller";

const router = Router();

router.get("/movements", listMovements);
router.post("/adjust", adjustStock);
router.post("/bulk-adjust", bulkAdjustStock);

export default router;
