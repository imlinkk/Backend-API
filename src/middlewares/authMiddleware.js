const User = require("../models/User");
const AppError = require("../utils/AppError");
const { decodeBearerToken } = require("../utils/auth");

const protect = async (req, res, next) => {
  try {
    const decoded = decodeBearerToken(req.headers.authorization || "");

    if (!decoded?.id) {
      return next(new AppError(401, "Not authorized, token missing or invalid"));
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return next(new AppError(401, "Not authorized, user not found"));
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(new AppError(401, "Not authorized, token missing or invalid"));
  }
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return next(new AppError(403, "Forbidden: admin access required"));
  }

  return next();
};

module.exports = {
  protect,
  adminOnly,
};
