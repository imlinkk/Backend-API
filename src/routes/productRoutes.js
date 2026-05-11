const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
  getProductReviews,
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productQuerySchema,
  createReviewSchema,
} = require("../validations/productValidation");

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Get products with filtering and pagination
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           oneOf:
 *             - type: integer
 *             - type: string
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product list
 *   post:
 *     tags: [Products]
 *     summary: Create a product (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price, stock, category]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               category:
 *                 oneOf:
 *                   - type: integer
 *                   - type: string
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Product created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/", validate(productQuerySchema), getProducts);
router.post("/", protect, adminOnly, validate(createProductSchema), createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get a product by id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric product id is preferred, for example 1.
 *         schema:
 *           oneOf:
 *             - type: integer
 *               example: 1
 *             - type: string
 *               example: "6658ca5ffbd0af6d9bf2f111"
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 *   put:
 *     tags: [Products]
 *     summary: Update a product (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric product id is preferred, for example 1.
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
 *     responses:
 *       200:
 *         description: Product updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric product id is preferred, for example 1.
 *         schema:
 *           oneOf:
 *             - type: integer
 *               example: 1
 *             - type: string
 *               example: "6658ca5ffbd0af6d9bf2f111"
 *     responses:
 *       200:
 *         description: Product deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/:id", validate(productIdSchema), getProductById);
router.put("/:id", protect, adminOnly, validate(updateProductSchema), updateProduct);
router.delete("/:id", protect, adminOnly, validate(productIdSchema), deleteProduct);

/**
 * @swagger
 * /api/products/{id}/reviews:
 *   get:
 *     tags: [Reviews]
 *     summary: Get reviews for a product
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric product id is preferred, for example 1.
 *         schema:
 *           oneOf:
 *             - type: integer
 *               example: 1
 *             - type: string
 *               example: "6658ca5ffbd0af6d9bf2f111"
 *     responses:
 *       200:
 *         description: Reviews fetched
 *   post:
 *     tags: [Reviews]
 *     summary: Create a review for a product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric product id is preferred, for example 1.
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
 *             required: [rating, comment]
 *             properties:
 *               rating:
 *                 type: integer
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review created
 */
router.get("/:id/reviews", validate(productIdSchema), getProductReviews);
router.post("/:id/reviews", protect, validate(createReviewSchema), createReview);

module.exports = router;
