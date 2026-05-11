const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Review = require("../models/Review");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const {
  buildPagination,
  buildProductFilters,
  findCategoryByIdentifier,
} = require("../utils/product");
const { recalculateProductRating } = require("../utils/review");
const { sendSuccess } = require("../utils/response");

const findProductByIdentifier = (id) => {
  const stringId = String(id);
  const productId =
    typeof id === "number" || (!/^[0-9a-fA-F]{24}$/.test(stringId) && /^\d+$/.test(stringId))
      ? Number(id)
      : id;

  return typeof productId === "number"
    ? Product.findOne({ shortId: productId })
    : Product.findById(productId);
};

const getProducts = asyncHandler(async (req, res) => {
  const filter = await buildProductFilters(req.query);
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
  const product = await findProductByIdentifier(req.params.id).populate("category");
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  return sendSuccess(res, 200, "Product fetched successfully", {
    product,
  });
});

const createProduct = asyncHandler(async (req, res) => {
  const category = await findCategoryByIdentifier(req.body.category);
  if (!category) {
    throw new AppError(404, "Category not found");
  }

  const product = await Product.create({
    ...req.body,
    category: category._id,
  });
  await product.populate("category");

  return sendSuccess(res, 201, "Product created successfully", {
    product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await findProductByIdentifier(req.params.id);
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  const updateData = { ...req.body };

  if (req.body.category !== undefined) {
    const category = await findCategoryByIdentifier(req.body.category);
    if (!category) {
      throw new AppError(404, "Category not found");
    }
    updateData.category = category._id;
  }

  Object.assign(product, updateData);
  await product.save();
  await product.populate("category");

  return sendSuccess(res, 200, "Product updated successfully", {
    product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await findProductByIdentifier(req.params.id);
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
  const product = await findProductByIdentifier(req.params.id);
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  const existingReview = await Review.findOne({
    user: req.user._id,
    product: product._id,
  });

  if (existingReview) {
    throw new AppError(409, "You have already reviewed this product");
  }

  const review = await Review.create({
    user: req.user._id,
    product: product._id,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  await recalculateProductRating(product._id);
  await review.populate("user", "name email role");

  return sendSuccess(res, 201, "Review created successfully", {
    review,
  });
});

const getProductReviews = asyncHandler(async (req, res) => {
  const product = await findProductByIdentifier(req.params.id);
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  const reviews = await Review.find({ product: product._id })
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
