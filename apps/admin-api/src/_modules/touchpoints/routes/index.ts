import { Router } from "express";
import {
  listOrderMessages,
  createOrderMessage,
  listDisputes,
  showDispute,
  createDispute,
  updateDisputeStatus,
  createDisputeMessage,
} from "../controller";

const router = Router();

// Order messages
router.get("/orders/:orderId/messages", listOrderMessages);
router.post("/orders/:orderId/messages", createOrderMessage);

// Disputes
router.get("/disputes", listDisputes);
router.get("/disputes/:id", showDispute);
router.post("/orders/:orderId/disputes", createDispute);
router.put("/disputes/:id/status", updateDisputeStatus);
router.post("/disputes/:id/messages", createDisputeMessage);

export default router;
