import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// "" means "cleared" (stored as null); a field that was not sent stays
// undefined so an update never touches it.
const blankToNull = (value) => (value === undefined ? undefined : value || null);

const optionalText = (max) =>
  z.string().trim().max(max).nullish().transform(blankToNull);

// Rich-text (HTML) fields are kept as written.
const optionalHtml = z
  .string()
  .nullish()
  .transform((value) =>
    value === undefined ? undefined : value && value.trim() ? value : null,
  );

// No defaults here on purpose: the same fields are reused (as partial) for
// updates, and a default would overwrite values the request did not send.
const caseStudyFields = {
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
  client_name: optionalText(200),
  industry: optionalText(120),
  challenge: optionalHtml,
  solution: optionalHtml,
  result: optionalHtml,
  cover_image: optionalText(500),
  tags: z
    .array(z.string())
    .transform((list) =>
      [...new Set(list.map((tag) => tag.trim()).filter(Boolean))],
    ),
  is_published: z.boolean(),
};

const base = z.object(caseStudyFields);

export const caseStudyCreateSchema = base
  .partial()
  .extend({ title: caseStudyFields.title });

export const caseStudyUpdateSchema = base.partial();
