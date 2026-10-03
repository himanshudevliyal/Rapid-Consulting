import { z } from "zod";
import constants from "../lib/constants/index.js";

// Section roles decide which reusable component renders the section on the
// website. The words always stay in the section itself.
export const SECTION_ROLES = [
  "content", // rich text (overview, eligibility, costs, documents, …)
  "features", // intro + list of features
  "benefits", // intro + benefit cards
  "process", // intro + numbered steps
  "faq", // intro + question/answer pairs
  "service_cards", // text whose service links render as service cards
  "hero_benefit", // shown inside the hero instead of the intro
  "cta", // closing call-to-action section
];

const sectionItemSchema = z.object({
  key: z.string().trim().optional(),
  title: z.string().trim().min(1, "Item title is required"),
  html: z.string().optional().default(""),
});

const sectionSchema = z.object({
  key: z
    .string()
    .trim()
    .min(1, "Section key is required")
    .max(160, "Section key is too long"),
  title: z.string().trim().min(1, "Section title is required"),
  nav_label: z.string().trim().optional(),
  role: z.enum(SECTION_ROLES).optional().default("content"),
  html: z.string().optional().default(""),
  intro_html: z.string().optional().default(""),
  items: z.array(sectionItemSchema).optional().default([]),
  outro_html: z.string().optional().default(""),
});

// Fields without defaults, so an update only contains what the editor sent.
const translationFields = {
  locale: z.enum(constants.locales),
  title: z.string().trim().min(1, "Title is required"),
  h1: z.string().trim().optional(),
  eyebrow: z.string().trim().optional(),
  short_description: z.string().trim().optional(),
  intro_html: z.string().optional(),
  sections: z.array(sectionSchema).optional(),
  source_urls: z.array(z.url()).optional(),
  status: z.string().trim().optional(),
  review_label: z.string().trim().optional(),
  meta_title: z.string().trim().optional(),
  meta_description: z.string().trim().optional(),
  meta_keywords: z.string().trim().optional(),
  og_image: z.string().trim().optional(),
};

export const serviceTranslationSchema = z.object({
  ...translationFields,
  sections: z.array(sectionSchema).optional().default([]),
  source_urls: z.array(z.url()).optional().default([]),
  status: z.string().trim().optional().default("draft"),
});

// On update, a translation for an existing locale changes only the fields it
// contains. A new locale must include at least a title.
export const serviceTranslationUpdateSchema = z.object({
  ...translationFields,
  title: translationFields.title.optional(),
});

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const serviceFields = {
  code: z
    .string()
    .trim()
    .min(1, "Code is required")
    .max(32, "Code is too long"),
  slug: z
    .string()
    .trim()
    .regex(slugPattern, "Slug may only contain lowercase letters, numbers and hyphens")
    .optional(),
  type: z
    .enum(["service", "service-family", "additional-service", "service-index"])
    .optional()
    .default("service"),
  family_code: z.string().trim().max(32).nullish(),
  icon: z.string().trim().optional(),
  pictures: z.array(z.string()).optional().default([]),
  related_codes: z.array(z.string().trim()).optional().default([]),
  legacy_urls: z.array(z.url()).optional().default([]),
  sort_order: z.coerce.number().int().optional().default(0),
  is_active: z.coerce.boolean().optional().default(true),
};

const uniqueLocales = (translations) =>
  new Set(translations.map((t) => t.locale)).size === translations.length;

// Create: the default-language version is required because it is the
// fallback for every other language.
export const serviceSchema = z.object({
  ...serviceFields,
  translations: z
    .array(serviceTranslationSchema)
    .min(1, "At least one translation is required")
    .refine(
      (translations) =>
        translations.some((t) => t.locale === constants.defaultLocale),
      `A "${constants.defaultLocale}" translation is required`,
    )
    .refine(uniqueLocales, "Each locale may appear only once"),
});

// Update: every field is optional. Translations included in the body are
// upserted by locale; locales left out are kept.
export const serviceUpdateSchema = z.object({
  code: serviceFields.code.optional(),
  slug: serviceFields.slug,
  type: z
    .enum(["service", "service-family", "additional-service", "service-index"])
    .optional(),
  family_code: serviceFields.family_code,
  icon: serviceFields.icon,
  pictures: z.array(z.string()).optional(),
  related_codes: z.array(z.string().trim()).optional(),
  legacy_urls: z.array(z.url()).optional(),
  sort_order: z.coerce.number().int().optional(),
  is_active: z.coerce.boolean().optional(),
  translations: z
    .array(serviceTranslationUpdateSchema)
    .optional()
    .refine((t) => !t || uniqueLocales(t), "Each locale may appear only once"),
});
