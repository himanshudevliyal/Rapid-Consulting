import { ArrowRight } from "lucide-react";

import { loadFeaturedSchemes, loadGuides } from "@/lib/content/site-data";
import { mainSiteHref } from "@/lib/site";
import { hasTranslation } from "@/i18n/has-translation";
import { ContentCard } from "./content-card";

// Guides and scheme information for the home page and the Resources page,
// straight from the API: the latest guides, and the schemes marked "show on
// the home page" in the admin panel (the latest ones until any is marked).
export async function ResourceBlocks({ locale, t, guideLimit = 3, schemeLimit = 6 }) {
  const has = hasTranslation(t);
  const [guides, schemes] = await Promise.all([
    loadGuides({ limit: guideLimit }),
    loadFeaturedSchemes({ limit: schemeLimit }),
  ]);

  const block = (title, items, href, linkLabel) =>
    items.length > 0 && (
      <div className="resource-block">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h3 className="!m-0 text-2xl font-semibold tracking-tight text-[#071f33]">{title}</h3>
          <a
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f5d57] transition-colors hover:text-[#09263e]"
          >
            {linkLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ContentCard key={item.id} page={item} locale={locale} t={t} has={has} />
          ))}
        </div>
      </div>
    );

  return (
    <div className="space-y-14">
      {block(t("header.guidesArticles"), guides, mainSiteHref("R01", locale, false), t("site.home.viewAllGuides"))}
      {block(t("header.schemeInformation"), schemes, mainSiteHref("R02", locale, false), t("site.home.viewAllSchemes"))}
      {schemes.length > 0 && (
        <div className="text-center">
          <a
            href={mainSiteHref("R02", locale, false)}
            className="group inline-flex items-center gap-3 rounded-full bg-[#09263e] py-2 pl-6 pr-2 text-sm font-semibold text-white! transition-colors hover:bg-[#1f5d57]"
          >
            {t("site.home.viewAllSchemes")}
            <span className="flex size-9 items-center justify-center rounded-full bg-[#eaff6b] text-[#09263e] transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </a>
        </div>
      )}
    </div>
  );
}
