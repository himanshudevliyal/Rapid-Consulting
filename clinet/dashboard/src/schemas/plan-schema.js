import { z } from "zod";

export const planSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional().nullish(),
  duration_in_months: z.number().int().min(1),
  price: z.number().min(0),
  discount_percentage: z.number().optional().nullish().default(0),
  is_popular: z.boolean().optional(),
  is_active: z.boolean().optional(),
  plan_tier: z.enum(["free", "standard", "premium", "elite"], {
    message: "Select plan tier.",
  }),
  features: z
    .array(
      z.object({
        key: z.string().min(1, { message: "Feature key is required." }),
        value: z.string().min(1, { message: "Feature value is required." }),
      }),
      { required_error: "Features must be an array" },
    )
    .min(1, "Features must contain at least one item"),
});
