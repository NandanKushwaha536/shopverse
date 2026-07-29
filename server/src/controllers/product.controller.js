import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

// Create Product
export const createProduct = async (req, res) => {
  try {
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

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer);

      image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    const finalPrice =
     originalPrice - (originalPrice * (discount || 0)) / 100;

    const product = await Product.create({
        name,
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
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// Get All Products
export const getProducts = async (req, res) => {
  try {
    const {
      keyword,
      category,
      minPrice,
      maxPrice,
      sort,
      page = 1,
      limit = 8,
    } = req.query;

    const query = {};

    // Search
    if (keyword) {
      query.name = {
        $regex: keyword,
        $options: "i",
      };
    }


    // Category Filter
    if (category) {
      query.category = category;
    }

    if (req.query.brand) {
      query.brand = req.query.brand;
    }

    // Price Filter
    if (minPrice || maxPrice) {
      query.price = {};

      if (minPrice) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice) {
        query.price.$lte = Number(maxPrice);
      }
    }

    let productsQuery = Product.find(query);

    // Sorting
    if (sort === "price_asc") {
      productsQuery = productsQuery.sort({ price: 1 });
    } else if (sort === "price_desc") {
      productsQuery = productsQuery.sort({ price: -1 });
    } else if (sort === "newest") {
      productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);

    productsQuery = productsQuery
      .skip(skip)
      .limit(Number(limit));

    const products = await productsQuery;

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      totalProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / Number(limit)),
      products,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single Product
export const getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update Product

export const updateProduct = async (req, res) => {
  try {
    // Find Product
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    
    // Update Basic Details
    
    product.name = req.body.name ?? product.name;
    product.description = req.body.description ?? product.description;
    product.brand = req.body.brand ?? product.brand;
    product.category = req.body.category ?? product.category;
    product.stock = req.body.stock ?? product.stock;

    
    // Update Pricing
    
    product.originalPrice =
      req.body.originalPrice ?? product.originalPrice;

    product.discount =
      req.body.discount ?? product.discount;

    // Prevent Invalid Discount
    if (product.discount < 0 || product.discount > 100) {
      return res.status(400).json({
        success: false,
        message: "Discount must be between 0 and 100",
      });
    }

    // Calculate Final Price
    product.price =
      product.originalPrice -
      (product.originalPrice * product.discount) / 100;

    // Round Price (Optional)
    product.price = Math.round(product.price);

   
    // Update Product Image
  

    if (req.file) {
      // Delete Old Image
      if (product.image?.public_id) {
        await cloudinary.uploader.destroy(product.image.public_id);
      }

      // Upload New Image
      const result = await uploadToCloudinary(req.file.buffer);

      product.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    // Save Product
    await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    console.error("Update Product Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};


// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete image from Cloudinary
    if (product.image.public_id) {
      await cloudinary.uploader.destroy(product.image.public_id);
    }

    // Delete product
    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (review) => review.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this product",
      });
    }

    // Create Review
    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    product.reviews.push(review);

    product.numOfReviews = product.reviews.length;

    // Calculate Average Rating
    product.ratings =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({
      success: true,
      message: "Review added successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProductReviews = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      reviews: product.reviews,
      numOfReviews: product.numOfReviews,
      ratings: product.ratings,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const review = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.rating = Number(rating);
    review.comment = comment;

    product.ratings =
      product.reviews.reduce((acc, item) => acc + item.rating, 0) /
      product.reviews.length;

    await product.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const reviews = product.reviews.filter(
      (review) => review.user.toString() !== req.user._id.toString()
    );

    product.reviews = reviews;
    product.numOfReviews = reviews.length;

    if (reviews.length === 0) {
      product.ratings = 0;
    } else {
      product.ratings =
        reviews.reduce((acc, item) => acc + item.rating, 0) /
        reviews.length;
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
      product,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};