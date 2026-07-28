// import Cart from "../models/Cart.js";
// import Product from "../models/Product.js";


// // Add Product to Cart
// export const addToCart = async (req, res) => {
//   try {
//     const { productId, quantity } = req.body;

//     const product = await Product.findById(productId);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     let cart = await Cart.findOne({
//       user: req.user._id,
//     });

//     if (!cart) {
//       cart = await Cart.create({
//         user: req.user._id,
//         items: [],
//       });
//     }

//     const existingItem = cart.items.find(
//       (item) => item.product.toString() === productId
//     );

//     if (existingItem) {
//       existingItem.quantity += quantity || 1;
//     } else {
//       cart.items.push({
//         product: productId,
//         quantity: quantity || 1,
//       });
//     }

//     cart.totalPrice = 0;

// for (const item of cart.items) {
//   const product = await Product.findById(item.product);
//   cart.totalPrice += product.price * item.quantity;
// }

//     await cart.save();

//     res.status(200).json({
//       success: true,
//       message: "Product added to cart",
//       cart,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


// // Get User Cart
// export const getCart = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({
//       user: req.user._id,
//     }).populate("items.product");

//     res.status(200).json({
//       success: true,
//       cart,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // Update Cart Quantity
// export const updateCartQuantity = async (req, res) => {
//   try {
//     const { quantity } = req.body;
//     const { productId } = req.params;

//     const cart = await Cart.findOne({
//       user: req.user._id,
//     });

//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         message: "Cart not found",
//       });
//     }

//     const item = cart.items.find(
//       (item) => item.product.toString() === productId
//     );

//     if (!item) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not in cart",
//       });
//     }

//     item.quantity = quantity;

//     cart.totalPrice = 0;

// for (const item of cart.items) {
//   const product = await Product.findById(item.product);
//   cart.totalPrice += product.price * item.quantity;
// }


//     await cart.save();

//     res.status(200).json({
//       success: true,
//       message: "Cart updated successfully",
//       cart,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // Remove Product From Cart
// export const removeFromCart = async (req, res) => {
//   try {
//     const { productId } = req.params;

//     const cart = await Cart.findOne({
//       user: req.user._id,
//     });

//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         message: "Cart not found",
//       });
//     }

//     cart.items = cart.items.filter(
//       (item) => item.product.toString() !== productId
//     );

//     cart.totalPrice = 0;

// for (const item of cart.items) {
//   const product = await Product.findById(item.product);
//   cart.totalPrice += product.price * item.quantity;
// }



//     await cart.save();

//     res.status(200).json({
//       success: true,
//       message: "Product removed from cart",
//       cart,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // Clear Cart
// export const clearCart = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({
//       user: req.user._id,
//     });

//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         message: "Cart not found",
//       });
//     }

//     cart.items = [];
//     cart.totalPrice = 0;

//     await cart.save();

//     res.status(200).json({
//       success: true,
//       message: "Cart cleared successfully",
//       cart,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { calculateCartTotal } from "../utils/cart.utils.js";


// Add Product To Cart
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }


    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Not enough stock",
      });
    }


    let cart = await Cart.findOne({
      user: req.user._id,
    });


    if (!cart) {
      cart = await Cart.create({
        user: req.user._id,
        items: [],
      });
    }


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


    cart.totalPrice = await calculateCartTotal(cart.items);


    await cart.save();


    res.status(200).json({
      success: true,
      message: "Product added to cart",
      cart,
    });


  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message,
    });
  }
};



// Get User Cart
export const getCart = async (req,res)=>{
  try {

    const cart = await Cart.findOne({
      user:req.user._id,
    }).populate("items.product");


    if(!cart){
      return res.status(200).json({
        success:true,
        cart:{
          items:[],
          totalPrice:0,
        },
      });
    }


    res.status(200).json({
      success:true,
      cart,
    });


  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};



// Update Cart Quantity
export const updateCartQuantity = async(req,res)=>{
  try{

    const {quantity}=req.body;
    const {productId}=req.params;


    if(quantity < 1){
      return res.status(400).json({
        success:false,
        message:"Quantity must be at least 1",
      });
    }


    const cart = await Cart.findOne({
      user:req.user._id,
    });


    if(!cart){
      return res.status(404).json({
        success:false,
        message:"Cart not found",
      });
    }


    const item = cart.items.find(
      item=>item.product.toString()===productId
    );


    if(!item){
      return res.status(404).json({
        success:false,
        message:"Product not in cart",
      });
    }


    item.quantity = quantity;


    cart.totalPrice = await calculateCartTotal(cart.items);


    await cart.save();


    res.status(200).json({
      success:true,
      message:"Cart updated successfully",
      cart,
    });


  }catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};



// Remove Product From Cart
export const removeFromCart = async(req,res)=>{
  try{

    const {productId}=req.params;


    const cart = await Cart.findOne({
      user:req.user._id,
    });


    if(!cart){
      return res.status(404).json({
        success:false,
        message:"Cart not found",
      });
    }


    cart.items = cart.items.filter(
      item=>item.product.toString()!==productId
    );


    cart.totalPrice = await calculateCartTotal(cart.items);


    await cart.save();


    res.status(200).json({
      success:true,
      message:"Product removed from cart",
      cart,
    });


  }catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};



// Clear Cart
export const clearCart = async(req,res)=>{
  try{

    const cart = await Cart.findOne({
      user:req.user._id,
    });


    if(!cart){
      return res.status(404).json({
        success:false,
        message:"Cart not found",
      });
    }


    cart.items=[];
    cart.totalPrice=0;


    await cart.save();


    res.status(200).json({
      success:true,
      message:"Cart cleared successfully",
      cart,
    });


  }catch(error){

    res.status(500).json({
      success:false,
      message:error.message,
    });

  }
};