import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  // Optional - a blog post doesn't need a category.
  category_id: z.uuid({ message: "Invalid category id" }).nullish(),
  description: z.string().optional(),
  content: z.string().optional(),
  date: z.coerce.date().optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
});