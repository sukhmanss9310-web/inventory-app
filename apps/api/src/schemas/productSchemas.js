import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(120),
  sku: z.string().trim().min(2).max(60),
  stock: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5)
});

export const importProductsSchema = z
  .object({
    rows: z.array(z.record(z.unknown())).min(1).max(1000).optional(),
    sheetUrl: z.string().trim().url().optional(),
    sourceLabel: z.string().trim().max(200).optional()
  })
  .superRefine((value, context) => {
    if (!value.rows && !value.sheetUrl) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rows"],
        message: "Upload rows or provide a Google Sheet URL"
      });
    }

    if (value.rows && value.sheetUrl) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["sheetUrl"],
        message: "Choose either uploaded rows or a Google Sheet URL, not both"
      });
    }
  });

export const productIdParamSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product id")
});
