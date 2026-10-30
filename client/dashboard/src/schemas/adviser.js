import { z } from "zod";

export const TEAM_GROUPS = ["Leadership", "Experts", "The Wider Team"];

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const adviserFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(160, "Max 160 characters"),
  // Empty = made from the name when the person is added.
  slug: z
    .string()
    .trim()
    .max(200, "Max 200 characters")
    .refine((v) => !v || slugPattern.test(v), "Use lowercase letters, numbers and hyphens only"),
  designation: z.string().trim().max(200, "Max 200 characters"),
  team_group: z.string().trim().max(100, "Max 100 characters"),
  bio: z.string().trim().max(5000, "Max 5000 characters"),
  // One area of expertise per line.
  expertise: z.string().max(5000, "Max 5000 characters"),
  photo: z.string().trim().max(500, "Max 500 characters"),
  linkedin_url: z
    .string()
    .trim()
    .max(500, "Max 500 characters")
    .refine((v) => !v || /^https?:\/\//i.test(v), "Enter a full link starting with http:// or https://"),
  display_order: z.coerce.number().int("Whole number").min(0, "0 or more"),
  is_active: z.boolean(),
  is_placeholder: z.boolean(),
});
