const Cart = require("../../models/Cart");
const Order = require("../../models/Order");
const {
  requireAdmin,
  requireAuth,
  validateArgs,
  objectIdSchema,
  numericIdSchema,
  z,
} = require("./helpers");
const { throwGraphQLError } = require("../../utils/graphql");
const {
  findOrderByIdentifier,
  getStatusTransitionError,
} = require("../../utils/order");

const orderIdArgsSchema = z.object({
  id: objectIdSchema.or(numericIdSchema),
});

const updateStatusArgsSchema = z.object({
  id: objectIdSchema.or(numericIdSchema),
  status: z.enum(["pending", "processing", "shipped", "delivered"]),
});

const orderResolvers = {
  Query: {
    orders: async (parent, args, context) => {
      const user = requireAuth(context);
      const filter = user.role === "admin" ? {} : { user: user._id };

      return Order.find(filter)
        .populate("user", "name email role")
        .populate({
          path: "items.product",
          populate: { path: "category" },
        })
        .sort({ createdAt: -1 });
    },
    order: async (parent, args, context) => {
      const user = requireAuth(context);
      const { id } = validateArgs(orderIdArgsSchema, args);

      const order = await findOrderByIdentifier(id)
        .populate("user", "name email role")
        .populate({
          path: "items.product",
          populate: { path: "category" },
        });

      if (!order) {
        throwGraphQLError("Order not found", "NOT_FOUND", 404);
      }

      if (user.role !== "admin" && order.user._id.toString() !== user._id.toString()) {
        throwGraphQLError("Forbidden: you cannot access this order", "FORBIDDEN", 403);
      }

      return order;
    },
  },
  Mutation: {
    createOrder: async (parent, args, context) => {
      const user = requireAuth(context);
      const cart = await Cart.findOne({ user: user._id }).populate("items.product");

      if (!cart || cart.items.length === 0) {
        throwGraphQLError("Cart is empty", "BAD_USER_INPUT", 400);
      }

      for (const item of cart.items) {
        if (!item.product) {
          throwGraphQLError("Cart contains an invalid product", "BAD_USER_INPUT", 400);
        }

        if (item.product.stock < item.quantity) {
          throwGraphQLError(
            `Insufficient stock for product: ${item.product.name}`,
            "BAD_USER_INPUT",
            400
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
        user: user._id,
        items,
        totalAmount: Number(totalAmount.toFixed(2)),
      });

      cart.items = [];
      await cart.save();

      return Order.findById(order._id)
        .populate("user", "name email role")
        .populate({
          path: "items.product",
          populate: { path: "category" },
        });
    },
    updateOrderStatus: async (parent, args, context) => {
      requireAdmin(context);
      const data = validateArgs(updateStatusArgsSchema, args);

      const order = await findOrderByIdentifier(data.id);
      if (!order) {
        throwGraphQLError("Order not found", "NOT_FOUND", 404);
      }

      const transitionError = getStatusTransitionError(order.status, data.status);
      if (transitionError) {
        throwGraphQLError(transitionError, "BAD_USER_INPUT", 400);
      }

      order.status = data.status;
      if (data.status === "delivered" && !order.deliveredAt) {
        order.deliveredAt = new Date();
      }

      await order.save();

      return Order.findById(order._id)
        .populate("user", "name email role")
        .populate({
          path: "items.product",
          populate: { path: "category" },
        });
    },
  },
  Order: {
    id: (order) => order.shortId || order._id.toString(),
  },
  OrderItem: {
    subtotal: (item) => Number((item.price * item.quantity).toFixed(2)),
  },
};

module.exports = orderResolvers;
