import records from "@/lib/data/pages.json";
import { pathFor } from "@/lib/page-routes";

// Page repository for the website's content pages (compiled manuscripts).
// Every record's `href` is its public slug URL; links inside the HTML keep the
// /{locale}/p/{ID} identity form (layout helpers read those IDs) and are
// turned into slug URLs when rendered (see components/content-primitives).
const pages = records.map((page) => ({ ...page, href: pathFor(page.id, page.locale) ?? page.href }));
const byKey = new Map(pages.map((page) => [`${page.locale}/${page.id}`, page]));
const aliases = new Map(pages.flatMap((page) => page.aliases.map((alias) => [alias, page.id])));
aliases.set("D064", "D065");
const canonical = (id) => aliases.get(id) || id;

function summary(page) {
  const { id, locale, title, h1, description, type, group, href, icon, family, hasHindi, status, aliases, metric, metricLabel } = page;
  return { id, locale, title, h1, description, type, group, href, icon, family, hasHindi, status, aliases, ...(metric ? { metric, metricLabel } : {}) };
}

export function getAllPages() {
  return [...pages];
}

export function getPage(id, locale) {
  return byKey.get(`${locale}/${canonical(id)}`);
}

export function pageHref(id, locale = "en") {
  const page = getPage(id, locale) || getPage(id, "en");
  if (!page) throw new Error(`Unknown page identity: ${id}`);
  return page.href;
}

export function getSummaries(locale = "en") {
  return pages.filter((page) => page.locale === "en").map((page) => summary(getPage(page.id, locale) || page));
}

export function getRelated(page, type, limit = 6) {
  const all = getSummaries(page.locale);
  const pageId = canonical(page.id);
  const byId = new Map(all.map((item) => [canonical(item.id), item]));
  const preferred = page.relatedIds.map((id) => byId.get(canonical(id))).filter((item) => !!item);
  // Explicit links are evidence in both directions; preserve outbound editorial order first.
  const inbound = all.filter((item) => getPage(item.id, item.locale)?.relatedIds.some((id) => canonical(id) === pageId));
  const peers = all.filter((item) => (page.family && item.family === page.family) || item.type === page.type);
  const seen = new Set([pageId]);
  return [...preferred, ...inbound, ...peers]
    .filter((item) => {
      const id = canonical(item.id);
      if (seen.has(id) || (type && item.type !== type)) return false;
      seen.add(id);
      return true;
    })
    .slice(0, Math.max(0, limit));
}
