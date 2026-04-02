import { Router } from "express";
import { getCurrentUser, login, signup } from "../controllers/authController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { optionalAuth, protect } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { loginSchema, registerSchema } from "../schemas/authSchemas.js";

export const authRouter = Router();

authRouter.post("/signup", optionalAuth, validate({ body: registerSchema }), asyncHandler(signup));
authRouter.post("/login", validate({ body: loginSchema }), asyncHandler(login));
authRouter.get("/me", protect, asyncHandler(getCurrentUser));
