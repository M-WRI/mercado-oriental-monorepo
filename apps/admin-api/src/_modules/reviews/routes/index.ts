import { Router } from "express";
import { listProductReviews, replyToReview, deleteReviewReply } from "../controller";

const router = Router();

router.get("/products/:productId/reviews", listProductReviews);
router.post("/reviews/:id/reply", replyToReview);
router.delete("/reviews/:id/reply", deleteReviewReply);

export default router;
