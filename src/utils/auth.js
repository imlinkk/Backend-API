const { signToken, verifyToken } = require("../config/jwt");

const generateAuthPayload = (user) => ({
  token: signToken({
    id: user._id,
    role: user.role,
  }),
  user: user.toJSON ? user.toJSON() : user,
});

const getTokenFromHeader = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.split(" ")[1];
};

const decodeBearerToken = (authorizationHeader = "") => {
  const token = getTokenFromHeader(authorizationHeader);

  if (!token) {
    return null;
  }

  return verifyToken(token);
};

module.exports = {
  generateAuthPayload,
  getTokenFromHeader,
  decodeBearerToken,
};
