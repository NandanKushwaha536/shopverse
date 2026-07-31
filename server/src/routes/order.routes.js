import express from "express";
import {
  placeOrder,
  getMyOrders,
  getSingleOrder,
  getAllOrders,
  updateOrderStatus,
  createRazorpayOrder,
  verifyPayment,
  cancelOrder,
} from "../controllers/order.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { adminMiddleware } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { validateOrder } from "../validators/order.validator.js";

const router = express.Router();


router.post("/", authMiddleware, validate(validateOrder), placeOrder);

router.get("/my-orders", authMiddleware, getMyOrders);

router.get("/:orderId", authMiddleware, getSingleOrder);

router.get("/", authMiddleware, adminMiddleware, getAllOrders);

router.put("/:orderId/status", authMiddleware, adminMiddleware, updateOrderStatus);

router.put("/:orderId/cancel", authMiddleware, cancelOrder);

router.post("/:orderId/create-payment", authMiddleware, createRazorpayOrder);

router.post(
  "/verify-payment",
  authMiddleware,
  verifyPayment
);

export default router;