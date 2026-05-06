const Cart = require("../models/Cart");
const Category = require("../models/Category");
const Product = require("../models/Product");
const Review = require("../models/Review");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { buildPagination, buildProductFilters } = require("../utils/product");
const { recalculateProductRating } = require("../utils/review");
const { sendSuccess } = require("../utils/response");

const getProducts = asyncHandler(async (req, res) => {
  const filter = buildProductFilters(req.query);
  const { page, limit, skip } = buildPagination(req.query);

  const [products, totalItems] = await Promise.all([
    Product.find(filter)
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  return sendSuccess(
    res,
    200,
    "Products fetched successfully",
    { products },
    {
      totalItems,
      totalPages,
      currentPage: page,
      pageSize: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    }
  );
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  return sendSuccess(res, 200, "Product fetched successfully", {
    product,
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category) {
    throw new AppError(404, "Category not found");
  }

  const product = await Product.create(req.body);
  await product.populate("category");

  return sendSuccess(res, 201, "Product created successfully", {
    product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  if (req.body.category) {
    const category = await Category.findById(req.body.category);
    if (!category) {
      throw new AppError(404, "Category not found");
    }
  }

  Object.assign(product, req.body);
  await product.save();
  await product.populate("category");

  return sendSuccess(res, 200, "Product updated successfully", {
    product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  await Promise.all([
    Cart.updateMany({}, { $pull: { items: { product: product._id } } }),
    Review.deleteMany({ product: product._id }),
    product.deleteOne(),
  ]);

  return sendSuccess(res, 200, "Product deleted successfully");
});

const createReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  const existingReview = await Review.findOne({
    user: req.user._id,
    product: req.params.id,
  });

  if (existingReview) {
    throw new AppError(409, "You have already reviewed this product");
  }

  const review = await Review.create({
    user: req.user._id,
    product: req.params.id,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  await recalculateProductRating(req.params.id);
  await review.populate("user", "name email role");

  return sendSuccess(res, 201, "Review created successfully", {
    review,
  });
});

const getProductReviews = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  const reviews = await Review.find({ product: req.params.id })
    .populate("user", "name email role")
    .sort({ createdAt: -1 });

  return sendSuccess(res, 200, "Reviews fetched successfully", {
    reviews,
  });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
  getProductReviews,
};
