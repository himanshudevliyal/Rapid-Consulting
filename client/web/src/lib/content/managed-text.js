import { defaultLocale } from "@/i18n/routing";
import { asArray, asText } from "./site-page-adapters";
import { loadManagedPage } from "./site-page-data";

// Helpers for the views that draw a managed page (About, Contact, How we work,
// Home): the text comes from the page, the layout from the view. An empty field
// is "not supplied": the view keeps its own wording (never an empty heading).

export const text = asText;
export const rows = (value) => asArray(value).filter((item) => item && typeof item === "object");
export const texts = (value) => rows(value).map((item) => asText(item.text)).filter(Boolean);
export const first = (...values) => values.map(asText).find(Boolean) || "";

const fill = (value, values) =>
  values ? String(value).replace(/\{(\w+)\}/g, (whole, key) => (key in values ? String(values[key]) : whole)) : value;

// A text function `(key, values) => string` that answers from `own` (a map of
// key -> managed text) when the entry is not empty and from `base` otherwise.
export function overlayText(base, own) {
  return (key, values) => {
    const value = own?.[key];
    return typeof value === "string" && value.trim() ? fill(value.trim(), values) : base(key, values);
  };
}

// The managed page for a view. A page that is not published in the visitor's
// language is not used for a non-default language (the view's own approved
// translation stays); null when there is no managed page at all.
export async function loadManaged(path, locale) {
  const managed = await loadManagedPage(path, locale);
  if (!managed) return null;
  if (locale !== defaultLocale && managed.page.locale !== locale) return null;
  return managed;
}

// Page metadata: the managed title / description over the view's own.
export function withManagedMeta(base, managed) {
  const page = managed?.page;
  if (!page || !base) return base;
  const title = page.metaTitle;
  const description = page.metaDescription;
  if (!title && !description) return base;
  const out = { ...base };
  if (title) {
    out.title = { absolute: title };
    out.openGraph = { ...base.openGraph, title };
    out.twitter = { ...base.twitter, title };
  }
  if (description) {
    out.description = description;
    out.openGraph = { ...(out.openGraph ?? base.openGraph), description };
    out.twitter = { ...(out.twitter ?? base.twitter), description };
  }
  return out;
}

// "Home" -> "/en", "/approvals" -> "/en/approvals", "" -> self, absolute / hash / tel kept.
export function localHref(href, locale, self = "") {
  const value = asText(href);
  if (!value) return self;
  if (/^(https?:|mailto:|tel:|#)/i.test(value)) return value;
  if (value === "/") return `/${locale}`;
  if (new RegExp(`^/(en|hi)(/|$)`).test(value)) return value;
  return value.startsWith("/") ? `/${locale}${value}` : value;
}

// Breadcrumb items for the Breadcrumbs component from a hero's breadcrumb list.
export function crumbsFrom(list, locale, selfHref, fallback) {
  const items = rows(list)
    .map((item) => ({ label: asText(item.label), href: localHref(item.href, locale, selfHref) }))
    .filter((item) => item.label);
  return items.length ? items : fallback;
}

// Plain text with blank-line paragraphs -> a list of paragraphs.
export const paragraphs = (value) =>
  asText(value)
    .split(/\n\s*\n/)
    .map((part) => part.trim())
    .filter(Boolean);

// Shared form wording of a page_hero (card_kind=form) or closing_panel as props
// for FigmaEnquiryCard. Only supplied fields are returned, so they can be spread
// over the view's own defaults with `mergeCard`.
export function managedCardProps(data = {}) {
  const pick = (entries) => Object.fromEntries(entries.filter(([, value]) => asText(value)).map(([key, value]) => [key, asText(value)]));
  const labels = pick([
    ["name", data.name_label],
    ["phone", data.phone_label],
    ["district", data.district_label],
    ["site", data.location_label],
    ["activity", data.activity_label],
    ["optional", data.optional_label],
    ["required", data.required_label],
    ["consent", data.consent_label],
  ]);
  const placeholders = pick([
    ["name", data.name_placeholder],
    ["phone", data.phone_placeholder],
    ["district", data.district_placeholder],
    ["site", data.location_placeholder],
    ["activity", data.activity_placeholder],
  ]);
  const options = texts(data.select_options);
  return {
    ...pick([
      ["sealLabel", data.badge_text],
      ["submitLabel", data.submit_label],
      ["helper", data.helper],
      ["whatsappLabel", data.whatsapp_label],
    ]),
    labels,
    placeholders,
    select: pick([
      ["label", data.select_label],
      ["placeholder", data.select_placeholder],
    ]),
    options,
  };
}

// Merge managed form wording over a view's defaults.
export function mergeCard(base, extra) {
  const { labels = {}, placeholders = {}, select = {}, options = [], ...rest } = extra ?? {};
  const merged = {
    ...base,
    ...rest,
    labels: { ...base.labels, ...labels },
    placeholders: { ...base.placeholders, ...placeholders },
  };
  if (base.select || select.label) {
    merged.select = {
      required: true,
      ...base.select,
      ...select,
      options: options.length ? options : base.select?.options ?? [],
    };
    if (!merged.select.label || !merged.select.options.length) merged.select = base.select;
  }
  return merged;
}
