// Helpers for the Site pages editor: labels, ids, anchors, section objects
// and the checks shown before a page is submitted or published. The blocks
// and templates themselves come from the server registry
// (GET /site-pages/registry); nothing about a block is hard-coded here.

export const TEMPLATE_KEYS = ["hub", "situation", "campaign", "resource", "service", "profile", "scheme", "managed"];

export const LOCALES = [
  { value: "en", label: "English", short: "EN" },
  { value: "hi", label: "Hindi", short: "HI" },
];

export const localeLabel = (locale) => LOCALES.find((item) => item.value === locale)?.label ?? locale ?? "";
export const otherLocale = (locale) => (locale === "hi" ? "en" : "hi");

export const PAGE_STATUSES = {
  draft: { label: "Draft", className: "border-transparent bg-secondary text-secondary-foreground" },
  review: { label: "In review", className: "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  published: { label: "Published", className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  archived: { label: "Archived", className: "border-transparent bg-muted text-muted-foreground" },
};

export const TRANSLATION_STATUSES = {
  not_needed: { label: "Translation not needed", className: "border-transparent bg-muted text-muted-foreground" },
  missing: { label: "Translation missing", className: "border-red-500/40 bg-red-500/15 text-red-700 dark:text-red-300" },
  needs_review: { label: "Translation needs review", className: "border-amber-500/40 bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  reviewed: { label: "Translation reviewed", className: "border-emerald-500/40 bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
};

export const TRANSLATION_STATUS_OPTIONS = Object.entries(TRANSLATION_STATUSES).map(([value, item]) => ({
  value,
  label: item.label,
}));

export const PAGE_STATUS_OPTIONS = Object.entries(PAGE_STATUSES).map(([value, item]) => ({
  value,
  label: item.label,
}));

// First path segments the website already uses; a page cannot start with one.
export const RESERVED_FIRST_SEGMENTS = [
  "services",
  "industries",
  "schemes",
  "articles",
  "guides",
  "case-studies",
  "careers",
  "contact",
  "about",
  "resources",
  "advisers",
  "sessions",
  "team",
  "p",
  "api",
  "subsidy-viability-report",
  "how-we-work",
  "preview",
  "en",
  "hi",
  "_next",
  "sitemap.xml",
  "robots.txt",
  "home",
];

// Pages of the Managed template: the website's own pages (their text is
// edited here), so they sit at these normally reserved paths.
export const MANAGED_PATHS = ["about", "contact", "resources", "schemes", "case-studies", "how-we-work", "home"];

export const PATH_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:\/[a-z0-9]+(?:-[a-z0-9]+)*)*$/;

// Admin edit page of each linked record type (shown as "edit the record").
export const RECORD_EDIT_ROUTES = {
  scheme: (id) => `/schemes/${id}/edit`,
  case_study: (id) => `/case-studies/${id}/edit`,
  article: (id) => `/articles/${id}/edit`,
  adviser: (id) => `/advisers/${id}/edit`,
  service: (id) => `/services/${id}/edit`,
  industry: (id) => `/industries/${id}/edit`,
};

export const slugifyText = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// Section ids are uuids.
export const newId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = (Math.random() * 16) | 0;
    return (char === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
};

export const deepClone = (value) => (value === undefined ? undefined : JSON.parse(JSON.stringify(value)));

// An anchor not used by another section.
export const uniqueAnchor = (base, taken) => {
  const root = slugifyText(base) || "section";
  if (!taken.has(root)) return root;
  let counter = 2;
  while (taken.has(`${root}-${counter}`)) counter += 1;
  return `${root}-${counter}`;
};

export const anchorsOf = (sections, exceptId = null) =>
  new Set(sections.filter((section) => section.id !== exceptId && section.anchor).map((section) => section.anchor));

// Blank value for a registry field.
export const emptyValue = (field) => {
  switch (field.kind) {
    case "boolean":
      return false;
    case "list":
      return [];
    case "record":
      return field.multiple ? [] : null;
    case "number":
      return null;
    default:
      return "";
  }
};

// A new list item: an object of blank fields, or "" when the list has no item fields.
export const emptyListItem = (field) => {
  if (!Array.isArray(field.item_fields) || field.item_fields.length === 0) return "";
  return Object.fromEntries(field.item_fields.map((item) => [item.key, emptyValue(item)]));
};

// Fields of a block with values, filled from the registry defaults.
const dataFor = (block) => {
  const data = deepClone(block?.defaults ?? {}) ?? {};
  for (const field of block?.fields ?? []) {
    if (data[field.key] === undefined) data[field.key] = emptyValue(field);
  }
  return data;
};

export const clip = (value, max) => String(value ?? "").slice(0, max);

// A new section of a block type, appended or inserted by the caller.
export const blankSection = (type, block, sections) => {
  const label = clip(block?.label ?? type, 40);
  return {
    id: newId(),
    type,
    variant: block?.variants?.[0]?.key ?? "",
    visible: true,
    label,
    anchor: uniqueAnchor(label, anchorsOf(sections)),
    data: dataFor(block),
  };
};

// A copy with a new id, an unused anchor and the same content. Hidden stays hidden.
export const duplicateSection = (section, sections) => {
  const label = clip(`${section.label || "Section"} copy`, 40);
  return {
    ...deepClone(section),
    id: newId(),
    label,
    anchor: uniqueAnchor(section.anchor || label, anchorsOf(sections)),
  };
};

// Moves one item of an array; returns a new array.
export const moveItem = (items, from, to) => {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const next = items.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

// Whether a field value counts as filled in.
export const hasValue = (field, value) => {
  switch (field.kind) {
    case "boolean":
      return true;
    case "number":
      return value !== null && value !== undefined && value !== "";
    case "list":
    case "record":
      if (Array.isArray(value)) return value.length > 0;
      return !!value;
    case "html":
      return String(value ?? "").replace(/<[^>]*>/g, "").trim().length > 0 || /<(img|iframe|video)/i.test(String(value ?? ""));
    default:
      return String(value ?? "").trim().length > 0;
  }
};

// Names of required fields that are empty in a section.
export const missingRequired = (section, block) => {
  const missing = [];
  for (const field of block?.fields ?? []) {
    if (field.required && !hasValue(field, section?.data?.[field.key])) missing.push(field.label);
  }
  return missing;
};

// Checks on the whole composition: [{ level: "error" | "warn", message }].
// Errors would stop publishing on the server; warnings are advice.
export const pageChecks = ({ template, sections, registry }) => {
  const checks = [];
  const config = registry?.templates?.[template];
  if (!config) return checks;
  const blocks = registry?.blocks ?? {};

  if (sections.length === 0) {
    checks.push({ level: "warn", message: "No sections yet. A page needs at least its first section to be published." });
    return checks;
  }

  if (config.first && sections[0]?.type !== config.first) {
    checks.push({
      level: "error",
      message: `${blocks[config.first]?.label ?? config.first} must be the first section.`,
    });
  }
  for (const type of config.required ?? []) {
    const found = sections.filter((section) => section.type === type);
    if (found.length === 0) {
      checks.push({ level: "error", message: `${blocks[type]?.label ?? type} is required on this template.` });
    } else if (!found.some((section) => section.visible !== false)) {
      checks.push({ level: "error", message: `${blocks[type]?.label ?? type} is required, but it is hidden.` });
    }
  }

  const seen = new Set();
  const duplicated = new Set();
  for (const section of sections) {
    if (!section.anchor) continue;
    if (seen.has(section.anchor)) duplicated.add(section.anchor);
    seen.add(section.anchor);
  }
  for (const anchor of duplicated) {
    checks.push({ level: "error", message: `Two sections use the anchor "${anchor}". Anchors must be unique.` });
  }

  sections.forEach((section, index) => {
    const block = blocks[section.type];
    if (!block) {
      checks.push({ level: "error", message: `Section ${index + 1} uses an unknown block "${section.type}".` });
      return;
    }
    if (Array.isArray(config.allowed) && !config.allowed.includes(section.type)) {
      checks.push({ level: "error", message: `${block.label} is not allowed on the ${config.label ?? template} template.` });
    }
    if (section.visible === false) return;
    const missing = missingRequired(section, block);
    if (missing.length) {
      checks.push({
        level: "warn",
        message: `${section.label || block.label}: fill in ${missing.join(", ")}.`,
      });
    }
  });

  return checks;
};

// Sections as the API expects them: trimmed text, no editor-only keys.
export const sectionsForPayload = (sections) =>
  sections.map((section) => ({
    id: section.id,
    type: section.type,
    variant: section.variant || undefined,
    visible: section.visible !== false,
    label: clip(String(section.label ?? "").trim(), 40),
    anchor: slugifyText(section.anchor ?? ""),
    data: section.data ?? {},
  }));

export const formatDateTime = (value) =>
  value
    ? new Date(value).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

// Rows of a list answer: { data: [...] }, a plain array, or { revisions: [...] }.
export const listOf = (body) => {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.revisions)) return body.revisions;
  return [];
};

// The page record of an answer: the record itself or { data: record }.
export const recordOf = (body) => {
  if (body?.id) return body;
  if (body?.data?.id) return body.data;
  return body;
};

export const WEBSITE_URL = (process.env.NEXT_PUBLIC_WEBSITE_URL ?? "").replace(/\/+$/, "");
