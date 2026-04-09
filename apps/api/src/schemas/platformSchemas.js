import { z } from "zod";

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createCompanyWorkspaceSchema = z.object({
  companyName: z.string().trim().min(2).max(120),
  companyCode: z
    .string()
    .trim()
    .min(2)
    .max(60)
    .regex(
      /^[a-zA-Z0-9-_\s]+$/,
      "Company code can only include letters, numbers, spaces, underscores, and hyphens"
    ),
  adminName: z.string().trim().min(2).max(80),
  adminEmail: z.string().trim().email(),
  adminPassword: z.string().min(8).max(128)
});

export const companyIdParamSchema = z.object({
  companyId: objectIdSchema
});

export const userIdParamSchema = z.object({
  userId: objectIdSchema
});

export const accessToggleSchema = z.object({
  isActive: z.boolean()
});
