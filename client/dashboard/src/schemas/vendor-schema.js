import { z } from "zod";

export const vendorSchema = z.object({
  org_id: z
    .string()
    .uuid("Invalid organization ID")
    .or(z.literal(""))
    .optional(),
  company_name: z.string().min(2, "Company name must be at least 2 characters"),
  gstin: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)",
    ),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: "Invalid PAN format (e.g. AAAAA0000A)",
  }),
  address: z.string().optional(),
  vendor_type: z.enum(["material", "logistics"], {
    required_error: "Vendor type is required",
  }),
  payment_terms: z.string().optional(),
  is_active: z.boolean().default(true),
});
