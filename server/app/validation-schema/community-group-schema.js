import { z } from "zod";

// Pages a group can be shown on.
export const COMMUNITY_PLACEMENTS = ["home", "industries", "resources", "advisers", "schemes"];

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
const communityGroupFields = {
  name: z.string("Name is required").trim().min(1, "Name is required").max(200),
  audience: optionalText(255),
  // What members receive, one bullet per line.
  updates: optionalText(5000),
  cadence: optionalText(200),
  // Empty until the group has an invite link; the website then shows "coming soon".
  join_url: optionalUrl,
  placements: z
    .array(z.enum(COMMUNITY_PLACEMENTS, "Pick valid pages"))
    .transform((list) => [...new Set(list)]),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int().min(0),
};

const base = z.object(communityGroupFields);

// Create: only the name is required.
export const communityGroupCreateSchema = base
  .partial()
  .extend({ name: communityGroupFields.name });

// Update: send only what changed.
export const communityGroupUpdateSchema = base.partial();
