const authTypeDefs = `#graphql
  extend type Query {
    me: User!
    users: [User!]!
  }

  extend type Mutation {
    register(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    updateProfile(name: String, email: String, password: String): User!
  }
`;

module.exports = authTypeDefs;
