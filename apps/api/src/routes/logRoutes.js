import { Router } from "express";
import { listLogs } from "../controllers/logController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { logQuerySchema } from "../schemas/inventorySchemas.js";

export const logRouter = Router();

logRouter.get(
  "/",
  protect,
  requireRole("admin"),
  validate({ query: logQuerySchema }),
  asyncHandler(listLogs)
);
