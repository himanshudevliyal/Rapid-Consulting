import { z } from "zod";
import { sectionRoles } from "@/data/service-constants";

const optionalUrl = z
  .string()
  .refine((value) => {
    if (!value?.trim()) return true;
    try {
      new URL(value.trim());
      return true;
    } catch {
      return false;
    }
  }, "Enter a full URL, e.g. https://…");

const itemSchema = z.object({
  key: z.string().optional(),
  title: z.string().trim().min(1, "Item title is required"),
  html: z.string().optional(),
});

const sectionSchema = z.object({
  key: z.string().optional(),
  title: z.string().trim().min(1, "Section title is required"),
  nav_label: z.string().optional(),
  role: z.enum(sectionRoles.map((r) => r.value)),
  html: z.string().optional(),
  intro_html: z.string().optional(),
  items: z.array(itemSchema),
  outro_html: z.string().optional(),
});

const contentFields = {
  h1: z.string().optional(),
  eyebrow: z.string().optional(),
  short_description: z.string().optional(),
  intro_html: z.string().optional(),
  sections: z.array(sectionSchema),
  source_urls: z.array(optionalUrl),
  status: z.string().optional(),
  review_label: z.string().max(80, "Max 80 characters").optional(),
  meta_title: z.string().optional(),
  meta_description: z.string().optional(),
  meta_keywords: z.string().optional(),
  og_image: z.string().optional(),
};

// English is required. Hindi is only checked when that version is added
// (the form checks its title; the other fields use the same rules).
export const serviceFormSchema = z.object({
  // Never typed: made by the server, or picked as a Family / topic for family pages.
  code: z.string().trim().max(32, "Max 32 characters"),
  slug: z
    .string()
    .trim()
    .regex(/^$|^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and hyphens only")
    .optional(),
  type: z.string().min(1, "Choose a Format"),
  family_code: z.string().optional(),
  category_id: z.string().optional(),
  icon: z.string().optional(),
  // Uploaded image paths; the first one is the service's main image.
  pictures: z.array(z.string()),
  sort_order: z.coerce.number().int().default(0),
  is_active: z.boolean().default(true),
  legacy_urls: z.array(optionalUrl),
  content: z.object({
    en: z.object({ title: z.string().trim().min(1, "Title is required"), ...contentFields }),
    hi: z.object({ title: z.string().optional(), ...contentFields }),
  }),
});
