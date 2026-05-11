const Cart = require("../models/Cart");
const Order = require("../models/Order");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  findOrderByIdentifier,
  getStatusTransitionError,
} = require("../utils/order");
const { sendSuccess } = require("../utils/response");

const createOrder = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

  if (!cart || cart.items.length === 0) {
    throw new AppError(400, "Cart is empty");
  }

  for (const item of cart.items) {
    if (!item.product) {
      throw new AppError(400, "Cart contains an invalid product");
    }

    if (item.product.stock < item.quantity) {
      throw new AppError(
        400,
        `Insufficient stock for product: ${item.product.name}`
      );
    }
  }

  const items = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
  }));

  const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  for (const item of cart.items) {
    item.product.stock -= item.quantity;
    await item.product.save();
  }

  const order = await Order.create({
    user: req.user._id,
    items,
    totalAmount: Number(totalAmount.toFixed(2)),
  });

  cart.items = [];
  await cart.save();

  await order.populate("user", "name email role");
  await order.populate({
    path: "items.product",
    populate: { path: "category" },
  });

  return sendSuccess(res, 201, "Order created successfully", {
    order,
  });
});

const getOrders = asyncHandler(async (req, res) => {
  const filter = req.user.role === "admin" ? {} : { user: req.user._id };

  const orders = await Order.find(filter)
    .populate("user", "name email role")
    .populate({
      path: "items.product",
      populate: { path: "category" },
    })
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, "Orders fetched successfully", {
    orders,
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await findOrderByIdentifier(req.params.id)
    .populate("user", "name email role")
    .populate({
      path: "items.product",
      populate: { path: "category" },
    });

  if (!order) {
    throw new AppError(404, "Order not found");
  }

  const isOwner = order.user._id.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new AppError(403, "Forbidden: you cannot access this order");
  }

  return sendSuccess(res, 200, "Order fetched successfully", {
    order,
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await findOrderByIdentifier(req.params.id);
  if (!order) {
    throw new AppError(404, "Order not found");
  }

  const transitionError = getStatusTransitionError(order.status, req.body.status);
  if (transitionError) {
    throw new AppError(400, transitionError);
  }

  order.status = req.body.status;
  if (req.body.status === "delivered" && !order.deliveredAt) {
    order.deliveredAt = new Date();
  }

  await order.save();
  await order.populate("user", "name email role");
  await order.populate({
    path: "items.product",
    populate: { path: "category" },
  });

  return sendSuccess(res, 200, "Order status updated successfully", {
    order,
  });
});

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
