const { GraphQLError } = require("graphql");

const throwGraphQLError = (message, code = "BAD_USER_INPUT", statusCode = 400, errors = null) => {
  throw new GraphQLError(message, {
    extensions: {
      code,
      statusCode,
      errors,
    },
  });
};

module.exports = {
  throwGraphQLError,
};
