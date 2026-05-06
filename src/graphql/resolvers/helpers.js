const User = require("../../models/User");
const { verifyToken } = require("../../config/jwt");
const { throwGraphQLError } = require("../../utils/graphql");
const { z, objectIdSchema, paginationQuerySchema } = require("../../validations/commonValidation");

const requireAuth = (context) => {
  if (!context.user) {
    throwGraphQLError("Authentication required", "UNAUTHENTICATED", 401);
  }

  return context.user;
};

const requireAdmin = (context) => {
  const user = requireAuth(context);
  if (user.role !== "admin") {
    throwGraphQLError("Admin access required", "FORBIDDEN", 403);
  }

  return user;
};

const validateArgs = (schema, args) => {
  const result = schema.safeParse(args);
  if (!result.success) {
    throwGraphQLError(
      "Validation failed",
      "BAD_USER_INPUT",
      400,
      result.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }))
    );
  }

  return result.data;
};

const buildGraphQLContext = async ({ req }) => {
  const authHeader = req.headers.authorization || "";

  if (!authHeader.startsWith("Bearer ")) {
    return { req, user: null };
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");

    return { req, user };
  } catch (error) {
    return { req, user: null };
  }
};

const idArgSchema = z.object({
  id: objectIdSchema,
});

const productFilterArgSchema = z.object({
  filter: z
    .object({
      category: objectIdSchema.optional(),
      minPrice: z.number().min(0).optional(),
      maxPrice: z.number().min(0).optional(),
      search: z.string().trim().optional(),
    })
    .optional()
    .default({}),
  pagination: z
    .object({
      page: paginationQuerySchema.shape.page.optional().default(1),
      limit: paginationQuerySchema.shape.limit.optional().default(10),
    })
    .optional()
    .default({}),
});

module.exports = {
  requireAuth,
  requireAdmin,
  validateArgs,
  buildGraphQLContext,
  idArgSchema,
  objectIdSchema,
  productFilterArgSchema,
  z,
};
