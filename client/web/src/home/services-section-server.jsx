// Server Component — loads the service categories from the API, then passes
// only plain serialisable data to the Client Component.
import { linkedContentIds } from "@/lib/pages/card-copy";
import { pageRoutes } from "@/lib/page-routes";
import { loadCategoryGroups } from "@/lib/content/site-data";
import { serviceHref } from "@/lib/site";
import { paragraphs } from "./utils";
import { ServicesTabUI } from "./services-section";

const SERVICE_PLACEHOLDER = "/assets/hero-section.jpg";

// Paragraphs of the home copy that introduce a service (they link to service
// pages) are replaced by the live list; the rest stay as footer notes.
const linksService = (html) =>
  linkedContentIds(html).some((id) => (pageRoutes[id] ?? "").startsWith("/services"));

export async function ServicesSection({ section, page, t, eyebrow }) {
  const locale = page.locale;
  const groups = await loadCategoryGroups(locale);

  // A category tab: its overview (family) page first, then its services.
  const families = groups.map((group) => {
    const items = [...(group.family ? [group.family] : []), ...group.services];
    return {
      id: group.slug,
      family: {
        id: group.slug,
        title: group.title,
        icon: group.family?.icon,
        href: group.family ? serviceHref(group.family, locale) : `/${locale}/services`,
      },
      children: items.map((service) => ({
        id: service.slug,
        title: service.title,
        href: serviceHref(service, locale),
        locale: service.has_locale ? locale : "en",
      })),
      descHtml: "",
      image: SERVICE_PLACEHOLDER,
    };
  });

  const footerParts = paragraphs(section.html).filter((p) => !linksService(p));

  // Resolve all translated strings here (Server side) — never pass t() itself
  return (
    <ServicesTabUI
      sectionId={section.id}
      sectionTitle={section.title}
      eyebrow={eyebrow}
      locale={locale}
      allServicesLabel={locale === "hi" ? "सभी सेवाएँ" : "All Services"}
      readMoreLabel={locale === "hi" ? "और जानें" : "Read More"}
      englishSuffix={t("common.englishSuffix")}
      families={families}
      footerParts={footerParts}
    />
  );
}
