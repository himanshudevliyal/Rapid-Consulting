import z from "zod";

export const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required"),
  gstin: z
    .string()
    .regex(
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
      "Invalid GSTIN format (e.g. 22AAAAA0000A1Z5)",
    ),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, {
    message: "Invalid PAN format (e.g. AAAAA0000A)",
  }),
  address: z.string().min(1, "Organization address is required"),
  industry: z.string().min(1, "Organization industry is required"),
});
