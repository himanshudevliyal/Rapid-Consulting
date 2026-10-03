import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ClientTicker } from "@/components/common/client-ticker";
import { JsonLd } from "@/components/common/json-ld";
import { SectionNav } from "@/components/common/section-nav";
import { ContactExperience } from "@/components/form/contact-experience";
import { PageAlternates } from "@/components/layout/page-alternates";
import Section from "@/components/layout/section";
import { mainSiteHref, servicesHref } from "@/lib/site";
import { serviceJsonLd } from "@/lib/seo";
import { ServiceHero } from "./ServiceHero";
import { ServiceRelated } from "./ServiceRelated";
import { ServiceSection } from "./ServiceSection";
import { ActiveSectionNav } from "@/components/common/active-section-nav";

// One template for every service, family and additional service. Adding a
// service in the admin panel needs no new page file.
export function ServicePage({ service, services, locale, t, has }) {
  const servicesByCode = new Map(services.map((item) => [item.code, item]));
  const sections = service.sections.filter((section) => section.role !== "hero_benefit");
  const path = `/services/${service.slug}`;

  return (
    <>
      <PageAlternates en={`/en${path}`} hi={service.available_locales.includes("hi") ? `/hi${path}` : null} />
      <JsonLd data={serviceJsonLd(service, locale, { homeLabel: t("common.home"), servicesLabel: t("card.types.service-index") })} />

      {/* Breadcrumbs strip */}
        <Breadcrumbs
         heading={service.title}
          label={t("breadcrumb.label")}
          items={[
            { label: t("common.home"), href: mainSiteHref("H01", locale) },
            { label: t("card.types.service-index"), href: servicesHref(locale) },
            { label: service.title },
          ]}
        />
        
     

 <ActiveSectionNav
                 title={t("service.onThisPage")}
              label={t("service.onThisPageLabel")}
            sections={sections.map((section) => ({ id: section.key, title: section.nav_label || section.title }))}
          />
            
      {/* Main content + rail */}
      <Section as="div" className="py-0 bg-[#f8f9fa]">
        <div className="detail-layout">
          <main className="detail-content" id="main">
            <ServiceHero service={service} locale={locale} t={t} has={has} />
        
            {sections.map((section, index) => (
              <ServiceSection
                key={section.key}
                section={section}
                index={index}
                service={service}
                servicesByCode={servicesByCode}
                locale={locale}
                t={t}
              />
            ))}
            <ServiceRelated service={service} locale={locale} t={t} />
          </main>
          <aside className="detail-rail">
            <ContactExperience pageTitle={service.h1 || service.title} pageId={service.code} variant="rail" />
          </aside>
        </div>
      </Section>
       <ClientTicker />
    </>
  );
}
