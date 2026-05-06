const productTypeDefs = `#graphql
  extend type Query {
    products(filter: ProductFilterInput, pagination: PaginationInput): ProductPage!
    product(id: ID!): Product!
    productReviews(productId: ID!): [Review!]!
  }

  extend type Mutation {
    createProduct(
      name: String!
      description: String!
      price: Float!
      stock: Int!
      category: ID!
      images: [String!]
    ): Product!
    updateProduct(
      id: ID!
      name: String
      description: String
      price: Float
      stock: Int
      category: ID
      images: [String!]
    ): Product!
    deleteProduct(id: ID!): Boolean!
    createReview(productId: ID!, rating: Int!, comment: String!): Review!
  }
`;

module.exports = productTypeDefs;
