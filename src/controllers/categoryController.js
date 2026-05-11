const Category = require("../models/Category");
const Product = require("../models/Product");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { sendSuccess } = require("../utils/response");

const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });

  return sendSuccess(res, 200, "Categories fetched successfully", {
    categories,
  });
});

const createCategory = asyncHandler(async (req, res) => {
  const existingCategory = await Category.findOne({ name: req.body.name });
  if (existingCategory) {
    throw new AppError(409, "Category already exists");
  }

  const category = await Category.create(req.body);

  return sendSuccess(res, 201, "Category created successfully", {
    category,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const id = /^\d+$/.test(req.params.id) ? Number(req.params.id) : req.params.id;
  const category = typeof id === "number" ? await Category.findOne({ shortId: id }) : await Category.findById(id);
  if (!category) {
    throw new AppError(404, "Category not found");
  }

  if (req.body.name && req.body.name !== category.name) {
    const existingCategory = await Category.findOne({ name: req.body.name });
    if (existingCategory) {
      throw new AppError(409, "Category already exists");
    }
    category.name = req.body.name;
  }

  if (req.body.description !== undefined) {
    category.description = req.body.description;
  }

  await category.save();

  return sendSuccess(res, 200, "Category updated successfully", {
    category,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const id = /^\d+$/.test(req.params.id) ? Number(req.params.id) : req.params.id;
  const category = typeof id === "number" ? await Category.findOne({ shortId: id }) : await Category.findById(id);
  if (!category) {
    throw new AppError(404, "Category not found");
  }

  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    throw new AppError(400, "Cannot delete category with existing products");
  }

  await category.deleteOne();

  return sendSuccess(res, 200, "Category deleted successfully");
});

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
