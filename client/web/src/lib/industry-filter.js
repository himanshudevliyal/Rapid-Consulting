import { pageRoutes } from "@/lib/page-routes";

const norm = (value) => String(value ?? "").trim().toLowerCase();

const slugify = (text) =>
  norm(text)
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

// Old content identities (industry=I01) point at the industry's page address
// ("/industries/food-and-agro-processing"): its last segment is the slug.
const legacySlug = (code) => {
  const path = pageRoutes[String(code ?? "").trim().toUpperCase()];
  const match = path?.match(/^\/industries\/([^/]+)$/);
  return match ? match[1] : "";
};

// The ?industry=<value> of a link -> the id of the industry it names, or "".
// Accepts the industry's slug (what the site's own links use), a legacy
// identity such as "I01", or the industry's name, so an incoming link always
// selects the filter instead of falling back to "All industries".
// `industries` are industry summaries: { id, slug, title }.
export function resolveIndustryId(value, industries = []) {
  const raw = Array.isArray(value) ? value[0] : value;
  const wanted = norm(raw);
  if (!wanted || !industries.length) return "";
  const candidates = [...new Set([legacySlug(raw), wanted, slugify(raw)].filter(Boolean))];
  for (const candidate of candidates) {
    const hit = industries.find((entry) => norm(entry.id) === candidate || norm(entry.slug) === candidate);
    if (hit) return hit.id;
  }
  const byName = industries.find((entry) => candidates.includes(norm(entry.title)) || candidates.includes(slugify(entry.title)));
  return byName?.id ?? "";
}

// The current address's ?industry= value ("" when absent), browser only.
export const industryFromLocation = () => {
  if (typeof window === "undefined") return "";
  return new URLSearchParams(window.location.search).get("industry") ?? "";
};
