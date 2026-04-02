import { loginUser, registerUser } from "../services/authService.js";

export const signup = async (req, res) => {
  const result = await registerUser(req.body, req.user);

  return res.status(201).json({
    message: "User created successfully",
    ...result
  });
};

export const login = async (req, res) => {
  const result = await loginUser(req.body);

  return res.json({
    message: "Logged in successfully",
    ...result
  });
};

export const getCurrentUser = async (req, res) => {
  return res.json({
    user: typeof req.user.toSafeObject === "function" ? req.user.toSafeObject() : req.user
  });
};
