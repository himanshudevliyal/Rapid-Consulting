import { z } from "zod";

export const categorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  featured: z.boolean().optional().default(false),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
});
