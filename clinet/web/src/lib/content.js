import { defaultLocale } from "@/i18n/routing";
import { mainSiteHref, servicesHref } from "./site";

// Editors link to other pages by content identity: /en/p/D066, /hi/p/S02…
// (the convention used across the Rapid manuscripts). The website turns those
// into real URLs: services go to /{locale}/services/{slug}; everything else
// goes to the main site until it is migrated.
const INTERNAL_LINK = /href="\/(en|hi)\/p\/([^"#?]+)([^"]*)"/g;
const ALIASES = { D064: "D065" };
const canonicalCode = (code) => ALIASES[code] ?? code;

export function linkedCodes(html = "") {
  return [...new Set([...html.matchAll(INTERNAL_LINK)].map((m) => canonicalCode(m[2])))];
}

function rewriteLinks(html, servicesByCode) {
  if (!html) return html;
  return html.replace(INTERNAL_LINK, (match, linkLocale, rawCode, rest) => {
    const code = canonicalCode(rawCode);
    if (code === "S00") return `href="${servicesHref(linkLocale)}${rest}"`;
    const service = servicesByCode.get(code);
    if (service) {
      const locale = service.available_locales?.includes(linkLocale) ? linkLocale : defaultLocale;
      return `href="/${locale}/services/${service.slug}${rest}"`;
    }
    return `href="${mainSiteHref(code, linkLocale)}${rest}"`;
  });
}

// Remove the <a> that points at one service, keeping its words, so the
// paragraph can sit inside that service's card without a duplicate link.
function unwrapLink(html, code) {
  return html.replace(
    /<a href="\/(?:en|hi)\/p\/([^"#?]+)[^"]*"[^>]*>([\s\S]*?)<\/a>/g,
    (link, linkedCode, label) => (canonicalCode(linkedCode) === code ? label : link),
  );
}

// "service_cards" sections: paragraphs that point to exactly one service
// become that service's card; adjacent ones share a grid. Other paragraphs
// stay as text, placed before the cards they introduce.
function serviceCardGroups(html, servicesByCode) {
  const blocks = html
    .split(/(<p\b[^>]*>[\s\S]*?<\/p>)/g)
    .filter((block) => block.trim())
    .map((block) => ({
      html: block,
      codes: block.startsWith("<p") ? linkedCodes(block).filter((code) => servicesByCode.has(code)) : [],
    }));

  const groups = [];
  for (const block of blocks) {
    const previous = groups.at(-1);
    if (block.codes.length === 1 && previous?.every((b) => b.codes.length === 1)) previous.push(block);
    else groups.push([block]);
  }

  return groups.map((group) => {
    const single = group.every((b) => b.codes.length === 1);
    return {
      intro_html: single ? "" : rewriteLinks(group[0].html, servicesByCode),
      cards: group.flatMap((block) =>
        block.codes.map((code) => ({
          code,
          copy_html: single ? rewriteLinks(unwrapLink(block.html, code), servicesByCode) : null,
        })),
      ),
    };
  });
}

const stripOnThisPage = (html = "") => html.replace(/<p>On this page:[\s\S]*?<\/p>/g, "");

// Prepare an API service record for rendering in `locale`.
export function localizeService(service, services) {
  const servicesByCode = new Map(services.map((item) => [item.code, item]));
  const rewrite = (html) => rewriteLinks(html, servicesByCode);

  return {
    ...service,
    intro_html: rewrite(stripOnThisPage(service.intro_html)),
    sections: (service.sections ?? []).map((section) => ({
      ...section,
      html: rewrite(section.html),
      intro_html: rewrite(section.intro_html),
      outro_html: rewrite(section.outro_html),
      items: (section.items ?? []).map((item) => ({ ...item, html: rewrite(item.html) })),
      ...(section.role === "service_cards"
        ? { groups: serviceCardGroups(section.html ?? "", servicesByCode) }
        : {}),
    })),
  };
}

export const plainText = (html = "") =>
  html
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&rsquo;/g, "’")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
