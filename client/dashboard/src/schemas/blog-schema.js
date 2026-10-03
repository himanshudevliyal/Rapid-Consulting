import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category_id: z
    .union([z.string().uuid("Invalid category"), z.literal("")])
    .nullish(),
  description: z.string().optional(),
  content: z.string().optional(),
  date: z.string().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
});