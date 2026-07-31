import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";

// Add To Wishlist
export const addToWishlistService = async (userId, productId) => {
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const exists = await Wishlist.findOne({
    user: userId,
    product: productId,
  });

  if (exists) {
    throw new ApiError(400, "Product already in wishlist");
  }

  const wishlist = await Wishlist.create({
    user: userId,
    product: productId,
  });

   const data = await Wishlist.findById(wishlist._id)
    .populate(
      "product",
      "name description price image stock slug brand discount originalPrice"
    )
    .select("-__v -createdAt -updatedAt");

  return data;
};

// Get Wishlist
export const getMyWishlistService = async (userId) => {
  const wishlist = await Wishlist.find({ user: userId })
    .populate(
      "product",
      "name description price image stock slug brand discount originalPrice"
    )
    .select("-__v -createdAt -updatedAt");

  return {
    totalItems: wishlist.length,
    wishlist,
  };
};

// Remove From Wishlist
export const removeFromWishlistService = async (
  userId,
  productId
) => {
  const wishlist = await Wishlist.findOneAndDelete({
    user: userId,
    product: productId,
  });

  if (!wishlist) {
    throw new ApiError(404, "Product not found in wishlist");
  }

  return null;
};