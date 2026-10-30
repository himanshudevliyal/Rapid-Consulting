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

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .nullish()
  .transform(blankToNull)
  .refine(
    (value) => value === undefined || value === null || /^https?:\/\//i.test(value),
    "Enter a full link starting with http:// or https://",
  );

// A date and time ("2026-11-05T15:00:00+05:30", or a datetime-local value);
// "" / null = not set yet.
const optionalDateTime = z
  .string()
  .trim()
  .nullish()
  .transform((value) => (value === undefined ? undefined : value || null))
  .refine(
    (value) => value === undefined || value === null || !Number.isNaN(new Date(value).getTime()),
    "Enter a valid date and time",
  )
  .transform((value) => (value ? new Date(value) : value));

// Whole minutes; "" / null = not set.
const optionalMinutes = z
  .union([z.literal(""), z.coerce.number().int("Enter whole minutes").min(0).max(1440)])
  .nullish()
  .transform((value) => (value === undefined ? undefined : value === "" ? null : value));

// No defaults on purpose: the same fields are reused (as partial) for
// updates, and a default would overwrite values the request did not send.
const sessionFields = {
  title: z.string("Title is required").trim().min(1, "Title is required").max(255),
  slug: z
    .string()
    .trim()
    .max(300)
    .regex(slugPattern, "Slug may only contain lowercase letters, numbers and hyphens")
    .optional(),
  topic: optionalText(255),
  audience: optionalText(255),
  summary: optionalHtml,
  speaker_name: optionalText(160),
  speaker_title: optionalText(200),
  starts_at: optionalDateTime,
  duration_minutes: optionalMinutes,
  registration_url: optionalUrl,
  registration_open: z.boolean(),
  recording_url: optionalUrl,
  // One resource per line: "Title | https://url".
  related_resources: optionalText(5000),
  cover_image: optionalText(500),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().min(0),
};

const base = z.object(sessionFields);

// Create: only the title is required.
export const sessionCreateSchema = base.partial().extend({ title: sessionFields.title });

// Update: send only what changed.
export const sessionUpdateSchema = base.partial();
