import { Router } from "express";
import { customerAuthMiddleware } from "../../../middleware/customerAuthMiddleware";
import { createReview, listReviews } from "../controller";

const router: Router = Router();

router.get("/reviews", customerAuthMiddleware, listReviews);
router.post("/products/:productId/reviews", customerAuthMiddleware, createReview);

export default router;
