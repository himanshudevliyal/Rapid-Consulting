import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Html, Icon } from "./content-primitives";
import { ArrowUpRight } from "lucide-react";
import { CaseCard, caseCardLabels } from "@/components/case-card";
import { homeText } from "@/lib/pages/home-copy";

// Case investment figures keep one meaning everywhere they appear.
export function InvestmentMetric({ page, t, size = "card" }) {
  if (!page.metric) return null;

  const approximate = page.metric.startsWith("Approximately ");

  return (
    <div
      className={`investment-metric investment-metric-${size}`}
      data-component="InvestmentMetric"
      data-case-id={page.id}
    >
      {size === "hero" && (
        <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]">
          {t("detail.case.investmentLabel")}
        </span>
      )}
      {approximate && (
        <span className="investment-qualifier">
          {t("site.card.approximately")}
        </span>
      )}

      <strong className="investment-value">
        {page.metric.replace(/^Approximately /, "")}
      </strong>

      <span className="investment-basis">
        {t("site.card.in")}
        {page.metricLabel}
      </span>

      <small>{t("site.card.investmentNote")}</small>
    </div>
  );
}

const typeLabel = (type, t, has) =>
  has(`site.types.${type}`)
    ? t(`site.types.${type}`)
    : type.replaceAll("-", " ");

/**
 * One content-card owner. Compact is for menus; parent grids own column count.
 *
 * Cards in one grid row have the same height (the card fills its grid cell and
 * the action row sits at the bottom) and never cut copy off: titles and
 * descriptions wrap to as many lines as the text needs - long names and long
 * Hindi summaries included - instead of being clamped. The card has two links
 * to the same page (title and action), side by side, never one inside the other.
 */
export function ContentCard({
  page,
  locale,
  t,
  has,
  variant = "standard",
  copy,
  className = "",
}) {
  const caseStudy = page.type === "case-study";

  // One shared case card everywhere (Home, archive, related listings).
  if (caseStudy) {
    return (
      <CaseCard
        item={page}
        label={t("site.card.caseStudy")}
        cta={copy?.linkLabel || t("site.card.readCase")}
        labels={caseCardLabels(homeText(t, has, page.locale ?? locale))}
      />
    );
  }

  const label = caseStudy
    ? t("site.card.caseStudy")
    : typeLabel(page.type, t, has);

  const action =
    copy?.linkLabel ||
    (caseStudy
      ? t("site.card.readCase")
      : page.type === "article"
        ? t("site.card.readArticle")
        : page.type === "guide"
          ? t("site.card.readGuide")
          : t("site.card.explore"));

  const compact = variant === "compact";

  return (
    <article
      id={copy?.sectionId}
      data-component="ContentCard"
      data-content-id={page.id}
      data-card-variant={variant}
      className={`group flex h-full min-w-0 flex-col rounded-2xl  bg-background transition-all duration-300 hover:-translate-y-1 hover:border-[#0d3b37]/25 hover:shadow-[0_20px_45px_-25px_rgba(13,59,55,0.45)] ${
        compact ? "p-6" : "p-7 sm:p-8"
      } ${className}`}
    >
      {/* icon tile + type label */}
      <div className="flex items-center justify-between gap-3">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-accent mix-blend-multiply ring-1 ring-black/5 [&_svg]:size-7">
          <Icon name={page.icon} />
        </span>

        <span className="rounded-full px-3 py-1 text-right text-[10px] font-semibold uppercase tracking-[0.16em] text-[#0d3b37]/80">
          {label}
          {locale === "hi" && page.locale === "en"
            ? t("common.englishTag")
            : ""}
        </span>
      </div>

      {/* title */}
      <h3 className="!mb-0 !mt-6 !text-xl !font-semibold !leading-snug !tracking-tight !text-[#0d3b37] [overflow-wrap:anywhere]">
        <a
          href={page.href}
          className="!text-inherit !no-underline hover:underline"
        >
          {copy?.title || page.title}
        </a>
      </h3>

      {caseStudy && (
        <div className="mt-4">
          <InvestmentMetric
            page={page}
            t={t}
            size={compact ? "compact" : "card"}
          />
        </div>
      )}

      {/* divider + description */}
      {!compact && (
        <>
          <span
            aria-hidden="true"
            className="my-5 block h-px w-full bg-black/10"
          />

          {copy?.html ? (
            <Html
              html={copy.html}
              className="text-[15px] leading-7 text-slate-600 [overflow-wrap:anywhere] [&_p]:m-0 [&_p+p]:mt-2"
            />
          ) : (
            <p className="!m-0 text-[15px] leading-7 text-slate-600 [overflow-wrap:anywhere]">
              {page.description}
            </p>
          )}
        </>
      )}

      {/* pill action */}
      <div className="mt-auto pt-6">
        <a
          href={page.href}
          aria-label={`${action}: ${copy?.title || page.title}`}
          className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-black/10 bg-transparent px-5 text-sm font-semibold !text-slate-600 !no-underline transition-colors group-hover:border-[#0d3b37] group-hover:bg-[#0d3b37] group-hover:!text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d3b37]"
        >
          {action}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </a>
      </div>
    </article>
  );
}