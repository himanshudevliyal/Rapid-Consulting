import { z } from "zod";

// Where on the website a group can be shown.
export const PLACEMENTS = [
  { value: "home", label: "Home page" },
  { value: "industries", label: "Industries" },
  { value: "resources", label: "Resources" },
  { value: "advisers", label: "Advisers / About" },
  { value: "schemes", label: "Schemes" },
];

export const communityGroupFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Max 200 characters"),
  audience: z.string().trim().max(255, "Max 255 characters"),
  // One bullet per line: what members receive.
  updates: z.string().max(5000, "Max 5000 characters"),
  cadence: z.string().trim().max(200, "Max 200 characters"),
  // May be empty (the group is shown without a join button).
  join_url: z
    .string()
    .trim()
    .max(500, "Max 500 characters")
    .refine((v) => !v || /^https?:\/\/\S+$/i.test(v), "Enter a full URL starting with https://"),
  placements: z.array(z.enum(["home", "industries", "resources", "advisers", "schemes"])),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int("Whole number").min(0, "0 or more"),
});
