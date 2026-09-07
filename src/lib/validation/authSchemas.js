import { z } from "zod";
import { STAFF_ROLES } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required").max(200),
});

export const createStaffSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z
    .string()
    .min(10, "Use at least 10 characters")
    .max(200),
  role: z.enum(STAFF_ROLES),
});

export const updateStaffSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  role: z.enum(STAFF_ROLES).optional(),
  status: z.enum(["active", "disabled"]).optional(),
  password: z.string().min(10).max(200).optional(),
});
