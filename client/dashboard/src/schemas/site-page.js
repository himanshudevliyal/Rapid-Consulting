import { z } from "zod";
import { MANAGED_PATHS, PATH_PATTERN, RESERVED_FIRST_SEGMENTS } from "@/lib/site-page";

const pathField = z
  .string()
  .trim()
  .min(1, "Path is required")
  .max(200, "Max 200 characters")
  .refine((value) => PATH_PATTERN.test(value), "Use lowercase letters, numbers and hyphens, with / between parts. No leading or trailing slash.")
  .refine(
    (value) => MANAGED_PATHS.includes(value) || !RESERVED_FIRST_SEGMENTS.includes(value.split("/")[0]),
    "That first part of the address is used by the website. Choose another one.",
  );

// New page: template, language, address and title.
export const sitePageCreateSchema = z.object({
  template: z.string().min(1, "Choose a template"),
  locale: z.enum(["en", "hi"], { required_error: "Choose a language" }),
  path: pathField,
  title: z.string().trim().min(1, "Title is required").max(255, "Max 255 characters"),
});

// Details of a page being edited (sections are checked separately).
export const sitePageMetaSchema = z.object({
  path: pathField,
  title: z.string().trim().min(1, "Title is required").max(255, "Max 255 characters"),
  h1: z.string().trim().max(255, "Max 255 characters"),
  meta_title: z.string().trim().max(255, "Max 255 characters"),
  meta_description: z.string().trim().max(500, "Max 500 characters"),
  translation_status: z.enum(["not_needed", "missing", "needs_review", "reviewed"]),
});

// One section as it is saved.
export const sectionSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  variant: z.string().optional(),
  visible: z.boolean(),
  label: z.string().max(40, "Section label: max 40 characters"),
  anchor: z
    .string()
    .max(80, "Anchor: max 80 characters")
    .refine((value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), "Anchor: use lowercase letters, numbers and hyphens only"),
  data: z.record(z.any()),
});

export const sectionsSchema = z.array(sectionSchema);

// Navigation settings.
const hrefField = z
  .string()
  .trim()
  .min(1, "Link is required")
  .refine((value) => /^(\/|#|https?:\/\/)/.test(value), "Start with / for a page of the website, or https:// for another site");

const navLink = z.object({
  label: z.string().trim().min(1, "Label is required").max(80, "Max 80 characters"),
  label_hi: z.string().trim().max(80, "Max 80 characters").optional(),
  href: hrefField,
  visible: z.boolean().optional(),
});

export const navigationSchema = z.object({
  primary: z.array(
    z.object({
      key: z.string().min(1),
      label: z.string().trim().min(1, "Label is required").max(60, "Max 60 characters"),
      label_hi: z.string().trim().max(60, "Max 60 characters").optional(),
      href: hrefField,
      visible: z.boolean(),
      children: z.array(z.any()).optional(),
    }),
  ),
  footer: z.array(
    z.object({
      heading: z.string().trim().min(1, "Column heading is required").max(80, "Max 80 characters"),
      heading_hi: z.string().trim().max(80, "Max 80 characters").optional(),
      links: z.array(navLink),
    }),
  ),
});
