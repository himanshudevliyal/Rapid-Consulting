import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// "" means "cleared" (stored as null); a field that was not sent stays
// undefined so an update never touches it.
const blankToNull = (value) => (value === undefined ? undefined : value || null);

const optionalText = (max) =>
  z.string().trim().max(max).nullish().transform(blankToNull);

// Rich-text (HTML) content is kept as written.
const optionalHtml = z
  .string()
  .nullish()
  .transform((value) =>
    value === undefined ? undefined : value && value.trim() ? value : null,
  );

const slugList = z
  .array(z.string())
  .transform((list) => [...new Set(list.map((slug) => slug.trim()).filter(Boolean))]);

// No defaults here on purpose: the same fields are reused (as partial) for
// updates, and a default would overwrite values the request did not send.
const industryFields = {
  name: z.string("Name is required").trim().min(1, "Name is required").max(160),
  slug: z
    .string()
    .trim()
    .max(200)
    .regex(slugPattern, "Slug may only contain lowercase letters, numbers and hyphens")
    .optional(),
  description: optionalText(2000),
  icon: optionalText(500),
  display_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
  h1: optionalText(255),
  meta_title: optionalText(255),
  meta_description: optionalText(500),
  intro: optionalHtml,
  content: optionalHtml,
  image: optionalText(500),
  note: optionalText(2000),
  service_slugs: slugList,
  scheme_slugs: slugList,
};

const base = z.object(industryFields);

// Create: only the name is required.
export const industryCreateSchema = base.partial().extend({ name: industryFields.name });

// Update: send only what changed.
export const industryUpdateSchema = base.partial();
