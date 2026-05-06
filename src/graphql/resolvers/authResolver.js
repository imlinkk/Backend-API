const User = require("../../models/User");
const { generateAuthPayload } = require("../../utils/auth");
const { requireAdmin, requireAuth, validateArgs, z } = require("./helpers");
const { throwGraphQLError } = require("../../utils/graphql");

const registerArgsSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
});

const loginArgsSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(128),
});

const updateProfileArgsSchema = z
  .object({
    name: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().optional(),
    password: z.string().min(6).max(128).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const authResolvers = {
  Query: {
    me: async (parent, args, context) => requireAuth(context),
    users: async (parent, args, context) => {
      requireAdmin(context);
      return User.find().select("-password").sort({ createdAt: -1 });
    },
  },
  Mutation: {
    register: async (parent, args) => {
      const data = validateArgs(registerArgsSchema, args);
      const existingUser = await User.findOne({ email: data.email });

      if (existingUser) {
        throwGraphQLError("Email already in use", "CONFLICT", 409);
      }

      const user = await User.create(data);
      return generateAuthPayload(user);
    },
    login: async (parent, args) => {
      const data = validateArgs(loginArgsSchema, args);
      const user = await User.findOne({ email: data.email }).select("+password");

      if (!user || !(await user.comparePassword(data.password))) {
        throwGraphQLError("Invalid email or password", "UNAUTHENTICATED", 401);
      }

      return generateAuthPayload(user);
    },
    updateProfile: async (parent, args, context) => {
      const currentUser = requireAuth(context);
      const data = validateArgs(updateProfileArgsSchema, args);

      const user = await User.findById(currentUser._id).select("+password");
      if (!user) {
        throwGraphQLError("User not found", "NOT_FOUND", 404);
      }

      if (data.email && data.email !== user.email) {
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser) {
          throwGraphQLError("Email already in use", "CONFLICT", 409);
        }
      }

      Object.assign(user, data);
      await user.save();

      return user;
    },
  },
};

module.exports = authResolvers;
