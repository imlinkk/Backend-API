const Cart = require("../../models/Cart");
const Product = require("../../models/Product");
const Review = require("../../models/Review");
const {
  buildPagination,
  buildProductFilters,
  findCategoryByIdentifier,
} = require("../../utils/product");
const { recalculateProductRating } = require("../../utils/review");
const {
  requireAdmin,
  requireAuth,
  validateArgs,
  objectIdSchema,
  productFilterArgSchema,
  z,
} = require("./helpers");
const { numericIdSchema } = require("../../validations/commonValidation");
const { throwGraphQLError } = require("../../utils/graphql");

const productIdArgsSchema = z.object({
  id: numericIdSchema,
});

const createProductArgsSchema = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10).max(2000),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  category: objectIdSchema.or(numericIdSchema),
  images: z.array(z.string().trim().url()).optional().default([]),
});

const updateProductArgsSchema = z
  .object({
    id: numericIdSchema,
    name: z.string().trim().min(2).max(150).optional(),
    description: z.string().trim().min(10).max(2000).optional(),
    price: z.number().min(0).optional(),
    stock: z.number().int().min(0).optional(),
    category: objectIdSchema.or(numericIdSchema).optional(),
    images: z.array(z.string().trim().url()).optional(),
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.description !== undefined ||
      data.price !== undefined ||
      data.stock !== undefined ||
      data.category !== undefined ||
      data.images !== undefined,
    {
      message: "At least one field is required",
    }
  );

const createReviewArgsSchema = z.object({
  productId: numericIdSchema,
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000),
});

const productReviewsArgsSchema = z.object({
  productId: numericIdSchema,
});

const productResolvers = {
  Query: {
    products: async (parent, args) => {
      const data = validateArgs(productFilterArgSchema, args);
      const filter = await buildProductFilters(data.filter);
      const { page, limit, skip } = buildPagination(data.pagination);

      const [items, totalItems] = await Promise.all([
        Product.find(filter)
          .populate("category")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Product.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(totalItems / limit) || 1;

      return {
        items,
        totalItems,
        totalPages,
        currentPage: page,
        pageSize: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      };
    },
    product: async (parent, args) => {
      const { id } = validateArgs(productIdArgsSchema, args);
      const product = await Product.findOne({ shortId: id }).populate("category");

      if (!product) {
        throwGraphQLError("Product not found", "NOT_FOUND", 404);
      }

      return product;
    },
    productReviews: async (parent, args) => {
      const { productId } = validateArgs(productReviewsArgsSchema, args);
      const product = await Product.findOne({ shortId: productId });

      if (!product) {
        throwGraphQLError("Product not found", "NOT_FOUND", 404);
      }

      return Review.find({ product: product._id })
        .populate("user", "name email role")
        .populate({
          path: "product",
          populate: { path: "category" },
        })
        .sort({ createdAt: -1 });
    },
  },
  Mutation: {
    createProduct: async (parent, args, context) => {
      requireAdmin(context);
      const data = validateArgs(createProductArgsSchema, args);

      const category = await findCategoryByIdentifier(data.category);
      if (!category) {
        throwGraphQLError("Category not found", "NOT_FOUND", 404);
      }

      const product = await Product.create({
        ...data,
        category: category._id,
      });
      await product.populate("category");
      return product;
    },
    updateProduct: async (parent, args, context) => {
      requireAdmin(context);
      const data = validateArgs(updateProductArgsSchema, args);

      const product = await Product.findOne({ shortId: data.id });
      if (!product) {
        throwGraphQLError("Product not found", "NOT_FOUND", 404);
      }

      const updateData = {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.price !== undefined ? { price: data.price } : {}),
        ...(data.stock !== undefined ? { stock: data.stock } : {}),
        ...(data.images !== undefined ? { images: data.images } : {}),
      };

      if (data.category !== undefined) {
        const category = await findCategoryByIdentifier(data.category);
        if (!category) {
          throwGraphQLError("Category not found", "NOT_FOUND", 404);
        }
        updateData.category = category._id;
      }

      Object.assign(product, updateData);

      await product.save();
      await product.populate("category");
      return product;
    },
    deleteProduct: async (parent, args, context) => {
      requireAdmin(context);
      const { id } = validateArgs(productIdArgsSchema, args);

      const product = await Product.findOne({ shortId: id });
      if (!product) {
        throwGraphQLError("Product not found", "NOT_FOUND", 404);
      }

      await Promise.all([
        Cart.updateMany({}, { $pull: { items: { product: product._id } } }),
        Review.deleteMany({ product: product._id }),
        product.deleteOne(),
      ]);
      return true;
    },
    createReview: async (parent, args, context) => {
      const user = requireAuth(context);
      const data = validateArgs(createReviewArgsSchema, args);

      const product = await Product.findOne({ shortId: data.productId });
      if (!product) {
        throwGraphQLError("Product not found", "NOT_FOUND", 404);
      }

      const existingReview = await Review.findOne({
        user: user._id,
        product: product._id,
      });

      if (existingReview) {
        throwGraphQLError(
          "You have already reviewed this product",
          "CONFLICT",
          409
        );
      }

      const review = await Review.create({
        user: user._id,
        product: product._id,
        rating: data.rating,
        comment: data.comment,
      });

      await recalculateProductRating(product._id);
      await review.populate("user", "name email role");
      await review.populate({
        path: "product",
        populate: { path: "category" },
      });

      return review;
    },
  },
  Product: {
    id: (product) => product.shortId,
  },
};

module.exports = productResolvers;
