import { z } from "zod";

export const activitySchema = z.object({
  description: z
    .string({ required_error: "Description required." })
    .min(1, { message: "Description required." }),

  due_date: z.coerce.date().optional().nullable(),

  priority: z.enum(["low", "medium", "high"]).default("medium"),

  lead_id: z
    .number("Lead ID is required")
    .int("Lead ID is required")
    .positive("Lead ID is required")
    .min(1, { error: "Lead ID is required." }),
});
