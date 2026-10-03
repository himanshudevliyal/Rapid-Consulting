import { ContentCard } from "@/components/common/content-card";
import { Html } from "@/components/common/html";
import { serviceHref } from "@/lib/site";

// Family pages: paragraphs that point to one service become that service's
// card; the paragraph's own words stay as the card description.
export function ServiceCards({ section, servicesByCode, locale, t }) {
  return (
    <div className="industry-service-groups service-card-groups" data-component="ServiceCards">
      {section.groups.map((group, index) => (
        <div key={index} className="industry-service-group">
          <Html html={group.intro_html} />
          {group.cards.length > 0 && (
            <div className="card-grid columns-2">
              {group.cards.map((card) => {
                const service = servicesByCode.get(card.code);
                if (!service) return null;
                return (
                  <ContentCard
                    key={card.code}
                    item={service}
                    href={serviceHref(service, locale)}
                    typeLabel={t(`card.types.${service.type}`)}
                    englishTag={service.has_locale ? "" : t("common.englishTag")}
                    actionLabel={t("card.explore")}
                    copyHtml={card.copy_html}
                  />
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
