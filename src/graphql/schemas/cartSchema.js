const cartTypeDefs = `#graphql
  extend type Query {
    cart: Cart!
  }

  extend type Mutation {
    addToCart(productId: ID!, quantity: Int!): Cart!
    updateCartItem(productId: ID!, quantity: Int!): Cart!
    removeFromCart(productId: ID!): Cart!
    clearCart: Cart!
  }
`;

module.exports = cartTypeDefs;
