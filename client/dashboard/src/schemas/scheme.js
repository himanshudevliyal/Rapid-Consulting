import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const schemeFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Max 255 characters"),
  // Empty = made from the title when the scheme is created.
  slug: z
    .string()
    .trim()
    .max(300, "Max 300 characters")
    .refine((v) => !v || slugPattern.test(v), "Use lowercase letters, numbers and hyphens only"),
  ministry: z.string().trim().max(255, "Max 255 characters"),
  official_url: z
    .string()
    .trim()
    .max(500, "Max 500 characters")
    .refine((v) => !v || /^https?:\/\/\S+$/i.test(v), "Enter a full URL starting with https://"),
  cover_image: z.string().trim().max(500, "Max 500 characters"),
  category_id: z.string(),
  family_code: z.string(),
  tags: z.string(),
  is_published: z.boolean(),
  description: z.string(),
  eligibility: z.string(),
  benefits: z.string(),
  application_process: z.string(),
});
