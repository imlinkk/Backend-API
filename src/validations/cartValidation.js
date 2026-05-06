const { z, objectIdSchema } = require("./commonValidation");

const cartItemBody = z.object({
  productId: objectIdSchema,
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
    productId: objectIdSchema,
  }),
  query: z.object({}).default({}),
});

module.exports = {
  addToCartSchema,
  updateCartSchema,
  removeCartItemSchema,
};
