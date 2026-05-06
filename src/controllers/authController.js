const User = require("../models/User");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { generateAuthPayload } = require("../utils/auth");
const { sendSuccess } = require("../utils/response");

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError(409, "Email already in use");
  }

  const user = await User.create({ name, email, password });
  const payload = generateAuthPayload(user);

  return sendSuccess(res, 201, "User registered successfully", {
    token: payload.token,
    user: payload.user,
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, "Invalid email or password");
  }

  const payload = generateAuthPayload(user);

  return sendSuccess(res, 200, "Login successful", {
    token: payload.token,
    user: payload.user,
  });
});

const getProfile = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, "Profile fetched successfully", {
    user: req.user,
  });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    throw new AppError(404, "User not found");
  }

  if (req.body.email && req.body.email !== user.email) {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      throw new AppError(409, "Email already in use");
    }
  }

  if (req.body.name) {
    user.name = req.body.name;
  }

  if (req.body.email) {
    user.email = req.body.email;
  }

  if (req.body.password) {
    user.password = req.body.password;
  }

  await user.save();

  return sendSuccess(res, 200, "Profile updated successfully", {
    user: user.toJSON(),
  });
});

const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });

  return sendSuccess(res, 200, "Users fetched successfully", {
    users,
  });
});

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getUsers,
};
