import { staffMemberRoles } from "@/data";
import z from "zod";

export const userOrganizationSchema = z.object({
  user_role: z.enum(staffMemberRoles.map((r) => r.value)),
  user_id: z.string().uuid({ message: "Invalid User ID." }),
  org_id: z.string().uuid({ message: "Invalid organization ID." }),
});
