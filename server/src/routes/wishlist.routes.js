import express from "express";
import {
  addToWishlist,
  getMyWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/:productId", authMiddleware, addToWishlist);

router.get("/", authMiddleware, getMyWishlist);

router.delete("/:productId", authMiddleware, removeFromWishlist);

export default router;