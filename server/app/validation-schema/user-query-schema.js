import { z } from "zod";

export const REASON_FOR_CONTACT = [
  "domestic_sales_enquiry",
  "export_sales_enquiry",
  "after_sales_services",
  "career",
  "become_a_vendor",
];

export const userQuerySchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.email({ message: "Invalid email address" }),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().optional().or(z.literal("")),

  reason: z.enum(REASON_FOR_CONTACT, {
    message: "Please select a reason for contact",
  }),

  // Optional reference image/PDF, already uploaded via /upload/files.
  attachment: z.string().optional().or(z.literal("")),
});