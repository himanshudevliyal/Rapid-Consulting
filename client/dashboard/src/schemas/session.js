import { z } from "zod";

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const urlPattern = /^https?:\/\/\S+$/i;
const urlMessage = "Enter a full URL starting with https://";

// What the website shows for a session (computed by the API).
export const SESSION_STATES = {
  upcoming: { label: "Upcoming", variant: "default" },
  recording: { label: "Recording", variant: "secondary" },
  closed: { label: "Closed", variant: "outline" },
};

// related_resources: one "Title | https://url" per line.
const resourcesOk = (value) =>
  value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .every((line) => {
      const [title, ...rest] = line.split("|");
      return title.trim() && urlPattern.test(rest.join("|").trim());
    });

export const sessionFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255, "Max 255 characters"),
  // Empty = made from the title when the session is created.
  slug: z
    .string()
    .trim()
    .max(300, "Max 300 characters")
    .refine((v) => !v || slugPattern.test(v), "Use lowercase letters, numbers and hyphens only"),
  topic: z.string().trim().max(255, "Max 255 characters"),
  audience: z.string().trim().max(255, "Max 255 characters"),
  summary: z.string(),
  speaker_name: z.string().trim().max(160, "Max 160 characters"),
  speaker_title: z.string().trim().max(200, "Max 200 characters"),
  // Local date and time from a datetime-local input ("" = not set).
  starts_at: z.string().refine((v) => !v || !Number.isNaN(new Date(v).getTime()), "Enter a valid date and time"),
  duration_minutes: z
    .string()
    .trim()
    .refine((v) => !v || (/^\d+$/.test(v) && Number(v) > 0), "Enter minutes as a whole number"),
  registration_url: z
    .string()
    .trim()
    .max(500, "Max 500 characters")
    .refine((v) => !v || urlPattern.test(v), urlMessage),
  registration_open: z.boolean(),
  recording_url: z
    .string()
    .trim()
    .max(500, "Max 500 characters")
    .refine((v) => !v || urlPattern.test(v), urlMessage),
  related_resources: z
    .string()
    .refine(resourcesOk, "Each line must be: Title | https://link"),
  cover_image: z.string().trim().max(500, "Max 500 characters"),
  is_active: z.boolean(),
  sort_order: z.coerce.number().int("Whole number").min(0, "0 or more"),
});
