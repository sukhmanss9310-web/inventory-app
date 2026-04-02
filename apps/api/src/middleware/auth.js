import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User } from "../models/User.js";

const getTokenFromHeader = (authorizationHeader = "") => {
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.replace("Bearer ", "").trim();
};

const attachUser = async (req, next, { required }) => {
  const token = getTokenFromHeader(req.headers.authorization);

  if (!token) {
    if (required) {
      const error = new Error("Authentication required");
      error.statusCode = 401;
      return next(error);
    }

    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 401;
      return next(error);
    }

    req.user = user;
    return next();
  } catch (error) {
    error.statusCode = 401;
    error.message = "Invalid or expired token";
    return next(error);
  }
};

export const protect = async (req, res, next) => attachUser(req, next, { required: true });
export const optionalAuth = async (req, res, next) =>
  attachUser(req, next, { required: false });

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    const error = new Error("You do not have permission to perform this action");
    error.statusCode = 403;
    return next(error);
  }

  return next();
};

