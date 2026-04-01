import { Router } from "express";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware";
import { createReview } from "../controller";

const router: Router = Router();

router.post("/products/:productId/reviews", customerAuthMiddleware, createReview);

export default router;
