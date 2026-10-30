import { AuthorReviewer } from "@/components/common/author-reviewer";
import { ContentCard as ServiceCard } from "@/components/common/content-card";
import { CaseCard, caseCardLabels } from "@/components/case-card";
import { ContentCard } from "@/components/pages/content-card";
import { homeText } from "@/lib/pages/home-copy";
import { pageHref } from "@/lib/pages/content";
import { serviceHref } from "@/lib/site";
import { H2, OUTLINE_BUTTON } from "./text";
import { TextLink } from "./blocks";

// The blocks under an editorial page: references and review, useful next
// steps, and related reading / cases. Server-safe.

const SOURCEABLE = ["scheme", "article", "guide"];

export const sourceLinks = (page) =>
  (SOURCEABLE.includes(page.type) ? (page.sourceUrls ?? []) : [])
    .map((url) => {
      try {
        return { url, host: new URL(url).hostname };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

export const hasSources = (page) =>
  sourceLinks(page).length > 0 || (SOURCEABLE.includes(page.type) && Boolean(page.reviewer));

/** Official sources and the reviewer. No reviewer, no review block; sources alone still list. */
export function Sources({ page, t }) {
  const links = sourceLinks(page);
  const reviewer = SOURCEABLE.includes(page.type) ? page.reviewer : null;
  if (!links.length && !reviewer) return null;
  return (
    <section id="source-record" className="b2c-anchor mt-12 rounded-3xl border border-slate-200 bg-white p-5 sm:p-7">
      <h2 className="!m-0 !text-[22px] !font-semibold !leading-snug !tracking-[-0.01em] !text-[#09263e]">{t("site.sources.title")}</h2>
      {links.length > 0 && (
        <>
          <p className="mb-0 mt-3 text-[15px] leading-7 text-slate-700">{t("site.sources.intro")}</p>
          <ul className="m-0 mt-3 grid list-none gap-2 p-0">
            {links.map(({ url, host }, i) => (
              <li key={url} className="text-[15px]">
                <a href={url} target="_blank" rel="noreferrer" className="font-semibold text-[#09263e] underline underline-offset-4">
                  {host.includes("rapidconsulting.in") ? t("site.sources.earlierPage") : host.replace("www.", "")}{" "}
                  <span className="font-normal text-slate-600">
                    · {t("site.sources.reference")} {i + 1} ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      {reviewer && (
        <div className="mt-5 border-t border-slate-200 pt-5">
          <AuthorReviewer page={page} t={t} variant="review" className="!my-0" />
          <p className="mb-0 mt-3 text-[13px] leading-5 text-slate-600">{t("detail.sources.reviewNote")}</p>
        </div>
      )}
    </section>
  );
}

/** Where to go after reading: services relevant to a scheme and the two directories. */
export function NextSteps({ page, t, services = [] }) {
  const locale = page.locale;
  const links = [
    page.type !== "scheme" && { href: pageHref("R02", locale), label: t("detail.nextSteps.schemes") },
    { href: `/${locale}/services`, label: t("detail.nextSteps.services") },
  ].filter(Boolean);
  return (
    <section className="mt-12">
      <p className="wc2-eyebrow !m-0">{t("site.related.keepExploring")}</p>
      <h2 className={`${H2} !mt-2`}>{t("detail.nextSteps.title")}</h2>
      {services.length > 0 && (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {services.map((service) => (
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
      )}
      <ul className="m-0 mt-5 flex list-none flex-wrap gap-3 p-0">
        {links.map((link) => (
          <li key={link.href}>
            <a className={OUTLINE_BUTTON} href={link.href}>
              {link.label} <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Related reading (articles, guides) and related cases from the page's own related list. */
export function RelatedSets({ page, t, has, casesId, only }) {
  const pool = page.relatedItems ?? [];
  const sets = [
    { key: "reading", label: t("site.related.reading"), id: "R01", types: ["article", "guide"], limit: 2 },
    { key: "work", label: t("site.related.work"), id: "W00", types: ["case-study"], limit: 2 },
  ]
    .filter((set) => !only || only.includes(set.key))
    .map((set) => ({ ...set, items: pool.filter((p) => set.types.includes(p.type)).slice(0, set.limit) }))
    .filter((set) => set.items.length);
  if (!sets.length) return null;
  return (
    <div className="mt-12 grid gap-12">
      {sets.map((set) => (
        <section key={set.key} id={set.key === "work" ? casesId : undefined} className="b2c-anchor">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="wc2-eyebrow !m-0">{t("site.related.keepExploring")}</p>
              <h2 className={`${H2} !mt-2`}>{set.label}</h2>
            </div>
            <TextLink href={pageHref(set.id, page.locale)}>
              {t("common.viewAll")}
              {page.locale === "hi" ? t("common.englishSuffix") : ""}
            </TextLink>
          </div>
          <div className="mt-5 grid items-stretch gap-6 md:grid-cols-2">
            {set.items.map((item) => (
              <div key={`${item.type}-${item.id}`} className="h-full">
                <ContentCard page={item} locale={page.locale} t={t} has={has} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

/** Case cards (shared CaseCard) in a grid. */
export function CaseGrid({ items, t, has, locale }) {
  if (!items.length) return null;
  const labels = caseCardLabels(homeText(t, has, locale));
  return (
    <div className={`grid items-stretch gap-6 md:grid-cols-2 ${items.length > 2 ? "lg:grid-cols-3" : ""}`}>
      {items.map((item) => (
        <CaseCard key={item.id} item={item} label={t("site.card.caseStudy")} cta={t("site.card.readCase")} labels={labels} />
      ))}
    </div>
  );
}
