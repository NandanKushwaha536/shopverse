import Product from "../models/Product.js";

export const calculateCartTotal = async (items) => {
  let total = 0;

  for (const item of items) {
    const product = await Product.findById(item.product);

    if (product) {
      total += product.price * item.quantity;
    }
  }

  return total;
};