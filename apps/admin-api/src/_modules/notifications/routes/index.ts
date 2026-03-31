import { Router } from "express";
import { listNotifications, markNotificationRead, markAllNotificationsRead } from "../controller";

const router = Router();

router.get("/", listNotifications);
router.patch("/read-all", markAllNotificationsRead);
router.patch("/:id/read", markNotificationRead);

export default router;
