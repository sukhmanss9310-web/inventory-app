import { Router } from "express";
import { createReturn, dispatchProduct } from "../controllers/inventoryController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { dispatchSchema, returnSchema } from "../schemas/inventorySchemas.js";

export const inventoryRouter = Router();

inventoryRouter.use(protect, requireRole("admin", "staff"));

inventoryRouter.post(
  "/dispatches",
  validate({ body: dispatchSchema }),
  asyncHandler(dispatchProduct)
);
inventoryRouter.post("/returns", validate({ body: returnSchema }), asyncHandler(createReturn));
