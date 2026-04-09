import { Router } from "express";
import {
  createManagedCompany,
  getPlatformDashboard,
  updateManagedCompanyAccess,
  updateManagedUserAccess
} from "../controllers/platformController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  accessToggleSchema,
  companyIdParamSchema,
  createCompanyWorkspaceSchema,
  userIdParamSchema
} from "../schemas/platformSchemas.js";

export const platformRouter = Router();

platformRouter.use(protect, requireRole("developer"));

platformRouter.get("/overview", asyncHandler(getPlatformDashboard));
platformRouter.post(
  "/companies",
  validate({ body: createCompanyWorkspaceSchema }),
  asyncHandler(createManagedCompany)
);
platformRouter.patch(
  "/companies/:companyId/access",
  validate({ params: companyIdParamSchema, body: accessToggleSchema }),
  asyncHandler(updateManagedCompanyAccess)
);
platformRouter.patch(
  "/users/:userId/access",
  validate({ params: userIdParamSchema, body: accessToggleSchema }),
  asyncHandler(updateManagedUserAccess)
);
