import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import ApiError from "../utils/ApiError.js";
import { calculateCartTotal } from "../utils/cart.utils.js";

export const addToCartService = async (userId, productId, quantity = 1) => {
  // Check Product
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Check Stock
  if (product.stock < quantity) {
    throw new ApiError(400, "Not enough stock");
  }

  // Find Cart
  let cart = await Cart.findOne({
    user: userId,
  });

  // Create Cart
  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [],
    });
  }

  // Check Existing Item
  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      product: productId,
      quantity,
    });
  }

  // Calculate Total
  cart.totalPrice = await calculateCartTotal(cart.items);

  await cart.save();

  return cart;
};

export const getCartService = async (userId) => {
  const cart = await Cart.findOne({
    user: userId,
  }).populate(
    "items.product",
    "name description price image stock slug brand discount originalPrice"
  )
  .select("-__v -createdAt -updatedAt");

  if (!cart) {
    return {
      items: [],
      totalPrice: 0,
    };
  }

  return cart;
};



export const updateCartQuantityService = async (
  userId,
  productId,
  quantity
) => {
  if (quantity < 1) {
    throw new ApiError(400, "Quantity must be at least 1");
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const item = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (!item) {
    throw new ApiError(404, "Product not found in cart");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  if (quantity > product.stock) {
    throw new ApiError(400, "Requested quantity exceeds available stock");
  }

  item.quantity = quantity;

  cart.totalPrice = await calculateCartTotal(cart.items);

  await cart.save();

  const updatedCart = await Cart.findById(cart._id)
  .populate(
    "items.product",
    "name description price image stock slug brand discount originalPrice"
  )
  .select("-__v -createdAt -updatedAt");

return updatedCart;
};



export const removeFromCartService = async (userId, productId) => {
  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const itemExists = cart.items.some(
    (item) => item.product.toString() === productId
  );

  if (!itemExists) {
    throw new ApiError(404, "Product not found in cart");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  cart.totalPrice = await calculateCartTotal(cart.items);

  await cart.save();
  const removeCart = await Cart.findById(cart._id)
    .populate(
      "items.product",
      "name description price image stock slug brand discount originalPrice"
    )
    .select("-__v -createdAt -updatedAt");

  return removeCart;
};

export const clearCartService = async (userId) => {
  const cart = await Cart.findOne({
    user: userId,
  });

  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  cart.items = [];
  cart.totalPrice = 0;

  await cart.save();

  const clearCart = await Cart.findById(cart._id)
    .populate(
      "items.product",
      "name description price image stock slug brand discount originalPrice"
    )
    .select("-__v -createdAt -updatedAt");

  return clearCart;
};