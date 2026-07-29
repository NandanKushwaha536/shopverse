import express from "express";
import {
  placeOrder,
  getMyOrders,
  getSingleOrder,
  getAllOrders,
} from "../controllers/order.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = express.Router();

// Place Order
router.post("/", authMiddleware, placeOrder);

router.get("/my-orders", authMiddleware, getMyOrders);

router.get("/:orderId", authMiddleware, getSingleOrder);

// Admin - Get All Orders
router.get("/", authMiddleware, adminMiddleware, getAllOrders);

export default router;