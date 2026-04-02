import { User } from "../models/User.js";
import { createError } from "../utils/errors.js";
import { signToken } from "../utils/jwt.js";
import { createActivityLog } from "./activityLogService.js";

const serializeUser = (user) =>
  typeof user.toSafeObject === "function"
    ? user.toSafeObject()
    : {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

export const registerUser = async (payload, currentUser = null) => {
  const totalUsers = await User.countDocuments();
  const normalizedEmail = payload.email.toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw createError("A user with this email already exists", 409);
  }

  let role = payload.role || "staff";

  // The first user bootstraps the workspace and becomes the admin owner.
  if (totalUsers === 0) {
    role = "admin";
  } else if (!currentUser || currentUser.role !== "admin") {
    throw createError("Only an admin can create additional users", 403);
  }

  const user = await User.create({
    name: payload.name,
    email: normalizedEmail,
    password: payload.password,
    role
  });

  await createActivityLog({
    actorId: currentUser?._id || user._id,
    actorName: currentUser?.name || user.name,
    actorRole: currentUser?.role || user.role,
    action: "user_created",
    entityType: "user",
    entityId: user._id,
    message:
      totalUsers === 0
        ? `${user.name} initialized the workspace as admin.`
        : `${currentUser.name} created ${user.name} as ${user.role}.`,
    metadata: {
      email: user.email,
      createdRole: user.role
    }
  });

  return {
    user: serializeUser(user),
    token: currentUser ? null : signToken({ userId: user._id })
  };
};

export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() });

  if (!user) {
    throw createError("Invalid email or password", 401);
  }

  const passwordMatches = await user.comparePassword(password);

  if (!passwordMatches) {
    throw createError("Invalid email or password", 401);
  }

  return {
    token: signToken({ userId: user._id }),
    user: serializeUser(user)
  };
};
