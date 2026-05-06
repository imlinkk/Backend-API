const categoryTypeDefs = `#graphql
  extend type Query {
    categories: [Category!]!
  }

  extend type Mutation {
    createCategory(name: String!, description: String): Category!
    updateCategory(id: ID!, name: String, description: String): Category!
    deleteCategory(id: ID!): Boolean!
  }
`;

module.exports = categoryTypeDefs;
