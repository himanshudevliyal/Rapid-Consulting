import { ContentCard as ServiceCard } from "@/components/common/content-card";
import { ContentCard } from "./content-card";
import { serviceHref } from "@/lib/site";

const LIMIT = 6;

// The services and schemes chosen for an industry in the admin panel
// (Industries -> Related services and schemes), shown after the page body.
// Nothing is listed here that the API did not return.
export function IndustryDiscovery({ page, t, has }) {
  const { services = [], schemes = [], note = "" } = page.discovery ?? {};
  if (!services.length && !schemes.length) return null;
  const locale = page.locale;

  return (
    <div className="industry-service-groups industry-discovery" data-component="IndustryDiscovery">
      {schemes.length > 0 && (
        <div className="industry-discovery-group" data-industry-group="schemes">
          <h3>{t("site.industryServices.schemes")}</h3>
          {note && <p className="industry-discovery-note">{note}</p>}
          <div className="industry-discovery-grid">
            {schemes.slice(0, LIMIT).map((item) => (
              <ContentCard key={item.id} page={item} locale={locale} t={t} has={has} />
            ))}
          </div>
          <a
            className="button button-secondary industry-archive-link"
            href={`/${locale}/schemes?industry=${encodeURIComponent(page.slug)}`}
          >
            {t("site.industryServices.viewSchemes")}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}
      {services.length > 0 && (
        <div className="industry-discovery-group" data-industry-group="services">
          <h3>{t("site.industryServices.services")}</h3>
          <div className="industry-discovery-grid">
            {services.slice(0, LIMIT).map((service) => (
              <ServiceCard
                key={service.code}
                item={service}
                href={serviceHref(service, locale)}
                typeLabel={t(`card.types.${service.type}`)}
                englishTag={service.has_locale ? "" : t("common.englishTag")}
                actionLabel={t("card.explore")}
              />
            ))}
          </div>
          <a
            className="button button-secondary industry-archive-link"
            href={`/${locale}/services?industry=${encodeURIComponent(page.slug)}`}
          >
            {t("site.industryServices.viewServices")}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      )}
    </div>
  );
}
