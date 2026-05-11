const Cart = require("../models/Cart");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { calculateCartTotals } = require("../utils/cart");
const { sendSuccess } = require("../utils/response");

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate({
    path: "items.product",
    populate: {
      path: "category",
    },
  });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findById(cart._id).populate({
      path: "items.product",
      populate: {
        path: "category",
      },
    });
  }

  return cart;
};

const serializeCart = (cart) => ({
  ...cart.toObject(),
  ...calculateCartTotals(cart),
});

const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);

  return sendSuccess(res, 200, "Cart fetched successfully", {
    cart: serializeCart(cart),
  });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const pid = /^\d+$/.test(String(productId)) ? Number(productId) : productId;
  const product = typeof pid === "number" ? await Product.findOne({ shortId: pid }) : await Product.findById(pid);

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  if (product.stock < quantity) {
    throw new AppError(400, "Requested quantity exceeds available stock");
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((item) => item.product._id.equals(product._id) || item.product.shortId === product.shortId);

  if (existingItem) {
    const nextQuantity = existingItem.quantity + quantity;
    if (nextQuantity > product.stock) {
      throw new AppError(400, "Requested quantity exceeds available stock");
    }
    existingItem.quantity = nextQuantity;
    existingItem.price = product.price;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      price: product.price,
    });
  }

  await cart.save();
  const populatedCart = await getOrCreateCart(req.user._id);

  return sendSuccess(res, 200, "Cart updated successfully", {
    cart: serializeCart(populatedCart),
  });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  const pid = /^\d+$/.test(String(productId)) ? Number(productId) : productId;
  const product = typeof pid === "number" ? await Product.findOne({ shortId: pid }) : await Product.findById(pid);

  if (!product) {
    throw new AppError(404, "Product not found");
  }

  if (product.stock < quantity) {
    throw new AppError(400, "Requested quantity exceeds available stock");
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((item) => item.product._id.equals(product._id) || item.product.shortId === product.shortId);

  if (!existingItem) {
    throw new AppError(404, "Cart item not found");
  }

  existingItem.quantity = quantity;
  existingItem.price = product.price;

  await cart.save();
  const populatedCart = await getOrCreateCart(req.user._id);

  return sendSuccess(res, 200, "Cart item updated successfully", {
    cart: serializeCart(populatedCart),
  });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const initialLength = cart.items.length;

  const paramPid = /^\d+$/.test(req.params.productId) ? Number(req.params.productId) : req.params.productId;
  cart.items = cart.items.filter((item) => {
    if (typeof paramPid === "number") return item.product.shortId !== paramPid;
    return item.product._id.toString() !== paramPid;
  });

  if (cart.items.length === initialLength) {
    throw new AppError(404, "Cart item not found");
  }

  await cart.save();
  const populatedCart = await getOrCreateCart(req.user._id);

  return sendSuccess(res, 200, "Cart item removed successfully", {
    cart: serializeCart(populatedCart),
  });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();

  return sendSuccess(res, 200, "Cart cleared successfully", {
    cart: serializeCart(cart),
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  getOrCreateCart,
  serializeCart,
};
