import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

// Add to Wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    // Check Product
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Already Exists
    const exists = await Wishlist.findOne({
      user: req.user._id,
      product: productId,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Product already in wishlist",
      });
    }

    const wishlist = await Wishlist.create({
      user: req.user._id,
      product: productId,
    });

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      wishlist,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get My Wishlist
export const getMyWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({
      user: req.user._id,
    }).populate("product");

    res.status(200).json({
      success: true,
      totalItems: wishlist.length,
      wishlist,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove From Wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    const wishlist = await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: productId,
    });

    if (!wishlist) {
      return res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};