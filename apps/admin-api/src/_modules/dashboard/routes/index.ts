import { Router } from "express";
import { getDashboard } from "../controller/getDashboard";

const router = Router();

router.get("/", getDashboard as any);

export default router;
