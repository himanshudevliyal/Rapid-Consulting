import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ContentCard } from "@/components/common/content-card";
import { serviceHref, servicesHref } from "@/lib/site";

// Related services: explicit links first, then incoming links, then the
// family (ordering done by the API). Up to three. A full-width band after the
// article, so the sticky enquiry rail has already ended above it.
export function ServiceRelated({ service, locale, t }) {
  const items = (service.related ?? []).slice(0, 3);
  if (!items.length) return null;

  return (
    <section className="b2b-related" aria-labelledby="service-related-title" data-component="ServiceRelated">
      <div className="b2b-wrap">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="b2b-eyebrow">{t("service.keepExploring")}</p>
            <h2 id="service-related-title" className="b2b-h2">
              {t("service.servicesNextStep")}
            </h2>
          </div>
          <Link
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[#eaff6b] px-5 text-sm font-semibold text-[#09263e] no-underline transition-colors hover:bg-[#dcf24f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
            href={servicesHref(locale)}
          >
            {t("common.viewAll")}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        <div className={`card-grid columns-${items.length} mt-6`}>
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
    </section>
  );
}
