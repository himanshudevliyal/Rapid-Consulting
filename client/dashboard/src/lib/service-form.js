// Helpers for the service form: API record <-> form values <-> API payload.

export const LOCALES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी (Hindi)" },
];

export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

export const slugify = (value = "") =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// Plain-text preview of an HTML string (for collapsed section headers).
export const htmlSnippet = (html = "", max = 140) => {
  const text = String(html)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max)}…` : text;
};

export const emptyContent = () => ({
  title: "",
  h1: "",
  eyebrow: "",
  short_description: "",
  intro_html: "",
  sections: [],
  source_urls: [],
  status: "draft",
  review_label: "",
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  og_image: "",
});

export const emptySection = () => ({
  key: "",
  title: "",
  nav_label: "",
  role: "content",
  html: "",
  intro_html: "",
  items: [],
  outro_html: "",
});

const contentFromTranslation = (t = {}) => ({
  title: t.title ?? "",
  h1: t.h1 ?? "",
  eyebrow: t.eyebrow ?? "",
  short_description: t.short_description ?? "",
  intro_html: t.intro_html ?? "",
  sections: (t.sections ?? []).map((s) => ({
    key: s.key ?? "",
    title: s.title ?? "",
    nav_label: s.nav_label ?? "",
    role: s.role ?? "content",
    html: s.html ?? "",
    intro_html: s.intro_html ?? "",
    items: (s.items ?? []).map((i) => ({
      key: i.key ?? "",
      title: i.title ?? "",
      html: i.html ?? "",
    })),
    outro_html: s.outro_html ?? "",
  })),
  source_urls: t.source_urls ?? [],
  status: t.status ?? "draft",
  review_label: t.review_label ?? "",
  meta_title: t.meta_title ?? "",
  meta_description: t.meta_description ?? "",
  meta_keywords: t.meta_keywords ?? "",
  og_image: t.og_image ?? "",
});

// API service (with translations[]) -> form values.
export const toFormValues = (service) => {
  const translations = service?.translations ?? [];
  const byLocale = Object.fromEntries(translations.map((t) => [t.locale, t]));
  return {
    code: service?.code ?? "",
    slug: service?.slug ?? "",
    type: service?.type ?? "service",
    family_code: service?.family_code ?? "",
    category_id: service?.category_id ?? "",
    icon: service?.icon ?? "",
    pictures: service?.pictures ?? [],
    sort_order: service?.sort_order ?? 0,
    is_active: service?.is_active ?? true,
    legacy_urls: service?.legacy_urls ?? [],
    content: {
      en: byLocale.en ? contentFromTranslation(byLocale.en) : emptyContent(),
      hi: byLocale.hi ? contentFromTranslation(byLocale.hi) : emptyContent(),
    },
  };
};

const trimmed = (list = []) => list.map((v) => String(v ?? "").trim()).filter(Boolean);

const cleanSections = (sections = []) => {
  const used = new Set();
  return sections.map((section, index) => {
    // The key is the anchor id on the page; make it unique and URL-safe.
    let key = slugify(section.key) || slugify(section.title) || `section-${index + 1}`;
    while (used.has(key)) key = `${key}-${index + 1}`;
    used.add(key);
    // Only send what is filled in, so untouched sections keep their original shape.
    const out = {
      key,
      title: section.title.trim(),
      role: section.role || "content",
    };
    if (section.html?.trim()) out.html = section.html;
    if (section.intro_html?.trim()) out.intro_html = section.intro_html;
    if (section.outro_html?.trim()) out.outro_html = section.outro_html;
    const items = (section.items ?? []).map((item) => ({
      key: slugify(item.key) || slugify(item.title),
      title: item.title.trim(),
      html: item.html ?? "",
    }));
    if (items.length) out.items = items;
    if (section.nav_label?.trim()) out.nav_label = section.nav_label.trim();
    return out;
  });
};

const cleanContent = (locale, c) => ({
  locale,
  title: c.title.trim(),
  h1: c.h1?.trim() ?? "",
  eyebrow: c.eyebrow?.trim() ?? "",
  short_description: c.short_description?.trim() ?? "",
  intro_html: c.intro_html ?? "",
  sections: cleanSections(c.sections),
  source_urls: trimmed(c.source_urls),
  status: c.status || "draft",
  review_label: c.review_label?.trim() ?? "",
  meta_title: c.meta_title?.trim() ?? "",
  meta_description: c.meta_description?.trim() ?? "",
  meta_keywords: c.meta_keywords?.trim() ?? "",
  og_image: c.og_image?.trim() ?? "",
});

// Form values -> body for POST /services or PUT /services/:id.
// `locales` lists the language versions that exist or were added in the form.
export const buildPayload = (values, { locales, isEdit }) => {
  const payload = {
    type: values.type || "service",
    family_code: values.family_code || null,
    category_id: values.category_id || null,
    icon: values.icon || undefined,
    pictures: (values.pictures ?? []).filter(Boolean),
    sort_order: Number(values.sort_order) || 0,
    is_active: !!values.is_active,
    legacy_urls: trimmed(values.legacy_urls),
    translations: locales.map((locale) => cleanContent(locale, values.content[locale])),
  };
  if (values.slug?.trim()) payload.slug = values.slug.trim();
  // Nobody types a code. The server numbers new services itself; a Service
  // family page uses the code of the Family / topic picked by name.
  if (payload.type === "service-family") {
    payload.family_code = null;
    if (!isEdit) payload.code = values.code.trim();
  }
  return payload;
};
