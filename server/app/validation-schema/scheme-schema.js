import { z } from "zod";
import { editorialFields } from "./editorial-fields.js";
import { sectionSchema } from "./service-schema.js";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// "" means "cleared" (stored as null); a field that was not sent stays
// undefined so an update never touches it.
const blankToNull = (value) => (value === undefined ? undefined : value || null);

const optionalText = (max) =>
  z.string().trim().max(max).nullish().transform(blankToNull);

// Rich-text (HTML) fields keep their content untouched.
const optionalHtml = z
  .string()
  .nullish()
  .transform((value) =>
    value === undefined ? undefined : value && value.trim() ? value : null,
  );

// No defaults here on purpose: the same fields are reused (as partial) for
// updates, and a default would overwrite values the request did not send.
const schemeFields = {
  title: z.string("Title is required").trim().min(1, "Title is required").max(255),
  slug: z
    .string()
    .trim()
    .max(300)
    .regex(
      slugPattern,
      "Slug may only contain lowercase letters, numbers and hyphens",
    )
    .optional(),
  ministry: optionalText(255),
  description: optionalHtml,
  eligibility: optionalHtml,
  benefits: optionalHtml,
  application_process: optionalHtml,
  official_url: z
    .union([z.literal(""), z.string().trim().max(500).url("Enter a full URL")])
    .nullish()
    .transform(blankToNull),
  cover_image: optionalText(500),
  pdf_url: optionalText(500),
  // Id of a category (/v1/categories); "" clears it.
  category_id: z
    .union([z.literal(""), z.uuid("Pick a valid category")])
    .nullish()
    .transform(blankToNull),
  tags: z
    .array(z.string())
    .transform((list) =>
      [...new Set(list.map((tag) => tag.trim()).filter(Boolean))],
    ),
  is_published: z.boolean(),
  is_featured: z.boolean(),
  // Quick facts shown on the scheme page.
  assistance_type: optionalText(255),
  relevant_activity: optionalText(255),
  policy_period: optionalText(255),
  application_window: optionalText(255),
  // The "at a glance" rows, in order. A row needs a label; the value may be empty.
  quick_facts: z
    .array(
      z.object({
        label: z.string().trim().min(1, "Label is required").max(120),
        value: z.string().trim().max(600).optional().default(""),
        bold: z.boolean().optional().default(false),
      }),
    )
    .max(20, "At most 20 rows"),
  // Extra sections (same shape and roles as a service's sections).
  sections: z.array(sectionSchema).max(40, "At most 40 sections"),
  status: z
    .union([z.literal(""), z.enum(["open", "upcoming", "closed", "historical"], "Pick a valid status")])
    .nullish()
    .transform(blankToNull),
  ...editorialFields,
};

const base = z.object(schemeFields);

// Create: only the title is required; everything else falls back to the
// database defaults (no tags, not published).
export const schemeCreateSchema = base.partial().extend({ title: schemeFields.title });

// Update: send only what changed.
export const schemeUpdateSchema = base.partial();
