import { Router } from "express";
import { register, login, me, updateProfile } from "../controller";
import { authMiddleware } from "../../../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, me);
router.patch("/me", authMiddleware, updateProfile);

export default router;
