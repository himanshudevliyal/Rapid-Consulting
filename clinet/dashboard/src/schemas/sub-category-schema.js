import { z } from "zod";

export const subCategorySchema = z.object({
  title: z.string().min(1, "Title is required"),
  category_id: z.string().uuid("Category is required"),
  featured: z.boolean().optional().default(false),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
});
