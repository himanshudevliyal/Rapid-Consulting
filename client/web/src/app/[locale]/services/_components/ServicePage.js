import { ActiveSectionNav } from "@/components/common/active-section-nav";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ClientTicker } from "@/components/common/client-ticker";
import { JsonLd } from "@/components/common/json-ld";
import { PageAlternates } from "@/components/layout/page-alternates";
import { loadCaseStudies } from "@/lib/content/site-data";
import { b2bText } from "@/lib/pages/b2b-text";
import { serviceJsonLd } from "@/lib/seo";
import { mainSiteHref, serviceHref, servicesHref } from "@/lib/site";
import { ServiceCases, OUR_WORK_ID } from "./ServiceCases";
import { ServiceHero } from "./ServiceHero";
import { ServiceRail } from "./ServiceRail";
import { ServiceRelated } from "./ServiceRelated";
import { ServiceSection } from "./ServiceSection";
import { bodySections, casesForService } from "./service-model";

// Where "Our work" sits among the sections: right after the quick answers when
// the page has them, otherwise just before the FAQs (or last).
function withCases(sections, hasCases) {
  // A "cases" section written on the record sits where the editor put it (and
  // carries the heading text); without cases it is left out.
  const blocks = sections
    .filter((section) => section.role !== "cases" || hasCases)
    .map((section) => (section.role === "cases" ? { kind: "cases", section } : { kind: "section", section }));
  if (!hasCases || blocks.some((block) => block.kind === "cases")) return blocks;
  let at = blocks.findIndex((block) => block.section.role === "quick_answers") + 1;
  if (at <= 0) at = blocks.findIndex((block) => block.section.role === "faq");
  if (at < 0) at = blocks.length;
  blocks.splice(at, 0, { kind: "cases" });
  return blocks;
}

// Client reviews and FAQs leave the article column: they run full width under
// the article (below the enquiry rail), just above "Keep exploring".
const WIDE_ROLES = new Set(["reviews", "faq"]);
const isWide = (block) => block.kind === "section" && WIDE_ROLES.has(block.section.role);

// One template for every service, family and additional service. Adding a
// service in the admin panel needs no new page file.
//
//   breadcrumbs -> sticky "On this page" bar (full width) -> the article grid:
//   [ hero + sections | sticky enquiry rail ] -> full-width reviews and FAQs
//   -> full-width related services.
// The rail is sticky inside the grid only, so it stops where the article ends.
export async function ServicePage({ service, services, locale, t, has }) {
  const tx = b2bText(t);
  const servicesByCode = new Map(services.map((item) => [item.code, item]));
  const sections = bodySections(service);
  const path = `/services/${service.slug}`;
  const cases = casesForService(service, await loadCaseStudies());
  const blocks = withCases(sections, cases.length > 0);

  const family = service.family && service.family.code !== service.code && service.family.slug ? service.family : null;
  const trail = [
    { label: t("common.home"), href: mainSiteHref("H01", locale) },
    { label: t("card.types.service-index"), href: servicesHref(locale) },
    ...(service.category?.title ? [{ label: service.category.title }] : []),
    ...(family ? [{ label: family.title, href: serviceHref(family, locale) }] : []),
    { label: service.title },
  ];

  const renderBlock = (block, index) =>
    block.kind === "cases" ? (
      <ServiceCases key="cases" cases={cases} section={block.section} service={service} t={t} has={has} locale={locale} />
    ) : (
      <ServiceSection
        key={block.section.key}
        section={block.section}
        index={index}
        service={service}
        servicesByCode={servicesByCode}
        locale={locale}
        t={t}
      />
    );
  // Each block keeps its number (index) from the full list.
  const numbered = blocks.map((block, index) => ({ block, index }));
  const inColumn = numbered.filter(({ block }) => !isWide(block));
  const wide = numbered.filter(({ block }) => isWide(block));

  // The "On this page" bar follows the order on screen.
  const navSections = [...inColumn, ...wide].map(({ block }) =>
    block.kind === "cases"
      ? { id: OUR_WORK_ID, title: block.section?.nav_label || tx("cases.nav", "Our work") }
      : { id: block.section.key, title: block.section.nav_label || block.section.title },
  );

  return (
    <div  className="b2b-page b2b-service max-w-7xl  mx-auto" data-component="ServicePage">
      <PageAlternates en={`/en${path}`} hi={service.available_locales.includes("hi") ? `/hi${path}` : null} />
      <JsonLd data={serviceJsonLd(service, locale, { homeLabel: t("common.home"), servicesLabel: t("card.types.service-index") })} />

      {/* Plain breadcrumbs (the service's name is the one H1, in the hero) */}
      <Breadcrumbs jsonLd={false} label={t("breadcrumb.label")} items={trail} />

      <ActiveSectionNav
        title={t("service.onThisPage")}
        label={t("service.onThisPageLabel")}
        contextLabel={tx("nav.lead", "On this page:")}
        sections={navSections}
      />

      <div className="b2b-layout">
        <div className="b2b-wrap b2b-layout__grid">
          <main className="b2b-layout__main" id="main">
            <ServiceHero service={service} locale={locale} t={t} has={has} />
            {inColumn.map(({ block, index }) => renderBlock(block, index))}
          </main>
          <ServiceRail service={service} t={t} />
        </div>
      </div>

      {wide.length > 0 && (
        <div className="b2b-wide" data-component="ServiceWideSections">
          <div className="b2b-wrap">{wide.map(({ block, index }) => renderBlock(block, index))}</div>
        </div>
      )}

      <ServiceRelated service={service} locale={locale} t={t} />
      <ClientTicker />
    </div>
  );
}
