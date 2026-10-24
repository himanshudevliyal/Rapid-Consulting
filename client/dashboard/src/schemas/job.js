import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "remote", label: "Remote" },
];

export const jobFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Max 255 characters"),
  // Empty = made from the title when the job is created.
  slug: z
    .string()
    .trim()
    .max(300, "Max 300 characters")
    .refine((v) => !v || slugPattern.test(v), "Use lowercase letters, numbers and hyphens only"),
  job_type: z.enum(["full-time", "part-time", "contract", "internship", "remote"]),
  location: z.string().trim().max(200, "Max 200 characters"),
  experience: z.string().trim().max(100, "Max 100 characters"),
  closing_date: z.string().refine((v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v), "Enter a valid date"),
  description: z.string(),
  responsibilities: z.string(),
  requirements: z.string(),
  is_active: z.boolean(),
});
