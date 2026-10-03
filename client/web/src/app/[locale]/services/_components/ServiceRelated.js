import Link from "next/link";

import { ContentCard } from "@/components/common/content-card";
import { serviceHref, servicesHref } from "@/lib/site";
import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";

// Related services: explicit links first, then incoming links, then the
// family (ordering done by the API). Up to three, like the prototype.
export function ServiceRelated({ service, locale, t }) {
  const items = (service.related ?? []).slice(0, 3);
  if (!items.length) return null;

  return (
    <Section
      as="div"
      className="related-block compact-related py-10 border-t border-slate-100"
      containerClassName="px-0"
    >
      <div className="related-set">
        {/* Header row: Heading component + View All link */}
        <div className="section-heading">
          <Heading
            eyebrow={t("service.keepExploring")}
            heading={t("service.servicesNextStep")}
            className="text-left"
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
            headingClassName="text-2xl font-semibold tracking-tight text-[#09263e] mt-0"
          />
          <Link className="text-link" href={servicesHref(locale)}>
            {t("common.viewAll")} <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className={`card-grid columns-${items.length}`}>
          {items.map((item) => (
            <ContentCard
              key={item.code}
              item={item}
              href={serviceHref(item, locale)}
              typeLabel={t(`card.types.${item.type}`)}
              englishTag={item.has_locale ? "" : t("common.englishTag")}
              actionLabel={t("card.explore")}
            />
          ))}
        </div>
      </div>
    </Section>
  );
}
