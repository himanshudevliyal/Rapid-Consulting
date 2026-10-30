import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// "" means "cleared" (stored as null); a field that was not sent stays
// undefined so an update never touches it.
const blankToNull = (value) => (value === undefined ? undefined : value || null);

const optionalText = (max) =>
  z.string().trim().max(max).nullish().transform(blankToNull);

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

// No defaults on purpose: the same fields are reused (as partial) for
// updates, and a default would overwrite values the request did not send.
const adviserFields = {
  name: z.string("Name is required").trim().min(1, "Name is required").max(160),
  // Profile address; left blank it is made from the name.
  slug: z
    .union([
      z.literal(""),
      z
        .string()
        .trim()
        .max(200)
        .regex(slugPattern, "Slug may only contain lowercase letters, numbers and hyphens"),
    ])
    .nullish()
    .transform(blankToNull),
  designation: optionalText(200),
  team_group: optionalText(100),
  bio: optionalText(5000),
  // Areas of expertise, one per line.
  expertise: optionalText(5000),
  photo: optionalText(500),
  linkedin_url: optionalUrl,
  display_order: z.coerce.number().int().min(0),
  is_active: z.boolean(),
  // A labelled stand-in until the real person's details arrive.
  is_placeholder: z.boolean(),
};

const base = z.object(adviserFields);

// Create: only the name is required.
export const adviserCreateSchema = base.partial().extend({ name: adviserFields.name });

// Update: send only what changed.
export const adviserUpdateSchema = base.partial();
