import { z } from "zod";

// Shared by the Format and Family / topic option lists.
const codePattern = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

const common = {
  name: z.string().trim().min(1, "Name is required").max(160, "Name is too long"),
  description: z.string().trim().max(1000, "Description is too long").nullish(),
  is_active: z.boolean().optional(),
};

const code = z
  .string()
  .trim()
  .min(1, "Code is required")
  .max(40, "Code is too long")
  .regex(
    codePattern,
    "Code may only contain letters, numbers, hyphens and underscores",
  );

// Create: only the name is required; the code is made from it unless one is given. Extra fields (for example `icon`) are
// passed in by each list.
export const lookupCreateSchema = (extra = {}) =>
  z.object({
    code: code.optional(),
    ...common,
    sort_order: z.coerce.number().int().optional().default(0),
    ...extra,
  });

// Update: every field is optional; the code is checked in the controller
// because it can never change.
export const lookupUpdateSchema = (extra = {}) =>
  z.object({
    code: code.optional(),
    name: common.name.optional(),
    description: common.description,
    is_active: common.is_active,
    sort_order: z.coerce.number().int().optional(),
    ...extra,
  });
