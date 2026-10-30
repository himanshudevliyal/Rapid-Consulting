import { pageRoutes } from "@/lib/page-routes";
import { matchesSearch } from "@/lib/pages/discovery";

// Scheme directory (R02) grouping rules.

// A scheme belongs to every topic it is tagged with (service-family codes such
// as "S01" are not topics). A scheme with no topic tag is "Other programme support".
export const FALLBACK_TOPIC = "Other programme support";

export const schemeTopics = (scheme) => {
  const topics = [
    ...new Set((scheme.tags ?? []).map((tag) => String(tag ?? "").trim()).filter((tag) => tag && !/^S\d{2}$/.test(tag))),
  ];
  return topics.length ? topics : [scheme.topic || FALLBACK_TOPIC];
};

// D028 (the discontinued MoFPI backward / forward linkages scheme) and D049
// (purchase incentives for electric-vehicle buyers) are not general
// scheme-directory entries: they only appear as "Other matches" when a search
// or filter makes them relevant, and never count towards the directory totals.
export const OTHER_MATCH_CODES = ["D028", "D049"];

const slugOfCode = (code) => (pageRoutes[code] ?? "").split("/").filter(Boolean).pop() ?? "";

// The scheme slugs behind those identities (tolerates a code that has no route).
export const otherMatchSlugs = () => new Set(OTHER_MATCH_CODES.map(slugOfCode).filter(Boolean));

// One searchable text per scheme: the usual fields plus ministry, topics and
// the quick-assessment facts.
export const schemeSearchDoc = (scheme) => ({
  ...scheme,
  aliases: [
    ...(scheme.aliases ?? []),
    scheme.ministry,
    ...schemeTopics(scheme),
    scheme.facts?.assistanceType,
    scheme.facts?.activity,
    scheme.facts?.authority,
  ].filter(Boolean),
});

export const matchesSchemeSearch = (doc, query) => matchesSearch(doc, query);
