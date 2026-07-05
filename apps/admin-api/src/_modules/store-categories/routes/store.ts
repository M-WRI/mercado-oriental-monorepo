import { Router } from "express";
import { listCategories } from "../controller";

const router = Router();

router.get("/", listCategories);

export default router;
