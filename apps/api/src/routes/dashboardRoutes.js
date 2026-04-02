import { Router } from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, requireRole } from "../middleware/auth.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", protect, requireRole("admin"), asyncHandler(getDashboard));
