import { z } from "zod";

const inquiryProductSchema = z.object({
  product_id: z.uuid({ message: "Invalid product id" }),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .positive("Quantity must be greater than 0"),
});

export const productInquirySchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters")
    .max(150, "Full name is too long"),

  company_name: z
    .string()
    .trim()
    .max(150, "Company name is too long")
    .optional()
    .or(z.literal("")),

  email: z.email({ message: "Invalid email address" }),

  contact_number: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit contact number"),

  city: z.string().trim().min(2, "City is required").max(100),

  state: z.string().trim().min(2, "State is required").max(100),

  message: z.string().trim().max(2000, "Message is too long").optional().or(z.literal("")),

  products: z
    .array(inquiryProductSchema)
    .min(1, "At least one product is required"),
});
