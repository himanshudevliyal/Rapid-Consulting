import { asArray, asText } from "@/lib/content/site-page-adapters";

// Helpers for the views that draw a "managed" site page (Resources hub, scheme
// directory, case archive): the text comes from the page's sections, and every
// read falls back to the view's own wording when the page, the section or the
// field is missing or empty. Nothing here throws.

/** A text field, or the fallback when it is missing / empty. */
export const mt = (value, fallback = "") => asText(value) || fallback;

/** The object rows of a list field. */
export const rowsOf = (value) => asArray(value).filter((item) => item && typeof item === "object" && !Array.isArray(item));

/** The `text` of each row of a [{ text }] list (chips, options), empty ones dropped. */
export const textsOf = (value) => rowsOf(value).map((item) => asText(item.text)).filter(Boolean);

/** Fill {name} tokens of a template; tokens without a value stay as they are. */
export const fillTokens = (template, values) =>
  String(template).replace(/\{(\w+)\}/g, (whole, key) => (key in values ? String(values[key]) : whole));

/** "What it pays back:" -> "What it pays back" (the filter rows draw their own label style). */
export const stripColon = (text) => asText(text).replace(/\s*:\s*$/, "");

/** A section's data object (never null). */
export const dataOf = (managed, key) => managed?.get?.(key) ?? {};

/** The page record with the managed title / meta fields laid over the built-in ones (for contentPageMetadata and the H1). */
export function withManagedMeta(page, managed) {
  const own = managed?.page;
  if (!own) return page;
  return {
    ...page,
    title: own.title || page.title,
    metaTitle: own.metaTitle || page.metaTitle,
    description: own.metaDescription || page.description,
  };
}

/** The hero heading: the managed hero's heading, else the page H1. */
export const heroHeading = (managed, page) => mt(dataOf(managed, "hero").heading, "") || mt(managed?.page?.h1, "") || page.h1;

/** The hero introduction: managed text (plain), else the built-in HTML. */
export const heroIntro = (managed, page) => mt(dataOf(managed, "hero").intro, "") || page.introHtml;

/**
 * Lay the managed `closing` section over the props of an enquiry card
 * (b2d-forms.enquiryCard). The choice (select) is replaced only when the
 * section gives both a label and options; otherwise the view's own stays.
 */
export function closingCard(data, base) {
  const d = data || {};
  const options = textsOf(d.select_options);
  const selectLabel = mt(d.select_label);
  const flag = (value, fallback = true) => (value === undefined || value === null || value === "" ? fallback : value === true || value === "true");
  const fields = base.fields ?? ["district", "activity"];
  const shown = fields.filter((field) => (field === "district" ? flag(d.show_district) : field === "activity" ? flag(d.show_activity) : true));
  return {
    ...base,
    title: mt(d.form_title, base.title),
    hint: mt(d.form_hint) || base.hint,
    seal: flag(d.show_seal) ? base.seal : "none",
    sealLabel: mt(d.badge_text).replace(/\s*\/\s*/, " ") || base.sealLabel,
    fields: shown,
    select:
      selectLabel && options.length
        ? { label: selectLabel, required: flag(d.select_required, false), placeholder: mt(d.select_placeholder, "Choose one"), options }
        : base.select,
    labels: {
      ...base.labels,
      name: mt(d.name_label, base.labels.name),
      phone: mt(d.phone_label, base.labels.phone),
      district: mt(d.district_label, base.labels.district),
      activity: mt(d.activity_label, base.labels.activity),
      optional: mt(d.optional_label, base.labels.optional),
      consent: mt(d.consent_label, base.labels.consent),
    },
    // Not drawn by every version of the card yet; passed along for when it is.
    placeholders: {
      name: mt(d.name_placeholder),
      phone: mt(d.phone_placeholder),
      district: mt(d.district_placeholder),
      activity: mt(d.activity_placeholder),
      select: mt(d.select_placeholder),
    },
    requiredLabel: mt(d.required_label),
    submitLabel: mt(d.submit_label, base.submitLabel),
    helper: mt(d.helper) || base.helper,
    whatsappLabel: mt(d.whatsapp_label, base.whatsappLabel),
  };
}
