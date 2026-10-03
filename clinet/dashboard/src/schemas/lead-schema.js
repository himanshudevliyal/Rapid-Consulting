import { z } from "zod";

export const leadSchema = z.object({
  fullname: z.string().min(2, "Fullname must be at least 2 characters"),

  email: z.string().email("Invalid email address"),

  mobile_number: z.string().min(8, "Invalid mobile number"),

  assigned_to: z.string().uuid({ message: "Select assign to." }).min(),
});
