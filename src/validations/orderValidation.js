const { z, objectIdSchema, numericIdSchema } = require("./commonValidation");

const orderIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: objectIdSchema.or(numericIdSchema),
  }),
  query: z.object({}).default({}),
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "processing", "shipped", "delivered"]),
  }),
  params: z.object({
    id: objectIdSchema.or(numericIdSchema),
  }),
  query: z.object({}).default({}),
});

module.exports = {
  orderIdSchema,
  updateOrderStatusSchema,
};
