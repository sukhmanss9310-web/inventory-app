import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  role: z.enum(["admin", "staff"]).optional()
});

export const loginSchema = z.object({
  companyCode: z.string().trim().min(2).max(60),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128)
});
