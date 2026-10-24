import { z } from "zod";
import { validIndianPhone } from "@/lib/contact-validation";

// Validation of the website enquiry forms (React Hook Form + zodResolver).
// `t` is the next-intl translator, so the messages follow the visitor's language.
// The limits match the API (server/app/validation-schema/enquiry-schema.js).

const optionalText = (max, t) =>
  z.string().trim().max(max, t("contact.tooLong"));

const nameField = (t) =>
  z.string().trim().min(1, t("contact.nameError")).max(120, t("contact.tooLong"));

const phoneField = (t) =>
  z
    .string()
    .trim()
    .refine((value) => validIndianPhone(value), t("contact.phoneError"))
    .refine((value) => value.length <= 20, t("contact.tooLong"));

const emailField = (t) =>
  z.string().trim().min(1, t("contact.emailError")).email(t("contact.emailError")).max(200, t("contact.tooLong"));

// Honeypot: real visitors never fill it (it is hidden); bots do.
const honeypot = z.string().optional();

// "Request a callback" / service enquiry -> POST /enquiries
export const createEnquirySchema = (t) =>
  z.object({
    name: nameField(t),
    phone: phoneField(t),
    location: optionalText(200, t),
    subject: optionalText(255, t),
    requirement: optionalText(2000, t),
    website: honeypot,
  });

// Contact Us -> POST /contact-enquiries
export const createContactSchema = (t) =>
  z.object({
    name: nameField(t),
    email: emailField(t),
    phone: phoneField(t),
    location: optionalText(200, t),
    subject: optionalText(255, t),
    message: z.string().trim().min(1, t("contact.messageError")).max(5000, t("contact.tooLong")),
    website: honeypot,
  });

export const ENQUIRY_DEFAULTS = { name: "", phone: "", location: "", subject: "", requirement: "", website: "" };
export const CONTACT_DEFAULTS = { name: "", email: "", phone: "", location: "", subject: "", message: "", website: "" };
