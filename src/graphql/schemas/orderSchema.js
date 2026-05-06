const orderTypeDefs = `#graphql
  extend type Query {
    orders: [Order!]!
    order(id: ID!): Order!
  }

  extend type Mutation {
    createOrder: Order!
    updateOrderStatus(id: ID!, status: String!): Order!
  }
`;

module.exports = orderTypeDefs;
