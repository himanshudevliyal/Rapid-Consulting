import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const option = z.object({ value: z.string(), label: z.string() }).passthrough();

export const industryFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160, "Max 160 characters"),
  // Empty = made from the name when the industry is created.
  slug: z
    .string()
    .trim()
    .max(200, "Max 200 characters")
    .refine((v) => !v || slugPattern.test(v), "Use lowercase letters, numbers and hyphens only"),
  h1: z.string().trim().max(255, "Max 255 characters"),
  description: z.string().trim().max(2000, "Max 2000 characters"),
  icon: z.string().trim().max(500, "Max 500 characters"),
  image: z.string().trim().max(500, "Max 500 characters"),
  display_order: z.coerce.number().int("Whole number").min(0, "0 or more"),
  is_active: z.boolean(),
  intro: z.string(),
  content: z.string(),
  note: z.string().trim().max(2000, "Max 2000 characters"),
  meta_title: z.string().trim().max(255, "Max 255 characters"),
  meta_description: z.string().trim().max(500, "Max 500 characters"),
  service_slugs: z.array(option),
  scheme_slugs: z.array(option),
});
