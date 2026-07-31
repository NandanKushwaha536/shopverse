import express from "express";

import {
  createProduct,
  getProducts,
  getSingleProduct,
  updateProduct,
  deleteProduct,
  createReview,
  getProductReviews,
  updateReview,
  deleteReview,
} from "../controllers/product.controller.js";

import { authMiddleware } from "../middleware/auth.middleware.js";

import { adminMiddleware } from "../middleware/admin.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { validateCreateProduct } from "../validators/product.validator.js";
import upload from "../middleware/upload.middleware.js";


const router = express.Router();


// Create Product (Admin Only)
router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    upload.single("image"),
    validate(validateCreateProduct),
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
  upload.single("image"),
  updateProduct
);
// Delete Product (Admin Only)
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

router.post(
  "/:id/review",
  authMiddleware,
  createReview
);

router.get("/:id/reviews", getProductReviews);

router.put(
  "/:id/review",
  authMiddleware,
  updateReview
);

router.delete(
  "/:id/review",
  authMiddleware,
  deleteReview
);
export default router;