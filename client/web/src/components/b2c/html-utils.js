import { stripTags } from "@/lib/content/adapters";

// Small, pure helpers over the trusted editor HTML of a page record.

/** Whole minutes to read the page (about 200 words a minute), at least 1. */
export function readingMinutes(page) {
  const html = [page.introHtml, ...(page.sections ?? []).map((section) => `${section.title} ${section.html}`)].join(" ");
  const words = stripTags(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** The first <p> of some HTML and everything after it. */
export function splitLead(html = "") {
  const source = String(html ?? "").trim();
  const match = source.match(/^\s*(<p[^>]*>[\s\S]*?<\/p>)/i);
  if (!match) return { lead: "", rest: source };
  return { lead: match[1], rest: source.slice(match[0].length).trim() };
}

/** HTML without any <p>On this page: ...</p> line the manuscripts carry. */
export const withoutOnThisPage = (html = "") => String(html ?? "").replace(/<p>On this page:[\s\S]*?<\/p>/g, "");

/** True when the HTML has any visible text, an image or a table. */
export const hasContent = (html) => {
  const source = String(html ?? "");
  return Boolean(stripTags(source)) || /<(img|table|iframe)\b/i.test(source);
};

// Does a heading name a "watch out" panel?
export const WATCH_OUT = /watch\s*out|common mistakes?|mistakes? to avoid|pitfalls?|where .* (?:lose|lost)|red flags?/i;

/** Paragraphs of some HTML that are not just a bold line (the facts / metric lines of a case). */
export function plainParagraphs(html = "") {
  return [...String(html ?? "").matchAll(/<p[^>]*>[\s\S]*?<\/p>/gi)]
    .map((match) => match[0])
    .filter((p) => !/^<p[^>]*>\s*<strong>[\s\S]*<\/strong>\s*<\/p>$/i.test(p.trim()));
}

// ── Case study: "What Rapid did" rows ────────────────────────────────────────
// Rows are read from an ordered list whose items carry labelled lines:
//   <li><strong>Title</strong><p>Client provided: ...</p><p>Rapid recorded: ...</p></li>
// An item without those lines still becomes a numbered row (its whole text).
const CLIENT = /^\s*(?:<strong>\s*)?(?:what\s+)?(?:the\s+)?client\s+(?:provided|brought|gave|supplied)\s*:?\s*(?:<\/strong>)?\s*:?\s*/i;
const RAPID = /^\s*(?:<strong>\s*)?(?:what\s+)?rapid\s+(?:recorded|handled|did|prepared|checked)(?:\s+or\s+handled)?\s*:?\s*(?:<\/strong>)?\s*:?\s*/i;

function readItem(inner) {
  const lines = [...inner.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1]);
  let client = "";
  let rapid = "";
  const rest = [];
  for (const line of lines) {
    if (!client && CLIENT.test(line)) client = line.replace(CLIENT, "").trim();
    else if (!rapid && RAPID.test(line)) rapid = line.replace(RAPID, "").trim();
    else rest.push(line);
  }
  if (!client && !rapid) return { title: "", body: inner.trim(), client: "", rapid: "" };
  const lead = inner.split(/<(?:p|ul|ol|br)[\s>/]/i)[0];
  const title = lead.replace(/<[^>]+>/g, "").trim();
  return { title, body: rest.map((line) => `<p>${line}</p>`).join(""), client, rapid };
}

/**
 * Splits the HTML of "What Rapid did" into the text before the list, the
 * numbered rows, and the text after it. No ordered list -> { rows: [] }.
 */
export function parseDoneRows(html = "") {
  const source = String(html ?? "");
  const list = source.match(/<ol[^>]*>([\s\S]*?)<\/ol>/i);
  if (!list) return { before: source, rows: [], after: "" };
  const rows = [...list[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => readItem(m[1]));
  return {
    before: source.slice(0, list.index).trim(),
    rows,
    after: source.slice(list.index + list[0].length).trim(),
  };
}

// ── Buttons written in the HTML ──────────────────────────────────────────────
// A paragraph that holds one link with class "button" is a button:
//   <p><a class="button" href="#enquire">Check my plot →</a></p>
// A trailing arrow in the label is drawn by the button, not part of its words.
const BUTTON = /<p>\s*<a\b(?=[^>]*\bclass="[^"]*\bbutton\b[^"]*")[^>]*?\bhref="([^"]*)"[^>]*>([\s\S]*?)<\/a>\s*<\/p>/gi;

export function splitButtons(html = "") {
  const source = String(html ?? "");
  const parts = [];
  let last = 0;
  for (const match of source.matchAll(BUTTON)) {
    if (match.index > last) parts.push({ type: "html", html: source.slice(last, match.index) });
    const label = match[2].replace(/<[^>]+>/g, "").trim();
    const arrow = /[↗]\s*$/.test(label) ? "↗" : /[→]\s*$/.test(label) ? "→" : "";
    parts.push({ type: "action", href: match[1], label: label.replace(/\s*[→↗]\s*$/, ""), arrow });
    last = match.index + match[0].length;
  }
  if (last < source.length) parts.push({ type: "html", html: source.slice(last) });
  return parts;
}

/** Text of each <li> of the first list in some HTML (links and markup removed). */
export const listItems = (html = "") =>
  [...String(html ?? "").matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => stripTags(m[1])).filter(Boolean);
