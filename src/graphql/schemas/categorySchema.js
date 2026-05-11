const categoryTypeDefs = `#graphql
  extend type Query {
    categories: [Category!]!
  }

  extend type Mutation {
    createCategory(name: String!, description: String): Category!
    updateCategory(id: Int!, name: String, description: String): Category!
    deleteCategory(id: Int!): Boolean!
  }
`;

module.exports = categoryTypeDefs;
