import express from "express";

import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { validateCart } from "../validators/cart.validator.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    validate(validateCart),
    addToCart
);

router.get("/", authMiddleware, getCart);

router.put("/:productId", authMiddleware, updateCartQuantity);

router.delete("/:productId", authMiddleware, removeFromCart);

router.delete("/", authMiddleware, clearCart);

export default router;