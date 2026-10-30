import { z } from "zod";
import { authorFieldsSchema } from "@/lib/author-fields";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const caseStudyFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Max 255 characters"),
  // Empty = made from the title when the case study is created.
  slug: z
    .string()
    .trim()
    .max(300, "Max 300 characters")
    .refine((v) => !v || slugPattern.test(v), "Use lowercase letters, numbers and hyphens only"),
  client_name: z.string().trim().max(200, "Max 200 characters"),
  industry: z.string().trim().max(120, "Max 120 characters"),
  cover_image: z.string().trim().max(500, "Max 500 characters"),
  tags: z.string(),
  is_published: z.boolean(),
  challenge: z.string(),
  solution: z.string(),
  result: z.string(),
  location: z.string().trim().max(200, "Max 200 characters"),
  sector: z.string().trim().max(200, "Max 200 characters"),
  rapid_role: z.string().max(5000, "Max 5000 characters"),
  // Evidence
  proof_image: z.string().trim().max(500, "Max 500 characters"),
  proof_caption: z.string().trim().max(500, "Max 500 characters"),
  milestone_label: z.string().trim().max(200, "Max 200 characters"),
  milestone_date: z.string().refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date"),
  quote_text: z.string().max(5000, "Max 5000 characters"),
  quote_attribution: z.string().trim().max(255, "Max 255 characters"),
  ...authorFieldsSchema,
});
