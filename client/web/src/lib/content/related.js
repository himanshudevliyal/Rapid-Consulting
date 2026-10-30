import { fetchServices } from "@/services/service-service";
import { loadIndustries } from "./site-data";

// Services relevant to a scheme: the services curated for the industries that
// list this scheme (the single industry catalogue owns the relationship and the
// order). Nothing is guessed: no industry lists the scheme -> no services.
export async function loadServicesForScheme(slug, locale, limit = 3) {
  const industries = await loadIndustries();
  const slugs = [];
  for (const industry of industries) {
    if (!industry.schemeSlugs?.includes(slug)) continue;
    for (const serviceSlug of industry.serviceSlugs ?? []) if (!slugs.includes(serviceSlug)) slugs.push(serviceSlug);
  }
  if (!slugs.length) return [];
  const services = await fetchServices(locale).catch(() => []);
  const bySlug = new Map(services.map((service) => [service.slug, service]));
  return slugs
    .map((value) => bySlug.get(value))
    .filter(Boolean)
    .slice(0, limit);
}
