const productTypeDefs = `#graphql
  extend type Query {
    products(filter: ProductFilterInput, pagination: PaginationInput): ProductPage!
    product(id: Int!): Product!
    productReviews(productId: Int!): [Review!]!
  }

  extend type Mutation {
    createProduct(
      name: String!
      description: String!
      price: Float!
      stock: Int!
      category: Int!
      images: [String!]
    ): Product!
    updateProduct(
      id: Int!
      name: String
      description: String
      price: Float
      stock: Int
      category: Int
      images: [String!]
    ): Product!
    deleteProduct(id: Int!): Boolean!
    createReview(productId: Int!, rating: Int!, comment: String!): Review!
  }
`;

module.exports = productTypeDefs;
