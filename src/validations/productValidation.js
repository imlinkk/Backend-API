const { z, objectIdSchema, paginationQuerySchema } = require("./commonValidation");

const productBody = z.object({
  name: z.string().trim().min(2).max(150),
  description: z.string().trim().min(10).max(2000),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  category: objectIdSchema,
  images: z.array(z.string().trim().url()).optional().default([]),
});

const createProductSchema = z.object({
  body: productBody,
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const updateProductSchema = z.object({
  body: productBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  }),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}).default({}),
});

const productIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}).default({}),
});

const productQuerySchema = z.object({
  body: z.object({}).default({}),
  params: z.object({}).default({}),
  query: paginationQuerySchema.extend({
    category: objectIdSchema.optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    search: z.string().trim().optional(),
  }),
});

const createReviewSchema = z.object({
  body: z.object({
    rating: z.coerce.number().int().min(1).max(5),
    comment: z.string().trim().min(3).max(1000),
  }),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}).default({}),
});

module.exports = {
  createProductSchema,
  updateProductSchema,
  productIdSchema,
  productQuerySchema,
  createReviewSchema,
};
