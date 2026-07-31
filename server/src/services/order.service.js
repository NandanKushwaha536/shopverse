import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import ApiError from "../utils/ApiError.js";
import Product from "../models/Product.js";
import { ORDER_STATUS } from "../constants/orderStatus.js";
import razorpay from "../utils/razorpay.js";
import crypto from "crypto";

// Place Order
export const placeOrderService = async (
  userId,
  shippingAddress,
  paymentMethod
) => {
  const cart = await Cart.findOne({
    user: userId,
  }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    quantity: item.quantity,
    price: item.product.price,
  }));

    // Reduce Product Stock
 for (const item of cart.items) {
    const product = await Product.findById(item.product._id);

    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (product.stock < item.quantity) {
        throw new ApiError(
        400,
        `${product.name} is out of stock`
        );
    }

    product.stock -= item.quantity;

    await product.save();
    }

  const order = await Order.create({
    user: userId,
    orderItems,
    shippingAddress,
    paymentMethod,
    totalPrice: cart.totalPrice,
  });

  cart.items = [];
  cart.totalPrice = 0;

  await cart.save();
    
  const data = await Order.findById(order._id)
    .populate(
      "orderItems.product",
      "name image price slug brand"
    )
    .select("-__v");

  return data;

};

// Get My Orders
export const getMyOrdersService = async (userId) => {
  return await Order.find({
    user: userId,
  })
    .populate(
      "orderItems.product",
      "name image price slug brand"
    )
    .select("-__v -updatedAt")
    .sort({ createdAt: -1 });
};

export const getSingleOrderService = async (
  orderId,
  userId,
  role
) => {
  const order = await Order.findById(orderId)
      .populate("user", "name email")
      .populate(
        "orderItems.product",
        "name image price slug brand"
      )
      .select("-__v -updatedAt");

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (
    order.user._id.toString() !== userId.toString() &&
    role !== "admin"
  ) {
    throw new ApiError(403, "Access denied");
  }

  return order;
};

export const getAllOrdersService = async () => {
  const orders = await Order.find()
         
    .populate(
        "orderItems.product",
        "name image price slug brand"
      )
      .select("-__v -updatedAt")
      .sort({ createdAt: -1 });

  return {
    totalOrders: orders.length,
    orders,
  };
};

export const updateOrderStatusService = async (
  orderId,
  orderStatus
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

    if (!ORDER_STATUS.includes(orderStatus)) {
    throw new ApiError(400, "Invalid order status");
  }

  // COD Payment Auto Paid
  if (
    orderStatus === "Delivered" &&
    order.paymentMethod === "COD"
  ) {
    order.paymentStatus = "Paid";
  }

  await order.save();

    const data = await Order.findById(order._id)
      .populate(
        "orderItems.product",
        "name image price slug brand"
      )
      .select("-__v -updatedAt");

    return data;

};

export const createRazorpayOrderService = async (orderId) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  const options = {
    amount: order.totalPrice * 100,
    currency: "INR",
    receipt: order._id.toString(),
  };

  const razorpayOrder = await razorpay.orders.create(options);

  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  return razorpayOrder;
};

// payment verify

export const verifyPaymentService = async (
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature
) => {
  const generatedSignature = crypto
    .createHmac(
      "sha256",
      process.env.RAZORPAY_KEY_SECRET
    )
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  if (generatedSignature !== razorpay_signature) {
    throw new ApiError(400, "Invalid payment signature");
  }

  const order = await Order.findOne({
    razorpayOrderId: razorpay_order_id,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  order.paymentStatus = "Paid";
  order.razorpayPaymentId = razorpay_payment_id;
  order.razorpaySignature = razorpay_signature;

  await order.save();

    const data = await Order.findById(order._id)
      .populate(
        "orderItems.product",
        "name image price slug brand"
      )
      .select("-__v -updatedAt");

      const obj = data.toObject();

      delete obj.razorpayOrderId;
      delete obj.razorpayPaymentId;
      delete obj.razorpaySignature;

      return obj;

};

//  cancel product

export const cancelOrderService = async (
  orderId,
  userId
) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.user.toString() !== userId.toString()) {
    throw new ApiError(403, "Access denied");
  }

  if (order.orderStatus === "Delivered") {
    throw new ApiError(
      400,
      "Delivered order can't be cancelled"
    );
  }

  order.orderStatus = "Cancelled";

  for (const item of order.orderItems) {
    const product = await Product.findById(item.product);

    if (product) {
      product.stock += item.quantity;
      await product.save();
    }
  }

  await order.save();

  const data = await Order.findById(order._id)
    .populate(
      "orderItems.product",
      "name image price slug brand"
    )
    .select("-__v -updatedAt");

  return data;

};