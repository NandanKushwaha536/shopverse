import express from "express";
import {
  placeOrder,
  getMyOrders,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,
  createRazorpayOrder,
  verifyPayment,
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

router.put("/:orderId", authMiddleware, adminMiddleware, updateOrderStatus);

router.post(
  "/:orderId/create-payment",
  authMiddleware,
  createRazorpayOrder
);

router.post(
  "/verify-payment",
  authMiddleware,
  verifyPayment
);

export default router;