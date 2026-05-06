const { z, objectIdSchema } = require("./commonValidation");

const orderIdSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}).default({}),
});

const updateOrderStatusSchema = z.object({
  body: z.object({
    status: z.enum(["pending", "processing", "shipped", "delivered"]),
  }),
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({}).default({}),
});

module.exports = {
  orderIdSchema,
  updateOrderStatusSchema,
};
