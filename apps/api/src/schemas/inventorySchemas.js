import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product id");
const actionSchema = z.enum([
  "company_reset",
  "user_created",
  "product_created",
  "product_updated",
  "product_deleted",
  "inventory_adjusted",
  "dispatch_created",
  "return_created"
]);

export const dispatchSchema = z.object({
  productId: objectIdSchema,
  quantity: z.coerce.number().int().positive(),
  note: z.string().trim().max(200).optional().default("")
});

export const returnSchema = z.object({
  productId: objectIdSchema,
  quantity: z.coerce.number().int().positive(),
  type: z.enum(["return", "exchange"]),
  note: z.string().trim().max(200).optional().default("")
});

export const adjustmentSchema = z.object({
  productId: objectIdSchema,
  stock: z.coerce.number().int().min(0),
  reason: z.string().trim().min(3).max(200)
});

export const companyResetSchema = z.object({
  confirmation: z.string().trim().min(2).max(60),
  reason: z.string().trim().min(3).max(200)
});

export const logQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
  search: z.string().trim().max(100).optional().default(""),
  action: actionSchema.optional(),
  actorRole: z.enum(["admin", "staff"]).optional(),
  movementType: z.enum(["dispatch", "return", "exchange"]).optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional()
});
