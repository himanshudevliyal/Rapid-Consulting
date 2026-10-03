// scripts/import-rapid-services.js
//
// One-time import of the Rapid Consulting service pages into the services
// tables. It reads the handoff prototype's compiled content (the output of its
// own Markdown compiler) and writes seeders/data/rapid-services.json, which the
// seeder inserts. Run it again only if you want to re-import from manuscripts.
//
//   node scripts/import-rapid-services.js <path-to>/website/frontend
//
// Reads (relative to the frontend folder):
//   src/data/pages.json               compiled EN/HI page records
//   src/lib/explanation-layouts.ts    reviewed benefits/process roles + nav labels
//   ../content/manifest.json          original URLs (used for slugs)

import fs from "node:fs";
import path from "node:path";

const frontend = path.resolve(process.argv[2] ?? "../website/frontend");
const out = path.resolve("seeders/data/rapid-services.json");

const pages = JSON.parse(
  fs.readFileSync(path.join(frontend, "src/data/pages.json"), "utf8"),
);
const manifest = JSON.parse(
  fs.readFileSync(path.join(frontend, "../content/manifest.json"), "utf8"),
).pages;
const layoutsSource = fs.readFileSync(
  path.join(frontend, "src/lib/explanation-layouts.ts"),
  "utf8",
);

// The layout file declares JSON object literals: `export const name:Type={…};`
function readConst(name) {
  const start = layoutsSource.indexOf(`export const ${name}`);
  if (start < 0) throw new Error(`Missing ${name} in explanation-layouts.ts`);
  const open = layoutsSource.indexOf("={", start) + 1;
  let depth = 0;
  for (let i = open; i < layoutsSource.length; i++) {
    if (layoutsSource[i] === "{") depth++;
    if (layoutsSource[i] === "}" && --depth === 0) {
      return JSON.parse(layoutsSource.slice(open, i + 1));
    }
  }
  throw new Error(`Unbalanced ${name}`);
}
const explanationLayouts = readConst("explanationLayouts");
const explanationNav = readConst("explanationNav");

// Reviewed presentation choices that lived in prototype components.
const zedNav = {
  "what-is-zed-certification": "Overview",
  "what-can-zed-help-your-business-improve": "Benefits",
  "who-is-eligible-and-is-zed-compulsory": "Eligibility",
  "bronze-silver-or-gold-which-level-should-you-consider": "Levels",
  "what-does-zed-certification-cost": "Costs",
  "what-subsidy-and-financial-assistance-are-available": "Subsidy",
  "what-rapid-supports": "Rapid’s role",
  "what-documents-and-records-should-you-prepare": "Documents",
  "the-working-sequence": "Process",
  "how-long-does-certification-take-and-how-long-is-it-valid": "Timing & validity",
  "practical-questions": "FAQs",
  "discuss-your-plants-starting-point": "Talk to us",
  "sources-and-review": "Sources",
};
const serviceCardSections = {
  S02: ["choose-the-approval-you-need", "अपनी-ज़रूरत-की-सेवा-चुनें"],
  S03: ["choose-the-document-or-programme", "सही-सेवा-चुनें"],
  S04: ["choose-the-support-you-need", "अपनी-ज़रूरत-चुनें"],
  S05: ["choose-the-funding-or-advisory-requirement", "सही-सेवा-चुनें"],
};
const heroBenefitSections = {
  S01: [
    "unlock-the-full-subsidy-potential-of-your-next-investment",
    "अपने-अगले-निवेश-के-लिए-उपलब्ध-सब्सिडी-का-पूरा-लाभ-उठाएँ",
  ],
};

// ---- FAQ parsing (ported from the prototype's lib/faq.ts) ----
const voidTags = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const visibleText = (html) => html.replace(/<[^>]*>/g, "").trim();
const isQuestion = (html) => /[?？]$/.test(visibleText(html)) && !/<(?:a|button|input)\b/i.test(html);
const idOf = (opening) => opening.match(/\bid="([^"]+)"/)?.[1];
const reviewedSingleParagraphAnswers = new Set(["should-the-adviser-make-every-decision-for-me"]);

function topLevelBlocks(html) {
  const blocks = [];
  const stack = [];
  let offset = 0, start = 0, rootTag = "";
  for (const match of html.matchAll(/<!--[\s\S]*?-->|<\/?([a-z][\w-]*)\b[^>]*>/gi)) {
    if (!match[1]) continue;
    const tag = match[1].toLowerCase();
    const closing = match[0].startsWith("</");
    if (!stack.length) {
      if (match.index > offset) blocks.push({ tag: "raw", html: html.slice(offset, match.index) });
      start = match.index;
      rootTag = tag;
    }
    if (closing) {
      if (stack.pop() !== tag) return [{ tag: "raw", html }];
    } else if (!voidTags.has(tag) && !match[0].endsWith("/>")) stack.push(tag);
    if (!stack.length) {
      offset = match.index + match[0].length;
      blocks.push({ tag: rootTag, html: html.slice(start, offset) });
    }
  }
  if (stack.length) return [{ tag: "raw", html }];
  if (offset < html.length) blocks.push({ tag: "raw", html: html.slice(offset) });
  return blocks;
}
function boldQuestion(block) {
  if (block.tag !== "p") return null;
  const m = block.html.match(/^<p(\s[^>]*)?>\s*<strong(?:\s[^>]*)?>([\s\S]*?)<\/strong>([\s\S]*?)<\/p>$/i);
  if (!m || !isQuestion(m[2]) || !visibleText(m[3])) return null;
  return { kind: "question", questionHtml: m[2], answerHtml: `<p>${m[3]}</p>`, id: idOf(m[1] || "") };
}
const contactParagraph = (block) => block.tag === "p" && /href="(?:https:\/\/wa\.me\/|\/(?:en|hi)\/p\/C01(?:["?#]))/i.test(block.html);
function parseFaq(html) {
  const source = topLevelBlocks(html);
  const blocks = [];
  const appendHtml = (value) => {
    const previous = blocks.at(-1);
    if (previous?.kind === "html") previous.html += value;
    else blocks.push({ kind: "html", html: value });
  };
  for (let index = 0; index < source.length; index++) {
    const block = source[index];
    const bold = boldQuestion(block);
    if (bold) { blocks.push(bold); continue; }
    const heading = block.tag === "h3" ? block.html.match(/^<h3\b([^>]*)>([\s\S]*?)<\/h3>$/i) : null;
    if (!heading || !isQuestion(heading[2])) { appendHtml(block.html); continue; }
    let end = index + 1;
    while (end < source.length && !/^h[1-6]$/.test(source[end].tag) && !boldQuestion(source[end])) end++;
    const content = source.slice(index + 1, end).map((entry, o) => ({ entry, index: index + 1 + o })).filter(({ entry }) => entry.html.trim());
    const contactStart = content.findIndex(({ entry }) => contactParagraph(entry));
    const candidate = contactStart < 0 ? content : content.slice(0, contactStart);
    const answer = reviewedSingleParagraphAnswers.has(idOf(heading[1]) || "") ? candidate.slice(0, 1) : candidate;
    if (answer.length !== 1 || answer[0].entry.tag !== "p") { appendHtml(block.html); continue; }
    blocks.push({ kind: "question", id: idOf(heading[1]), questionHtml: heading[2], answerHtml: answer[0].entry.html });
    index = answer[0].index;
  }
  return blocks;
}

const text = (html) => visibleText(html).replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');

// Benefits/process: text before the first <h3> is the intro; each <h3> block
// becomes one card/step (title + everything up to the next <h3>).
function splitByH3(html) {
  const blocks = html.split(/(?=<h3\b)/);
  const intro = blocks.filter((b) => !b.startsWith("<h3")).join("");
  const items = blocks.filter((b) => b.startsWith("<h3")).map((block) => {
    const m = block.match(/^<h3\b([^>]*)>([\s\S]*?)<\/h3>/);
    return { key: idOf(m[1]) ?? "", title: text(m[2]), html: block.slice(m[0].length).trim() };
  });
  return { intro_html: intro.trim(), items };
}

// FAQ: the prototype renders leading prose, then question/answer pairs, then
// any closing prose. A section is only structured when it has that shape;
// anything else stays as faithful rich text.
function faqSection(html) {
  const blocks = parseFaq(html);
  const questions = blocks.filter((b) => b.kind === "question");
  if (!questions.length) return null;
  const first = blocks.findIndex((b) => b.kind === "question");
  const last = blocks.findLastIndex((b) => b.kind === "question");
  if (blocks.slice(first, last + 1).some((b) => b.kind === "html" && b.html.trim())) return null;
  return {
    intro_html: blocks.slice(0, first).map((b) => b.html).join("").trim(),
    items: questions.map((q) => ({ key: q.id ?? "", title: text(q.questionHtml), html: q.answerHtml.trim() })),
    outro_html: blocks.slice(last + 1).map((b) => b.html).join("").trim(),
  };
}

function toSection(page, section) {
  const layoutKey = `${page.locale}/${page.id}`;
  const navLabel =
    page.id === "D077" ? zedNav[section.id] : explanationNav[layoutKey]?.[section.id];
  const base = { key: section.id, title: section.title, ...(navLabel ? { nav_label: navLabel } : {}) };

  if (heroBenefitSections[page.id]?.includes(section.id)) {
    return { ...base, role: "hero_benefit", html: section.html };
  }
  const explanation = explanationLayouts[layoutKey]?.[section.id];
  if (explanation) {
    return { ...base, role: explanation, ...splitByH3(section.html) };
  }
  if (serviceCardSections[page.id]?.includes(section.id)) {
    return { ...base, role: "service_cards", html: section.html };
  }
  const faq = faqSection(section.html);
  if (faq) return { ...base, role: "faq", ...faq };
  return { ...base, role: "content", html: section.html };
}

// ---- Build records ----
const serviceTypes = new Set(["service", "service-family", "additional-service", "service-index"]);
const selected = pages.filter((p) => serviceTypes.has(p.type));
const manifestById = new Map(manifest.filter((m) => m.language === "en").map((m) => [m.id, m]));

function legacySlug(id, type) {
  if (type === "service-index") return "all-services";
  const url = (manifestById.get(id)?.original_urls ?? []).find((u) => u.includes("rapidconsulting.in"));
  if (!url) throw new Error(`No original URL for ${id}`);
  return new URL(url).pathname.split("/").filter(Boolean).pop();
}

const ids = [...new Set(selected.map((p) => p.id))].sort((a, b) => {
  const rank = (id) => (id === "S00" ? 0 : id.startsWith("S") ? 1 : id.startsWith("D") ? 2 : 3);
  return rank(a) - rank(b) || a.localeCompare(b);
});

const services = ids.map((id, index) => {
  const en = selected.find((p) => p.id === id && p.locale === "en");
  const translations = selected
    .filter((p) => p.id === id)
    .sort((a) => (a.locale === "en" ? -1 : 1))
    .map((p) => ({
      locale: p.locale,
      title: p.title,
      h1: p.h1,
      eyebrow: p.locale === "hi" ? "रैपिड कंसल्टिंग" : p.group,
      short_description: p.description,
      intro_html: p.introHtml,
      sections: p.sections.map((s) => toSection(p, s)),
      source_urls: p.sourceUrls,
      status: p.status,
      review_label: p.reviewLabel,
      meta_title: p.metaTitle,
      meta_description: p.description,
    }));

  const manifestEntry = manifestById.get(id);
  return {
    code: id,
    slug: legacySlug(id, en.type),
    type: en.type,
    family_code: en.type === "service" ? en.family || null : null,
    icon: en.icon,
    related_codes: en.relatedIds,
    legacy_urls: (manifestEntry?.original_urls ?? []).filter((u) => u.includes("rapidconsulting.in")),
    sort_order: (index + 1) * 10,
    is_active: true,
    translations,
  };
});

const slugs = services.map((s) => s.slug);
const duplicates = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (duplicates.length) throw new Error(`Duplicate slugs: ${duplicates.join(", ")}`);

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(services, null, 2) + "\n");

const roles = {};
for (const s of services) for (const t of s.translations) for (const sec of t.sections) roles[sec.role] = (roles[sec.role] ?? 0) + 1;
console.log(`Wrote ${services.length} services (${services.reduce((n, s) => n + s.translations.length, 0)} translations) to ${out}`);
console.log("Section roles:", roles);
