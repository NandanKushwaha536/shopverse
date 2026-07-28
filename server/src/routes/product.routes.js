import express from "express";

import {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

import { adminMiddleware } from "../middleware/admin.middleware.js";

const router = express.Router();


// Create Product (Admin Only)
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  createProduct
);


// Get All Products
router.get("/", getProducts);

// Get Single Product
router.get("/:id", getSingleProduct);


// Update Product (Admin Only)
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  updateProduct
);

// Delete Product (Admin Only)
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);
export default router;