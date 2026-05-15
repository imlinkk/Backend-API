const express = require("express");
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const validate = require("../middlewares/validateMiddleware");
const {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
} = require("../validations/categoryValidation");

const router = express.Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     responses:
 *       200:
 *         description: Category list
 *   post:
 *     tags: [Categories]
 *     summary: Create a category (admin)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *             example:
 *               name: "Phu kien"
 *               description: "Phu kien va trang suc"
 *     responses:
 *       201:
 *         description: Category created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get("/", getCategories);
router.post("/", protect, adminOnly, validate(createCategorySchema), createCategory);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update a category (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric category id is preferred, for example 1.
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
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *             example:
 *               name: "Phu kien thoi trang"
 *               description: "Phu kien, trang suc va qua tang"
 *     responses:
 *       200:
 *         description: Category updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *   delete:
 *     tags: [Categories]
 *     summary: Delete a category (admin)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Numeric category id is preferred, for example 1.
 *         schema:
 *           oneOf:
 *             - type: integer
 *               example: 1
 *             - type: string
 *               example: "6658ca5ffbd0af6d9bf2f111"
 *     responses:
 *       200:
 *         description: Category deleted
 *       400:
 *         description: Cannot delete category with products
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.put("/:id", protect, adminOnly, validate(updateCategorySchema), updateCategory);
router.delete("/:id", protect, adminOnly, validate(categoryIdSchema), deleteCategory);

module.exports = router;
