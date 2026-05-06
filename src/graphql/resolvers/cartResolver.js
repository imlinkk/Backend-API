const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const { calculateCartTotals } = require("../../utils/cart");
const { requireAuth, validateArgs, objectIdSchema, z } = require("./helpers");
const { throwGraphQLError } = require("../../utils/graphql");

const cartItemArgsSchema = z.object({
  productId: objectIdSchema,
  quantity: z.number().int().min(1),
});

const cartIdArgsSchema = z.object({
  productId: objectIdSchema,
});

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId })
    .populate("user", "name email role")
    .populate({
      path: "items.product",
      populate: {
        path: "category",
      },
    });

  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await Cart.findById(cart._id)
      .populate("user", "name email role")
      .populate({
        path: "items.product",
        populate: {
          path: "category",
        },
      });
  }

  return cart;
};

const cartResolvers = {
  Query: {
    cart: async (parent, args, context) => {
      const user = requireAuth(context);
      return getOrCreateCart(user._id);
    },
  },
  Mutation: {
    addToCart: async (parent, args, context) => {
      const user = requireAuth(context);
      const data = validateArgs(cartItemArgsSchema, args);
      const product = await Product.findById(data.productId);

      if (!product) {
        throwGraphQLError("Product not found", "NOT_FOUND", 404);
      }

      const cart = await getOrCreateCart(user._id);
      const existingItem = cart.items.find(
        (item) => item.product._id.toString() === data.productId
      );

      const nextQuantity = existingItem
        ? existingItem.quantity + data.quantity
        : data.quantity;

      if (nextQuantity > product.stock) {
        throwGraphQLError(
          "Requested quantity exceeds available stock",
          "BAD_USER_INPUT",
          400
        );
      }

      if (existingItem) {
        existingItem.quantity = nextQuantity;
        existingItem.price = product.price;
      } else {
        cart.items.push({
          product: product._id,
          quantity: data.quantity,
          price: product.price,
        });
      }

      await cart.save();
      return getOrCreateCart(user._id);
    },
    updateCartItem: async (parent, args, context) => {
      const user = requireAuth(context);
      const data = validateArgs(cartItemArgsSchema, args);
      const product = await Product.findById(data.productId);

      if (!product) {
        throwGraphQLError("Product not found", "NOT_FOUND", 404);
      }

      if (data.quantity > product.stock) {
        throwGraphQLError(
          "Requested quantity exceeds available stock",
          "BAD_USER_INPUT",
          400
        );
      }

      const cart = await getOrCreateCart(user._id);
      const existingItem = cart.items.find(
        (item) => item.product._id.toString() === data.productId
      );

      if (!existingItem) {
        throwGraphQLError("Cart item not found", "NOT_FOUND", 404);
      }

      existingItem.quantity = data.quantity;
      existingItem.price = product.price;
      await cart.save();

      return getOrCreateCart(user._id);
    },
    removeFromCart: async (parent, args, context) => {
      const user = requireAuth(context);
      const { productId } = validateArgs(cartIdArgsSchema, args);

      const cart = await getOrCreateCart(user._id);
      const initialLength = cart.items.length;
      cart.items = cart.items.filter(
        (item) => item.product._id.toString() !== productId
      );

      if (cart.items.length === initialLength) {
        throwGraphQLError("Cart item not found", "NOT_FOUND", 404);
      }

      await cart.save();
      return getOrCreateCart(user._id);
    },
    clearCart: async (parent, args, context) => {
      const user = requireAuth(context);
      const cart = await getOrCreateCart(user._id);
      cart.items = [];
      await cart.save();
      return getOrCreateCart(user._id);
    },
  },
  Cart: {
    totalItems: (cart) => calculateCartTotals(cart).totalItems,
    totalAmount: (cart) => calculateCartTotals(cart).totalAmount,
  },
  CartItem: {
    subtotal: (item) => Number((item.price * item.quantity).toFixed(2)),
  },
};

module.exports = cartResolvers;
