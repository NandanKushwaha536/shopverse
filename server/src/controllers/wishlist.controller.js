import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
// import { AUTH_MESSAGE } from "../constants/index.js";

import {
  addToWishlistService,
  getMyWishlistService,
  removeFromWishlistService,
} from "../services/wishlist.service.js";

// Add to Wishlist
export const addToWishlist = asyncHandler(async (req, res) => {
  const wishlist = await addToWishlistService(
    req.user._id,
    req.params.productId
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      wishlist,
      "Product added to wishlist"
    )
  );
});

// Get My Wishlist
export const getMyWishlist = asyncHandler(async (req, res) => {
  const data = await getMyWishlistService(req.user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      data,
      "Wishlist fetched successfully"
    )
  );
});
// Remove From Wishlist
export const removeFromWishlist = asyncHandler(async (req, res) => {
  await removeFromWishlistService(
    req.user._id,
    req.params.productId
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Product removed from wishlist"
    )
  );
});