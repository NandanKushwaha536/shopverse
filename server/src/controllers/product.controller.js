import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { getAllProductsService } from "../services/product.service.js";
import { validateCreateProduct } from "../validators/product.validator.js";
import { calculateDiscount } from "../utils/calculateDiscount.js";
import { deleteCloudinaryImage } from "../utils/deleteCloudinaryImage.js";
import { generateSlug } from "../utils/generateSlug.js";
import { calculateRatings } from "../utils/calculateRatings.js";

// Create Product
export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    brand,
    originalPrice,
    discount,
    category,
    stock,
  } = req.body;

  let image = {
    url: "",
    public_id: "",
  };

  // Upload image to Cloudinary
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer);

    image = {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  // Calculate final price
  const finalPrice = calculateDiscount(originalPrice, discount);

  // Create Product
  const product = await Product.create({
    name,
    slug: generateSlug(name),
    description,
    brand,
    originalPrice,
    discount,
    price: finalPrice,
    category,
    image,
    stock,
    createdBy: req.user._id,
  });

  return res.status(201).json(
    new ApiResponse(
      201,
      product,
      "Product created successfully"
    )
  );
});
// Get All Products
export const getProducts = asyncHandler(async (req, res) => {

    const data = await getAllProductsService(req.query);

    return res.status(200).json(
        new ApiResponse(
            200,
            data,
            "Products fetched successfully"
        )
    );
});

// Get Single Product
export const getSingleProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      product,
      "Product fetched successfully"
    )
  );
});

// Update Product

export const updateProduct = asyncHandler(async (req, res) => {
  // Find Product
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Update Basic Details
  product.name = req.body.name ?? product.name;
  if (req.body.name) {
  product.slug = generateSlug(req.body.name);
}
  product.description = req.body.description ?? product.description;
  product.brand = req.body.brand ?? product.brand;
  product.category = req.body.category ?? product.category;
  product.stock = req.body.stock ?? product.stock;

  // Update Pricing
  product.originalPrice =
    req.body.originalPrice ?? product.originalPrice;

  product.discount =
    req.body.discount ?? product.discount;

  // Validate Discount
  if (product.discount < 0 || product.discount > 100) {
    throw new ApiError(400, "Discount must be between 0 and 100");
  }

  // Calculate Final Price
  product.price = Math.round(
    calculateDiscount(product.originalPrice, product.discount)
  );

  // Update Product Image
  if (req.file) {
    await deleteCloudinaryImage(product.image.public_id);

    const result = await uploadToCloudinary(req.file.buffer);

    product.image = {
      url: result.secure_url,
      public_id: result.public_id,
    };
  }

  // Save Product
  await product.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      product,
      "Product updated successfully"
    )
  );
});


export const deleteProduct = asyncHandler(async (req, res) => {
  // Find Product
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Delete Image
  await deleteCloudinaryImage(product.image.public_id);

  // Delete Product
  await product.deleteOne();

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "Product deleted successfully"
    )
  );
});



export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const alreadyReviewed = product.reviews.find(
    (review) => review.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    throw new ApiError(400, "You have already reviewed this product");
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  product.reviews.push(review);

  product.numOfReviews = product.reviews.length;

  product.ratings = calculateRatings(product.reviews);

  await product.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      product,
      "Review added successfully"
    )
  );
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        reviews: product.reviews,
        numOfReviews: product.numOfReviews,
        ratings: product.ratings,
      },
      "Reviews fetched successfully"
    )
  );
});

export const updateReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const review = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  review.rating = Number(rating);
  review.comment = comment;

  product.ratings = calculateRatings(product.reviews);

  await product.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      product,
      "Review updated successfully"
    )
  );
});

export const deleteReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const reviews = product.reviews.filter(
    (review) => review.user.toString() !== req.user._id.toString()
  );

  product.reviews = reviews;
  product.numOfReviews = reviews.length;
  product.ratings = calculateRatings(reviews);

  await product.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      product,
      "Review deleted successfully"
    )
  );
});