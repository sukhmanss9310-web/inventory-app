import { Router } from "express";
import {
  createProductHandler,
  deleteProductHandler,
  getProduct,
  getProducts,
  updateProductHandler
} from "../controllers/productController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { createProductSchema, productIdParamSchema } from "../schemas/productSchemas.js";

export const productRouter = Router();

productRouter.use(protect);

productRouter.get("/", asyncHandler(getProducts));
productRouter.get(
  "/:productId",
  validate({ params: productIdParamSchema }),
  asyncHandler(getProduct)
);
productRouter.post(
  "/",
  requireRole("admin"),
  validate({ body: createProductSchema }),
  asyncHandler(createProductHandler)
);
productRouter.put(
  "/:productId",
  requireRole("admin"),
  validate({ params: productIdParamSchema, body: createProductSchema }),
  asyncHandler(updateProductHandler)
);
productRouter.delete(
  "/:productId",
  requireRole("admin"),
  validate({ params: productIdParamSchema }),
  asyncHandler(deleteProductHandler)
);
