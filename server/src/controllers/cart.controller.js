import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { calculateCartTotal } from "../utils/cart.utils.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  addToCartService,
  getCartService,
  updateCartQuantityService,
  removeFromCartService,
  clearCartService,
} from "../services/cart.service.js";

import { sendResponse } from "../utils/sendResponse.js";
import { CART_MESSAGES } from "../constants/messages.js";


// Add Product To Cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;

  const cart = await addToCartService(
    req.user._id,
    productId,
    quantity
  );

    return sendResponse(
        res,
        201,
        cart,
        CART_MESSAGES.ADDED
      );
  });
  
// Get User Cart
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getCartService(req.user._id);
      
    return sendResponse(
        res,
        200,
        cart,
        CART_MESSAGES.FETCHED
      );
});

// Update Cart Quantity
export const updateCartQuantity = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  const cart = await updateCartQuantityService(
    req.user._id,
    productId,
    quantity
  );

  return sendResponse(
      res,
      200,
      cart,
      CART_MESSAGES.UPDATED
    );
});

// Remove Product From Cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await removeFromCartService(
    req.user._id,
    req.params.productId
  );

    return sendResponse(
        res,
        200,
        cart,
      CART_MESSAGES.REMOVED
      );
});

// Clear Cart
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await clearCartService(req.user._id);

  return sendResponse(
      res,
      201,
      cart,
    CART_MESSAGES.CLEARED
    );
});



