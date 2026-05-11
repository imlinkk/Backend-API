const { z, objectIdSchema, numericIdSchema } = require("./commonValidation");

const categoryBody = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).optional().default(""),
});

const createCategorySchema = z.object({
  body: categoryBody,
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const updateCategorySchema = z.object({
  body: categoryBody.partial().refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  }),
  params: z.object({
    id: objectIdSchema.or(numericIdSchema),
  }),
  query: z.object({}).default({}),
});

const categoryIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: objectIdSchema.or(numericIdSchema),
  }),
  query: z.object({}).default({}),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  categoryIdSchema,
};
