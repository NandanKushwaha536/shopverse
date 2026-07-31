import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  placeOrderService,
  getMyOrdersService,
  getSingleOrderService,
  getAllOrdersService,
  updateOrderStatusService,
  createRazorpayOrderService,
  verifyPaymentService,
  cancelOrderService,
} from "../services/order.service.js";
import { sendResponse } from "../utils/sendResponse.js";
import { ORDER_MESSAGES } from "../constants/messages.js";

// Place Order
export const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const order = await placeOrderService(
    req.user._id,
    shippingAddress,
    paymentMethod
  );

  return sendResponse(
      res,
      201,
      order,
      ORDER_MESSAGES.CREATED
    );
});

// Get My Orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await getMyOrdersService(req.user._id);

  return sendResponse(
    res,
    200,
    orders,
    ORDER_MESSAGES.ORDERS_FETCHED
  );
});

// Get Single Order
export const getSingleOrder = asyncHandler(async (req, res) => {
  const order = await getSingleOrderService(
    req.params.orderId,
    req.user._id,
    req.user.role
  );

   return sendResponse(
      res,
      200,
      order,
      ORDER_MESSAGES.FETCHED
    );
});

// Admin - Get All Orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const data = await getAllOrdersService();

   return sendResponse(
      res,
      200,
      order,
      ORDER_MESSAGES.ALLORDER
    );
});
// Admin - Update Order Status
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await updateOrderStatusService(
    req.params.orderId,
    req.body.orderStatus
  );

   return sendResponse(
      res,
      200,
      order,
      ORDER_MESSAGES. UPDATED
    );
});

export const createRazorpayOrder = asyncHandler(async (req, res) => {
  const razorpayOrder = await createRazorpayOrderService(
    req.params.orderId
  );

  return sendResponse(
    res,
    200,
    razorpayOrder,
    ORDER_MESSAGES.RAZORPAY_ORDER_CREATED
  );
});


export const verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const order = await verifyPaymentService(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );

   return sendResponse(
      res,
       200,
      order,
      ORDER_MESSAGES.RAZORPAY_ORDER_VERIFIED
    );
});


export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await cancelOrderService(
    req.params.orderId,
    req.user._id
  );

   return sendResponse(
      res,
      200,
      order,
      ORDER_MESSAGES.CANCELLED
    );
});