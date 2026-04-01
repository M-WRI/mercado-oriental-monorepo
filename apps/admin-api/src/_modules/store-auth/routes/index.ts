import { Router } from "express";
import { register, login, me, updateProfile } from "../controller";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware";

const router: Router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", customerAuthMiddleware, me);
router.patch("/me", customerAuthMiddleware, updateProfile);

export default router;
