const Category = require("../../models/Category");
const Product = require("../../models/Product");
const { requireAdmin, validateArgs, idArgSchema, z } = require("./helpers");
const { throwGraphQLError } = require("../../utils/graphql");

const createCategoryArgsSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).optional().default(""),
});

const updateCategoryArgsSchema = z
  .object({
    id: idArgSchema.shape.id,
    name: z.string().trim().min(2).max(100).optional(),
    description: z.string().trim().max(300).optional(),
  })
  .refine((data) => data.name !== undefined || data.description !== undefined, {
    message: "At least one field is required",
  });

const categoryResolvers = {
  Query: {
    categories: async () => Category.find().sort({ name: 1 }),
  },
  Mutation: {
    createCategory: async (parent, args, context) => {
      requireAdmin(context);
      const data = validateArgs(createCategoryArgsSchema, args);

      const existingCategory = await Category.findOne({ name: data.name });
      if (existingCategory) {
        throwGraphQLError("Category already exists", "CONFLICT", 409);
      }

      return Category.create(data);
    },
    updateCategory: async (parent, args, context) => {
      requireAdmin(context);
      const data = validateArgs(updateCategoryArgsSchema, args);

      const category = await Category.findById(data.id);
      if (!category) {
        throwGraphQLError("Category not found", "NOT_FOUND", 404);
      }

      if (data.name && data.name !== category.name) {
        const existingCategory = await Category.findOne({ name: data.name });
        if (existingCategory) {
          throwGraphQLError("Category already exists", "CONFLICT", 409);
        }
      }

      Object.assign(category, {
        ...(data.name !== undefined ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
      });

      await category.save();
      return category;
    },
    deleteCategory: async (parent, args, context) => {
      requireAdmin(context);
      const { id } = validateArgs(idArgSchema, args);

      const category = await Category.findById(id);
      if (!category) {
        throwGraphQLError("Category not found", "NOT_FOUND", 404);
      }

      const productCount = await Product.countDocuments({ category: id });
      if (productCount > 0) {
        throwGraphQLError(
          "Cannot delete category with existing products",
          "BAD_USER_INPUT",
          400
        );
      }

      await category.deleteOne();
      return true;
    },
  },
};

module.exports = categoryResolvers;
