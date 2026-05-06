const { mergeResolvers } = require("@graphql-tools/merge");
const authResolvers = require("./authResolver");
const categoryResolvers = require("./categoryResolver");
const productResolvers = require("./productResolver");
const cartResolvers = require("./cartResolver");
const orderResolvers = require("./orderResolver");

module.exports = mergeResolvers([
  authResolvers,
  categoryResolvers,
  productResolvers,
  cartResolvers,
  orderResolvers,
]);
