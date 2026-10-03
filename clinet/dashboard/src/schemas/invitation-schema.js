import { z } from "zod";

export const invitationSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),

  org_id: z.string().uuid("Invalid organization ID"),

  role: z.string().min(1, "Role is required").max(50, "Role too long"),
});
