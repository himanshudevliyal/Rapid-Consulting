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

// "2026-12-31" (or a full ISO date, cut to its day); "" / null = no closing date.
const optionalDate = z
  .string()
  .trim()
  .nullish()
  .transform((value) => (value === undefined ? undefined : value ? value.slice(0, 10) : null))
  .refine(
    (value) => value === undefined || value === null || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Closing date must be a valid date",
  );

// No defaults on purpose: the same fields are reused (as partial) for
// updates, and a default would overwrite values the request did not send.
const jobFields = {
  title: z.string("Title is required").trim().min(1, "Title is required").max(255),
  slug: z
    .string()
    .trim()
    .max(300)
    .regex(slugPattern, "Slug may only contain lowercase letters, numbers and hyphens")
    .optional(),
  job_type: z.enum(["full-time", "part-time", "contract", "internship", "remote"]),
  location: optionalText(200),
  experience: optionalText(100),
  description: optionalHtml,
  responsibilities: optionalHtml,
  requirements: optionalHtml,
  closing_date: optionalDate,
  is_active: z.boolean(),
};

const base = z.object(jobFields);

// Create: only the title is required.
export const jobCreateSchema = base.partial().extend({ title: jobFields.title });

// Update: send only what changed.
export const jobUpdateSchema = base.partial();
