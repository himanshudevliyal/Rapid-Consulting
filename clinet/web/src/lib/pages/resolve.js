import { defaultLocale } from "@/i18n/routing";
import { idForPath, pageRoutes } from "@/lib/page-routes";
import { getAllPages, getPage } from "./content";

// Types rendered by the backend-driven /services/[slug] route, not here.
export const SERVICE_TYPES = ["service", "service-family", "additional-service", "service-index"];

// "/schemes/pmegp-kvic-scheme" in a locale -> what to render or where to go.
export function resolveContentPath(locale, path) {
  const id = idForPath(path);
  if (!id) return { kind: "missing" };
  const english = getPage(id, defaultLocale);
  if (!english) return { kind: "missing" };
  if (SERVICE_TYPES.includes(english.type)) return { kind: "service", id };
  const page = getPage(id, locale);
  if (!page) return { kind: "fallback", id, path: `/${defaultLocale}${path}?language=${locale}-unavailable` };
  return { kind: "page", id, page };
}

// Every non-service content page in every language it really exists in.
export function contentStaticParams(locale) {
  return getAllPages()
    .filter((page) => page.locale === locale && page.id !== "H01" && !SERVICE_TYPES.includes(page.type) && pageRoutes[page.id])
    .map((page) => ({ slug: pageRoutes[page.id].split("/").filter(Boolean) }));
}
