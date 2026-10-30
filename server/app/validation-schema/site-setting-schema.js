import { z } from "zod";
import { NAV_PRIMARY_KEYS } from "../helpers/site-navigation.js";

// Navigation value: { primary: [...], footer: [...] }. Hrefs are locale-less
// paths ("/services/..."), "#" links or full web addresses.

const href = z
  .string("Link is required")
  .trim()
  .min(1, "Link is required")
  .max(500)
  .refine(
    (value) => /^(?:\/(?!\/)|#|https?:\/\/|mailto:|tel:)/i.test(value) && !/\s/.test(value),
    "Link must start with / (a page on this site), # , https://, mailto: or tel:",
  );

const label = z.string("Label is required").trim().min(1, "Label is required").max(60);

// Optional Hindi label: blank = not set.
const optionalLabel = z
  .string()
  .trim()
  .max(60)
  .nullish()
  .transform((value) => value || undefined);

const child = z.object({ label, label_hi: optionalLabel, href });

const primaryItem = z.object({
  key: z
    .string("Key is required")
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Key may only contain lowercase letters, numbers and hyphens")
    .max(60),
  label,
  label_hi: optionalLabel,
  href,
  visible: z.boolean().default(true),
  children: z.array(child).max(12).optional(),
});

const footerLink = z.object({ label, label_hi: optionalLabel, href, visible: z.boolean().default(true) });

const footerColumn = z.object({
  heading: label,
  heading_hi: optionalLabel,
  links: z.array(footerLink).max(20),
});

export const navigationSchema = z
  .object({
    primary: z.array(primaryItem).min(1).max(12),
    footer: z.array(footerColumn).max(8).default([]),
  })
  .superRefine((value, ctx) => {
    const keys = value.primary.map((item) => item.key);
    const seen = new Set();
    keys.forEach((key, index) => {
      if (seen.has(key)) {
        ctx.addIssue({ code: "custom", path: ["primary", index, "key"], message: `"${key}" is used twice` });
      }
      seen.add(key);
      if (!NAV_PRIMARY_KEYS.includes(key) && !key.startsWith("custom-")) {
        ctx.addIssue({
          code: "custom",
          path: ["primary", index, "key"],
          message: `Extra links must have a key that starts with "custom-" (got "${key}")`,
        });
      }
    });
    NAV_PRIMARY_KEYS.filter((key) => !seen.has(key)).forEach((key) =>
      ctx.addIssue({
        code: "custom",
        path: ["primary"],
        message: `The "${key}" menu item is required (hide it instead of removing it)`,
      }),
    );
  });

// setting key -> schema
export const settingSchemas = { navigation: navigationSchema };
