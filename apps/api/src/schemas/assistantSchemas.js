import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product id");

const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(3000)
});

const assistantActionSchema = z.object({
  type: z.enum(["create_dispatch", "add_return", "reset_stock", "create_product"]),
  summary: z.string().trim().min(3).max(500),
  payload: z.record(z.unknown())
});

export const assistantChatSchema = z.object({
  messages: z.array(chatMessageSchema).min(1).max(20)
});

export const assistantExecuteSchema = z.object({
  action: assistantActionSchema.extend({
    payload: z
      .object({
        productId: objectIdSchema.optional(),
        quantity: z.coerce.number().int().positive().optional(),
        type: z.enum(["return", "exchange"]).optional(),
        note: z.string().trim().max(200).optional().default(""),
        stock: z.coerce.number().int().min(0).optional(),
        reason: z.string().trim().max(200).optional(),
        name: z.string().trim().max(120).optional(),
        sku: z.string().trim().max(60).optional(),
        lowStockThreshold: z.coerce.number().int().min(0).optional()
      })
      .passthrough()
  })
});
