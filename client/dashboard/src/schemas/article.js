import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const articleFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Max 255 characters"),
  // Empty = made from the title when the article is created.
  slug: z
    .string()
    .trim()
    .max(300, "Max 300 characters")
    .refine((v) => !v || slugPattern.test(v), "Use lowercase letters, numbers and hyphens only"),
  excerpt: z.string().trim().max(1000, "Max 1000 characters"),
  cover_image: z.string().trim().max(500, "Max 500 characters"),
  category_id: z.string(),
  tags: z.string(),
  is_published: z.boolean(),
  content: z.string(),
  meta_title: z.string().trim().max(255, "Max 255 characters"),
  meta_description: z.string().trim().max(500, "Max 500 characters"),
});
