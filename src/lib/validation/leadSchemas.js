import { z } from "zod";
import {
  LEAD_SOURCES, LEAD_QUALITY, ADMIN_SETTABLE_STATUS,
} from "@/lib/constants";

const str = (max) => z.string().trim().max(max).optional().or(z.literal(""));

export const createLeadSchema = z
  .object({
    name: str(160),
    phone: str(40),
    email: z.string().trim().max(200).optional().or(z.literal("")),
    whatsapp: str(40),
    city: str(120),
    state: str(120),
    country: str(120),
    pincode: str(20),
    category: str(120),
    subcategory: str(120),
    requirement: str(4000),
    budget: z.coerce.number().min(0).max(1e12).optional(),
    source: z.enum(Object.values(LEAD_SOURCES)).optional(),
  })
  .refine((d) => (d.phone && d.phone.trim()) || (d.email && d.email.trim()), {
    message: "Provide a phone number or an email",
    path: ["phone"],
  });

export const updateLeadFieldsSchema = z.object({
  name: str(160),
  email: z.string().trim().max(200).optional().or(z.literal("")),
  whatsapp: str(40),
  city: str(120),
  state: str(120),
  country: str(120),
  pincode: str(20),
  category: str(120),
  subcategory: str(120),
  requirement: str(4000),
  budget: z.coerce.number().min(0).max(1e12).nullable().optional(),
  price: z.coerce.number().min(0).max(1e9).nullable().optional(),
});

export const updateLeadStatusSchema = z.object({
  status: z.enum(ADMIN_SETTABLE_STATUS),
  note: z.string().trim().max(500).optional(),
});

export const listLeadsQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  status: z.string().optional(),
  source: z.enum(Object.values(LEAD_SOURCES)).optional(),
  category: z.string().trim().max(120).optional(),
  quality: z.enum(Object.values(LEAD_QUALITY)).optional(),
  city: z.string().trim().max(120).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  sort: z.enum(["createdAt", "score", "price", "status"]).optional(),
  dir: z.enum(["asc", "desc"]).optional(),
});

export const importSchema = z.object({
  csvText: z.string().min(1).max(8_000_000),
  mapping: z.record(z.string(), z.string()),
  mode: z.enum(["dry_run", "commit"]),
});
