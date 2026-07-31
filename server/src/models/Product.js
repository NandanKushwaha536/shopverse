import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
     name: String,
      slug: {
        type: String,
        unique: true,
      },
      
    description: {
      type: String,
      required: true,
    },

    originalPrice: {
      type: Number,
      required: true,
    },

    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },

    price: {
        type: Number,
        required: true,
      },

    category: {
      type: String,
      required: true,
    },

    brand: {
        type: String,
        required: [true, "Please enter product brand"],
        trim: true,
      },

   image: {
   url: {
    type: String,
    default: "",
  },
  public_id: {
    type: String,
    default: "",
  },
},

    stock: {
      type: Number,
      default: 0,
    },

    ratings: {
      type: Number,
      default: 0,
    },

      numOfReviews: {
    type: Number,
    default: 0,
  },

  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },

      name: {
        type: String,
        required: true,
      },

      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },

      comment: {
        type: String,
        required: true,
      },
    },
  ],

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;