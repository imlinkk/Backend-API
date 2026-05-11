const { z, objectIdSchema, numericIdSchema } = require("./commonValidation");

const cartItemBody = z.object({
  productId: objectIdSchema.or(numericIdSchema),
  quantity: z.coerce.number().int().min(1),
});

const addToCartSchema = z.object({
  body: cartItemBody,
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const updateCartSchema = z.object({
  body: cartItemBody,
  params: z.object({}).default({}),
  query: z.object({}).default({}),
});

const removeCartItemSchema = z.object({
  body: z.object({}).default({}),
  params: z.object({
    productId: objectIdSchema.or(numericIdSchema),
  }),
  query: z.object({}).default({}),
});

module.exports = {
  addToCartSchema,
  updateCartSchema,
  removeCartItemSchema,
};
