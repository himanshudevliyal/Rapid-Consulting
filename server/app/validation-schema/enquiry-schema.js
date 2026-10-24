import { z } from "zod";

// What the public forms may send and what the admin may change. Each field is
// trimmed; "" means "not given" (stored as null).

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
// Indian mobile number: ten digits starting 6-9, optionally with +91.
const PHONE = /^(?:\+91)?[6-9]\d{9}$/;

const blankToNull = (value) => (value === undefined ? undefined : value || null);

const optionalText = (max) =>
  z.string().trim().max(max, `Use at most ${max} characters.`).nullish().transform(blankToNull);

const requiredText = (label, max) =>
  z
    .string(`${label} is required.`)
    .trim()
    .min(1, `${label} is required.`)
    .max(max, `Use at most ${max} characters.`);

export const phoneField = z
  .string("Phone number is required.")
  .trim()
  .min(1, "Phone number is required.")
  .max(20, "Use at most 20 characters.")
  .refine((value) => /^[+\d\s()-]+$/.test(value) && PHONE.test(value.replace(/[\s()-]/g, "")), {
    message: "Enter a 10-digit Indian mobile number, optionally with +91.",
  });

export const optionalEmailField = z
  .string()
  .trim()
  .max(200, "Use at most 200 characters.")
  .nullish()
  .transform(blankToNull)
  .refine((value) => value == null || EMAIL.test(value), "Enter a valid email address.");

export const requiredEmailField = z
  .string("Email is required.")
  .trim()
  .min(1, "Email is required.")
  .max(200, "Use at most 200 characters.")
  .refine((value) => EMAIL.test(value), "Enter a valid email address.");

// Where the form was shown: page title, page address, page / service code and
// the service or product it was about. All optional; sent by the website.
export const pageFields = {
  page_title: optionalText(255),
  page_url: optionalText(500),
  page_id: optionalText(100),
};

const source = z
  .string()
  .trim()
  .max(60)
  .regex(/^[a-z0-9-]+$/, "Invalid source.")
  .optional();

// Hidden "website" field: people leave it empty, form-filling bots do not.
const honeypot = z.string().optional();

export const STATUSES = ["new", "in-progress", "resolved", "spam"];

// ── Service / callback enquiry (table `enquiries`) ───────────────────────────

export const enquiryCreateSchema = z.object({
  name: requiredText("Name", 120),
  phone: phoneField,
  email: optionalEmailField,
  location: optionalText(200),
  subject: optionalText(255),
  requirement: optionalText(2000),
  service_name: optionalText(255),
  ...pageFields,
  source,
  website: honeypot,
});

// ── Contact Us (table `contact_enquiries`) ───────────────────────────────────

export const contactEnquiryCreateSchema = z.object({
  name: requiredText("Name", 120),
  email: requiredEmailField,
  phone: phoneField,
  location: optionalText(200),
  subject: optionalText(255),
  message: requiredText("Message", 5000),
  ...pageFields,
  source,
  website: honeypot,
});

// ── Admin: status and internal notes only ────────────────────────────────────

export const enquiryAdminUpdateSchema = z.object({
  status: z.enum(STATUSES, "Choose a valid status.").optional(),
  notes: z
    .string()
    .trim()
    .max(5000, "Use at most 5000 characters.")
    .nullish()
    .transform(blankToNull),
});
