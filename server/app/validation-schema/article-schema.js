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

// No defaults here on purpose: the same fields are reused (as partial) for
// updates, and a default would overwrite values the request did not send.
const articleFields = {
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
  excerpt: optionalText(1000),
  content: optionalHtml,
  cover_image: optionalText(500),
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
  meta_title: optionalText(255),
  meta_description: optionalText(500),
};

const base = z.object(articleFields);

// Create: only the title is required.
export const articleCreateSchema = base
  .partial()
  .extend({ title: articleFields.title });

// Update: send only what changed.
export const articleUpdateSchema = base.partial();
