import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  getDashboardStats
);

export default router;