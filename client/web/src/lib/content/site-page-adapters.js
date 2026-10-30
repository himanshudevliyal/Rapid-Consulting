import { getFileUrl } from "@/utils/file-url";
import { cleanSitePath } from "@/services/site-page-service";
import { stripTags } from "./adapters";

// Pure helpers that turn what the site-page API returns (admin-written data)
// into clean, safe, predictable shapes for the renderer. Nothing here fetches
// or renders. Every function accepts missing / malformed input: an editor's
// half-filled section must never crash a page.

const LOCALES = ["en", "hi"];

// Ids the page or the enquiry form already use; a section anchor never takes them.
const RESERVED_IDS = new Set(["main", "enquiry", "enquiry-section", "enquiry-drawer"]);

// ── primitives ──

export const asText = (value) =>
  typeof value === "string" ? value.trim() : typeof value === "number" && Number.isFinite(value) ? String(value) : "";

export const asArray = (value) => (Array.isArray(value) ? value : value == null || value === "" ? [] : [value]);

export const asObject = (value) => (value && typeof value === "object" && !Array.isArray(value) ? value : {});

export const slugify = (text) =>
  String(text ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export const escapeHtml = (text) =>
  String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Editor HTML that actually shows something (text, or media/table elements).
export const hasHtml = (html) => {
  const value = asText(html);
  if (!value) return false;
  return stripTags(value) !== "" || /<(img|iframe|video|audio|table|svg|hr)\b/i.test(value);
};

// A value for the API's `source` field: lowercase letters, digits and hyphens, max 60.
export const sourceSlug = (value) => slugify(value).slice(0, 60) || undefined;

// ── links ──

// Only http(s), mailto, tel, in-page (#) and site paths are ever linked.
export function safeHref(href) {
  const value = asText(href);
  if (!value) return "";
  if (value.startsWith("#")) return value.length > 1 ? value : "";
  if (value.startsWith("//")) return "";
  if (value.startsWith("/")) return value;
  if (/^(https?:|mailto:|tel:)/i.test(value)) return value;
  if (/^[a-z0-9][\w\-./?=&#%~+]*$/i.test(value) && !value.includes(":")) return `/${value}`;
  return "";
}

export const isExternalHref = (href) => /^https?:\/\//i.test(href);
export const isPlainAnchor = (href) => /^(#|mailto:|tel:)/i.test(href);

// Navigation hrefs are locale-less paths ("/your-project"); the website adds the language.
export function localizeHref(href, locale) {
  const safe = safeHref(href);
  if (!safe || !safe.startsWith("/")) return safe;
  if (/^\/(en|hi)(?=[/?#]|$)/.test(safe)) return safe;
  return `/${locale}${safe === "/" ? "" : safe}`;
}

// Picture saved by the API (or an absolute URL) -> usable URL or "".
export const imageUrl = (value) => {
  const url = getFileUrl(asText(value));
  return url && !/^\s*javascript:/i.test(url) ? url : "";
};

// Video link -> how to show it.
//   { kind: "embed", src } for YouTube / Vimeo, { kind: "file", src } for direct
//   video files, { kind: "link", src } for anything else, null when empty.
export function videoSource(url) {
  const href = safeHref(url);
  if (!href || !/^https?:\/\//i.test(href)) return null;
  let parsed;
  try {
    parsed = new URL(href);
  } catch {
    return null;
  }
  const host = parsed.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    const id = parsed.pathname.split("/").filter(Boolean)[0];
    if (id) return { kind: "embed", src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` };
  }
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com") {
    const parts = parsed.pathname.split("/").filter(Boolean);
    const id = parsed.searchParams.get("v") || (["embed", "shorts", "live"].includes(parts[0]) ? parts[1] : "");
    if (id) return { kind: "embed", src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` };
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const id = parsed.pathname.split("/").filter(Boolean).find((part) => /^\d+$/.test(part));
    if (id) return { kind: "embed", src: `https://player.vimeo.com/video/${id}` };
  }
  if (/\.(mp4|webm|ogv)$/i.test(parsed.pathname)) return { kind: "file", src: href };
  return { kind: "link", src: href };
}

// ── block data ──

// Record references on a block: [{ id, slug, title }] (single object or list).
export const recordRefs = (data, key = "records") =>
  asArray(asObject(data)[key])
    .map((entry) =>
      typeof entry === "string"
        ? { id: entry, slug: "", title: "" }
        : { id: asText(entry?.id), slug: asText(entry?.slug), title: asText(entry?.title) },
    )
    .filter((entry) => entry.id || entry.slug);

// [{ question, answerHtml }] - questions are plain text, answers editor HTML.
export const faqItems = (items) =>
  asArray(items)
    .map((item) => ({ question: asText(item?.question), answerHtml: asText(item?.answer_html ?? item?.answerHtml) }))
    .filter((item) => item.question && hasHtml(item.answerHtml));

// [{ key, title, items }] topics with at least one question; keys are unique slugs.
export const faqTopics = (topics) => {
  const used = new Set();
  return asArray(topics)
    .map((topic, index) => {
      const title = asText(topic?.title);
      const base = slugify(topic?.key) || slugify(title) || `topic-${index + 1}`;
      return { base, title: title || base, items: faqItems(topic?.items) };
    })
    .filter((topic) => topic.items.length)
    .map(({ base, ...topic }) => {
      let key = base;
      for (let n = 2; used.has(key); n++) key = `${base}-${n}`;
      used.add(key);
      return { key, ...topic };
    });
};

// [{ key, title, text, primaryLabel, pageHref }] stages of a stage_chooser.
export const stageList = (stages) => {
  const used = new Set();
  return asArray(stages)
    .map((stage, index) => {
      const title = asText(stage?.title);
      return {
        base: slugify(stage?.key) || slugify(title) || `stage-${index + 1}`,
        title,
        text: asText(stage?.text),
        primaryLabel: asText(stage?.primary_label),
        pageHref: safeHref(stage?.page_href),
      };
    })
    .filter((stage) => stage.title)
    .map(({ base, ...stage }) => {
      let key = base;
      for (let n = 2; used.has(key); n++) key = `${base}-${n}`;
      used.add(key);
      return { key, ...stage };
    });
};

// A list of lines from a textarea or an array.
export const lines = (value) =>
  (Array.isArray(value) ? value.map((entry) => asText(entry?.text ?? entry)) : String(value ?? "").split(/\r?\n/))
    .map((line) => asText(line))
    .filter(Boolean);

// ── sections and pages ──

// Defensive copy of one section. Anchors are made unique here too, so a jump
// link can never point at two elements (the server also guarantees this).
function normalizeSection(raw, index, takenIds) {
  const section = asObject(raw);
  const label = asText(section.label).slice(0, 40);
  const base = slugify(section.anchor) || slugify(label) || `section-${index + 1}`;
  let anchor = RESERVED_IDS.has(base) ? `${base}-block` : base;
  for (let n = 2; takenIds.has(anchor); n++) anchor = `${base}-${n}`;
  takenIds.add(anchor);
  return {
    id: asText(section.id) || `section-${index + 1}`,
    type: asText(section.type),
    variant: asText(section.variant),
    visible: section.visible !== false,
    label,
    anchor,
    data: asObject(section.data),
  };
}

// Ids owned by the stage chooser (cards link to them, and the menu links to
// /your-project#<stage-key>) must not be taken by a section anchor.
const stageIds = (rawSections) =>
  asArray(rawSections)
    .filter((section) => section?.type === "stage_chooser" && section?.visible !== false)
    .flatMap((section) => stageList(asObject(section.data).stages).map((stage) => stage.key));

export function normalizePage(raw) {
  const page = asObject(raw);
  const taken = new Set(stageIds(page.sections));
  const locale = LOCALES.includes(page.locale) ? page.locale : "en";
  return {
    id: asText(page.id),
    pageKey: asText(page.page_key),
    groupId: asText(page.group_id),
    template: asText(page.template),
    locale,
    path: cleanSitePath(page.path),
    title: asText(page.title),
    h1: asText(page.h1) || asText(page.title),
    metaTitle: asText(page.meta_title),
    metaDescription: asText(page.meta_description),
    publishedAt: page.published_at ?? null,
    updatedAt: page.updated_at ?? null,
    alternates: asArray(page.alternates)
      .filter((entry) => LOCALES.includes(entry?.locale) && typeof entry?.path === "string")
      .map((entry) => ({ locale: entry.locale, path: cleanSitePath(entry.path) })),
    sections: asArray(page.sections)
      .map((section, index) => normalizeSection(section, index, taken))
      // the public API sends visible sections only; a stale or preview payload is filtered again
      .filter((section) => section.visible && section.type),
  };
}

// The language versions of a page as site paths: { en: "/en/x" | null, hi: "/hi/x" | null }.
export function languagePaths(page) {
  const paths = { en: null, hi: null };
  paths[page.locale] = `/${page.locale}/${page.path}`;
  for (const entry of page.alternates) {
    if (!paths[entry.locale]) paths[entry.locale] = `/${entry.locale}/${entry.path}`;
  }
  return paths;
}

// ── registry ──

// fetched registry over the built-in copy: unknown blocks / templates the API
// adds are kept, a bad or missing response leaves the built-in copy untouched.
export function mergeRegistry(fetched, fallback) {
  const source = asObject(fetched);
  const templates = { ...fallback.templates };
  for (const [key, value] of Object.entries(asObject(source.templates))) {
    templates[key] = { ...templates[key], ...asObject(value) };
  }
  const blocks = { ...fallback.blocks };
  for (const [key, value] of Object.entries(asObject(source.blocks))) {
    const block = asObject(value);
    blocks[key] = { ...blocks[key], ...block, rail: typeof block.rail === "boolean" ? block.rail : blocks[key]?.rail };
  }
  return { templates, blocks };
}

// "rail" | "full" for a template.
export function layoutOf(registry, template) {
  const layout = registry.templates?.[template]?.layout;
  if (layout === "rail" || layout === "full") return layout;
  return template === "hub" ? "full" : template ? "rail" : "full";
}

// Splits the ordered sections around the sticky enquiry rail: the rail spans
// the FIRST consecutive run of sections whose block has rail:true. Anything
// before it and everything after it (a later run included) is full width.
export function splitAroundRail(sections, isRail) {
  const start = sections.findIndex((section) => isRail(section.type));
  if (start === -1) return { before: sections, rail: [], after: [] };
  let end = start;
  while (end < sections.length && isRail(sections[end].type)) end += 1;
  return { before: sections.slice(0, start), rail: sections.slice(start, end), after: sections.slice(end) };
}

// Plain text of editor HTML for structured data.
export const plainText = (html) => stripTags(html);
