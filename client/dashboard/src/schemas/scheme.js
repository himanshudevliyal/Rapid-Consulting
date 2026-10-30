import { z } from "zod";
import { schemeSectionRoles } from "@/data/service-constants";
import { authorFieldsSchema } from "@/lib/author-fields";

export const SCHEME_STATUSES = [
  { value: "open", label: "Open" },
  { value: "upcoming", label: "Upcoming" },
  { value: "closed", label: "Closed" },
  { value: "historical", label: "Historical" },
];

const quickFactSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(120, "Max 120 characters"),
  value: z.string().trim().max(600, "Max 600 characters"),
  bold: z.boolean(),
});

const sectionItemSchema = z.object({
  key: z.string().optional(),
  title: z.string().trim().min(1, "Item title is required"),
  html: z.string().optional(),
});

const sectionSchema = z.object({
  key: z.string().optional(),
  title: z.string().trim().min(1, "Section title is required"),
  nav_label: z.string().optional(),
  eyebrow: z.string().optional(),
  role: z.enum(schemeSectionRoles.map((r) => r.value)),
  html: z.string().optional(),
  intro_html: z.string().optional(),
  items: z.array(sectionItemSchema),
  outro_html: z.string().optional(),
});

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
  pdf_url: z.string().trim().max(500, "Max 500 characters"),
  category_id: z.string(),
  family_code: z.string(),
  tags: z.string(),
  is_published: z.boolean(),
  is_featured: z.boolean(),
  description: z.string(),
  eligibility: z.string(),
  benefits: z.string(),
  application_process: z.string(),
  // Quick facts
  assistance_type: z.string().trim().max(255, "Max 255 characters"),
  relevant_activity: z.string().trim().max(255, "Max 255 characters"),
  policy_period: z.string().trim().max(255, "Max 255 characters"),
  application_window: z.string().trim().max(255, "Max 255 characters"),
  quick_facts: z.array(quickFactSchema).max(20, "At most 20 rows"),
  sections: z.array(sectionSchema),
  status: z.enum(["", "open", "upcoming", "closed", "historical"]),
  ...authorFieldsSchema,
});
