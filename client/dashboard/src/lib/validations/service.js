import { z } from "zod";

export const serviceSchema = z.object({
  code: z.string().min(1, "Code is required").max(32),
  slug: z.string().optional(),
  type: z
    .enum(["service", "service-family", "additional-service", "service-index"])
    .optional()
    .default("service"),
  family_code: z.string().optional().nullable(),
  icon: z.string().optional(),
  sort_order: z.coerce.number().int().optional().default(0),
  is_active: z.coerce.boolean().optional().default(true),
  // English translation fields
  title: z.string().min(1, "Title is required"),
  short_description: z.string().optional(),
  status: z.string().optional().default("draft"),
});
