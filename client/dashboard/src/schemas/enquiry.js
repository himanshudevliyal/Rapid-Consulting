import { z } from "zod";

export const ENQUIRY_STATUSES = [
  { value: "new", label: "New" },
  { value: "in-progress", label: "In progress" },
  { value: "resolved", label: "Resolved" },
  { value: "spam", label: "Spam" },
];

// What the admin can change on an enquiry: its status and internal notes.
export const enquiryUpdateSchema = z.object({
  status: z.enum(["new", "in-progress", "resolved", "spam"]),
  notes: z.string().max(5000, "Max 5000 characters"),
});
