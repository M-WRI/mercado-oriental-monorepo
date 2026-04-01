import { Router } from "express";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware";
import { createMessage, listMessages } from "../controller";

const router: Router = Router();

router.get("/orders/:orderId/messages", customerAuthMiddleware, listMessages);
router.post("/orders/:orderId/messages", customerAuthMiddleware, createMessage);

export default router;
