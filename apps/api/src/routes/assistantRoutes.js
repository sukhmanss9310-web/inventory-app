import { Router } from "express";
import {
  chatWithInventoryAssistant,
  executeInventoryAssistantAction
} from "../controllers/assistantController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { assistantChatSchema, assistantExecuteSchema } from "../schemas/assistantSchemas.js";

export const assistantRouter = Router();

assistantRouter.use(protect, requireRole("admin"));

assistantRouter.post(
  "/chat",
  validate({ body: assistantChatSchema }),
  asyncHandler(chatWithInventoryAssistant)
);

assistantRouter.post(
  "/execute",
  validate({ body: assistantExecuteSchema }),
  asyncHandler(executeInventoryAssistantAction)
);
