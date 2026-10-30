import { z } from "zod";
import {
  LOCALES,
  TEMPLATE_KEYS,
  TRANSLATION_STATUSES,
  validatePagePath,
} from "../helpers/site-page-registry.js";

// "" means "cleared" (stored as null); a field that was not sent stays
// undefined so an update never touches it.
const blankToNull = (value) => (value === undefined ? undefined : value || null);

const optionalText = (max) => z.string().trim().max(max).nullish().transform(blankToNull);

// "Your-Project/Setting-Up/" -> "your-project/setting-up"; reserved or badly
// formed paths are reported with the reason.
const pagePath = z
  .string("Path is required")
  .trim()
  .superRefine((value, ctx) => {
    const result = validatePagePath(value, { allowManaged: true });
    if (!result.ok) ctx.addIssue({ code: "custom", message: result.error });
  })
  .transform((value) => validatePagePath(value, { allowManaged: true }).path);

const locale = z.enum(LOCALES, "Language must be en or hi");

const pageFields = {
  title: z.string("Title is required").trim().min(1, "Title is required").max(255),
  h1: optionalText(300),
  meta_title: optionalText(255),
  meta_description: optionalText(1000),
  path: pagePath,
  // Section objects are checked and cleaned by the registry (normaliseSections).
  sections: z.array(z.any(), "Sections must be a list"),
  translation_status: z.enum(TRANSLATION_STATUSES, "Translation status is not valid"),
  // Short note stored with the revision this action creates.
  note: optionalText(500),
  // Optional: refuse the save if someone else saved a newer version meanwhile.
  expected_version: z.coerce.number().int().min(1),
};

// Create: template, language, path and title are required; sections are
// optional (a new page starts with its masthead).
export const sitePageCreateSchema = z.object({
  template: z.enum(TEMPLATE_KEYS, `Template must be one of: ${TEMPLATE_KEYS.join(", ")}`),
  locale,
  path: pageFields.path,
  title: pageFields.title,
  h1: pageFields.h1,
  meta_title: pageFields.meta_title,
  meta_description: pageFields.meta_description,
  sections: pageFields.sections.optional(),
  note: pageFields.note,
});

// Update: send only what changed. Template and language cannot be changed.
export const sitePageUpdateSchema = z
  .object(pageFields)
  .partial()
  .extend({ note: pageFields.note });

export const sitePageNoteSchema = z.object({ note: pageFields.note });

export const sitePageTranslationSchema = z.object({
  locale,
  path: pagePath.optional(),
  note: pageFields.note,
});
