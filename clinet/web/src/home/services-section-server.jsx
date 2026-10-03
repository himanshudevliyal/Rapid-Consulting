// Server Component — calls t(), getSummaries(), etc., then passes
// only plain serialisable data to the Client Component.
import { getSummaries } from "@/lib/pages/content";
import { linkedContentIds } from "@/lib/pages/card-copy";
import { paragraphs } from "./utils";
import { ServicesTabUI } from "./services-section";

const FAMILY_IDS = ["S01", "S02", "S03", "S04", "S05"];
const SERVICE_PLACEHOLDER = "/assets/hero-section.jpg";
const FAMILY_IMAGES = {
  S01: SERVICE_PLACEHOLDER,
  S02: SERVICE_PLACEHOLDER,
  S03: SERVICE_PLACEHOLDER,
  S04: SERVICE_PLACEHOLDER,
  S05: SERVICE_PLACEHOLDER,
};

export function ServicesSection({ section, page, t, eyebrow }) {
  const locale = page.locale;
  const pages = getSummaries(locale);
  const parts = paragraphs(section.html);

  // Build serialisable family data
  const families = FAMILY_IDS.map((id) => {
    const family = pages.find((p) => p.id === id);
    if (!family) return null;

    const children = (
      id === "S01"
        ? pages.filter((p) => p.id === "R02")
        : pages.filter((p) => p.type === "service" && p.family === id)
    ).map(({ id: cid, title, href, locale: cloc }) => ({ id: cid, title, href, locale: cloc }));

    const descHtml = parts.find((p) => linkedContentIds(p).includes(id)) || "";

    return {
      id,
      family: { id: family.id, title: family.title, icon: family.icon, href: family.href },
      children,
      descHtml,
      image: FAMILY_IMAGES[id] || SERVICE_PLACEHOLDER,
    };
  }).filter(Boolean);

  const footerParts = parts.filter(
    (p) => !linkedContentIds(p).some((id) => FAMILY_IDS.includes(id))
  );

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
