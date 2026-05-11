const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const {
  orderIdSchema,
  updateOrderStatusSchema,
} = require("../validations/orderValidation");

const router = express.Router();

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders for current user, or all orders for admin
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Orders fetched
 *   post:
 *     tags: [Orders]
 *     summary: Create an order from the current user's cart
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order created
 */
router.get("/", protect, getOrders);
router.post("/", protect, createOrder);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get an order by id
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric order id is preferred, for example 1.
 *         schema:
 *           oneOf:
 *             - type: integer
 *               example: 1
 *             - type: string
 *               example: "6658ca5ffbd0af6d9bf2f111"
 *     responses:
 *       200:
 *         description: Order fetched
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
router.get("/:id", protect, validate(orderIdSchema), getOrderById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Update order status (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric order id is preferred, for example 1.
 *         schema:
 *           oneOf:
 *             - type: integer
 *               example: 1
 *             - type: string
 *               example: "6658ca5ffbd0af6d9bf2f111"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, processing, shipped, delivered]
 *     responses:
 *       200:
 *         description: Order status updated
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
router.put(
  "/:id/status",
  protect,
  adminOnly,
  validate(updateOrderStatusSchema),
  updateOrderStatus
);

module.exports = router;
