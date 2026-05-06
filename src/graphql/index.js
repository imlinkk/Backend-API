const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@apollo/server/express4");
const { mergeTypeDefs } = require("@graphql-tools/merge");
const baseTypeDefs = require("./schemas/baseSchema");
const authTypeDefs = require("./schemas/authSchema");
const categoryTypeDefs = require("./schemas/categorySchema");
const productTypeDefs = require("./schemas/productSchema");
const cartTypeDefs = require("./schemas/cartSchema");
const orderTypeDefs = require("./schemas/orderSchema");
const resolvers = require("./resolvers");
const { buildGraphQLContext } = require("./resolvers/helpers");

const typeDefs = mergeTypeDefs([
  baseTypeDefs,
  authTypeDefs,
  categoryTypeDefs,
  productTypeDefs,
  cartTypeDefs,
  orderTypeDefs,
]);

const createApolloServer = async () => {
  const apolloServer = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await apolloServer.start();

  return {
    apolloServer,
    middleware: expressMiddleware(apolloServer, {
      context: buildGraphQLContext,
    }),
  };
};

module.exports = {
  createApolloServer,
};
