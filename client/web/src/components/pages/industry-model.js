import { hasFaqContent } from "@/lib/pages/faq";
import { excerpt, textOf } from "@/lib/pages/b2b-text";
import { parseProjectStages } from "./project-stages";

// Reads an industry page record (see industryToPage in lib/content/adapters.js)
// and works out which of its sections play which part on the Figma industry page:
//
//   your project      the section whose <h3> headings are the project types
//   what you can claim  the schemes chosen for the industry (page.discovery.schemes),
//                     plus any prose section about subsidies/schemes
//   watch out         a section about mistakes/risks; else the industry's note
//   one report        a section about the report / plan
//   cases             the "experience" section and the industry's case studies
//   FAQs              the section written as question + answer pairs
//   closing           the "discuss your requirement" section
//
// Nothing is invented: when the record has no such section the block is left
// out. The API can later say it outright (page.projectTypes, page.watchOuts)
// and that wins over the reading of headings below.

const NUMBERED = /^\s*\d+[.)]\s/;
const re = (pattern) => (section) => pattern.test(`${section.id} ${section.title}`);

const isFaq = (section) => hasFaqContent(section.html) || /question|faq/i.test(`${section.id} ${section.title}`);
const isDiscuss = re(/discuss|talk to|get in touch|your requirement/i);
const isFootnote = re(/sources?[ -]and[ -]review|^sources|related[ -]services|related[ -]reading/i);
const isExperience = re(/experience|case[ -]stud|our[ -]work|track[ -]record/i);
const isWatch = re(/watch|mistake|lose|risk|avoid|caution|pitfall/i);
const isReport = re(/report|brief|plan[ -](should|explain)|what should .* plan/i);
const isClaimProse = re(/subsid|scheme|incentive|claim/i);

// The text under each <h3> / bullet / bold lead of a section as rows.
export function rowsFromHtml(html = "", limit = 6) {
  const heads = parseProjectStages(html);
  if (heads.length) return heads.slice(0, limit).map((item) => ({ title: item.title, text: excerpt(textOf(item.body), 220) }));

  const items = [...String(html).matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)].map((m) => m[1]);
  const blocks = items.length ? items : [...String(html).matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => m[1]);
  return blocks
    .map((block) => {
      const lead = block.match(/^\s*<(?:strong|b)>([\s\S]*?)<\/(?:strong|b)>([\s\S]*)$/i);
      return lead
        ? { title: textOf(lead[1]), text: excerpt(textOf(lead[2]), 220) }
        : { title: excerpt(textOf(block), 140), text: "" };
    })
    .filter((row) => row.title)
    .slice(0, limit);
}

export function industryModel(page) {
  const sections = page.sections ?? [];
  const used = new Set();
  const take = (section) => {
    if (section) used.add(section.id);
    return section ?? null;
  };

  // Project types: given by the API, or the first section whose <h3> headings are not numbered steps.
  let projects = (page.projectTypes ?? [])
    .map((item, index) => ({
      id: item.id || `type-${index + 1}`,
      title: item.title,
      body: item.html || (item.text ? `<p>${item.text}</p>` : ""),
      actions: item.links ?? [],
    }))
    .filter((item) => item.title);
  let projectSection = null;
  if (!projects.length) {
    projectSection = sections.find((section) => {
      const found = parseProjectStages(section.html);
      return found.length >= 2 && !found.every((item) => NUMBERED.test(item.title));
    });
    if (projectSection) {
      const seen = new Set();
      projects = parseProjectStages(projectSection.html).map((item, index) => {
        let id = item.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 48);
        if (!id || seen.has(id)) id = `type-${index + 1}`;
        seen.add(id);
        return { id, title: item.title, body: item.body, actions: item.actions };
      });
    }
  }
  take(projectSection);
  const firstHeading = projectSection ? projectSection.html.search(/<h3[\s>]/) : -1;
  const projectIntro = projectSection && firstHeading > 0 ? projectSection.html.slice(0, firstHeading) : "";

  const rest = sections.filter((section) => !used.has(section.id));
  const faq = take(rest.find(isFaq));
  const discuss = take(rest.find((s) => !used.has(s.id) && isDiscuss(s)));
  const footnotes = rest.filter((s) => !used.has(s.id) && isFootnote(s)).map(take);
  const experience = take(rest.find((s) => !used.has(s.id) && isExperience(s)));
  const watchSection = take(rest.find((s) => !used.has(s.id) && isWatch(s)));
  const report = take(rest.find((s) => !used.has(s.id) && isReport(s)));
  const claimProse = rest.filter((s) => !used.has(s.id) && isClaimProse(s)).map(take);
  const general = rest.filter((s) => !used.has(s.id));

  let watchRows = (page.watchOuts ?? []).map((item) => ({ title: item.title, text: item.text || "" })).filter((row) => row.title);
  let watchTitle = "";
  if (!watchRows.length && watchSection) {
    watchRows = rowsFromHtml(watchSection.html);
    watchTitle = watchSection.title;
  }
  const note = (page.discovery?.note ?? "").trim();
  if (!watchRows.length && note) watchRows = [{ title: note, text: "" }];

  return {
    projects,
    projectSection,
    projectIntro,
    claimProse,
    watch: watchRows.length ? { title: watchTitle, rows: watchRows } : null,
    report,
    experience,
    faq,
    discuss,
    footnotes,
    general,
  };
}

// Case studies that belong to an industry: the case names the industry, or the
// industry's slug is one of its tags. Matching is on whole words of the
// industry's name ("Food & Agro Processing" -> food, agro).
const STOP = new Set(["and", "the", "for", "facilities", "manufacturing", "processing", "industry", "industries"]);
const words = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .split(/[^a-z0-9]+/)
    .filter((word) => word.length >= 3);

export function casesForIndustry(page, cases = [], limit = 3) {
  const wanted = words(page.title).filter((word) => !STOP.has(word));
  if (!wanted.length) return [];
  return cases
    .filter((item) => {
      if ((item.tags ?? []).some((tag) => String(tag).toLowerCase() === page.slug)) return true;
      const have = new Set(words(`${item.industry} ${item.sector}`));
      return wanted.some((word) => have.has(word));
    })
    .slice(0, limit);
}
