import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";

import { CommunityInvite } from "@/components/common/community-invite";
import { SvrTeaser } from "@/components/common/svr-teaser";
import { Carousel } from "@/components/home/carousel";
import { BTN_LIME, BTN_OUTLINE, BTN_WHITE, EYEBROW, LEAD, WRAP } from "@/components/home/styles";
import { NAV_OFFSET, SmartLink } from "@/components/site-pages/shared";
import { formatDate } from "@/lib/format-date";
import { fillTokens, mt, rowsOf } from "@/lib/pages/managed-view";
import { filterKey } from "@/lib/url-filters";
import { cn } from "@/lib/utils";
import { Band, BandHeading } from "./b2d-parts";
import { FaqCardList } from "./faq-accordion";
import { SessionCard } from "./session-card";

// The sections of the Resources hub (Figma R00 1292-58851) that are built on
// the server. The page (app/[locale]/resources/page.js) loads the data and
// composes them; "By topic" is a client component (resource-topics.jsx).

// ── By stage ────────────────────────────────────────────────────────────────

// A guide belongs to a stage when it carries a tag naming that stage (the key
// "buying-land" or the label "Buying land"). Nothing is guessed from titles.
export const guideForStage = (guides, stage, label) =>
  guides.find((guide) =>
    (guide.tags ?? []).some((tag) => {
      const key = filterKey(tag);
      return key === stage.key || key === filterKey(label);
    }),
  );

/** The article or guide whose title is `title` (case and punctuation ignored), or undefined. */
export const findByTitle = (writings, title) => {
  const key = filterKey(title || "");
  return key ? (writings ?? []).find((entry) => filterKey(entry.title) === key) : undefined;
};

function StageGuideCard({ stageKey, kicker, typeLabel, title, text, metaLead, note, ctaLabel, record, locale, tx }) {
  const reviewed = record?.reviewer && record?.reviewedAt ? formatDate(record.reviewedAt, locale) : "";
  const meta = [
    metaLead,
    reviewed && tx("resources.stage.reviewed", "Reviewed {date}", { date: reviewed }),
    record?.reviewer?.name && tx("resources.stage.reviewer", "Reviewer: {name}", { name: record.reviewer.name }),
    !record && note,
  ].filter(Boolean);
  return (
    <article
      data-stage={stageKey || undefined}
      className="flex h-full min-h-[300px] w-full flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <span className="flex items-center justify-between gap-3">
        <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-lg bg-[#eef3f0] text-[#09263e]">
          <BookOpen className="size-5" />
        </span>
        <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-600">{typeLabel}</span>
      </span>
      {kicker && <p className="m-0! mt-5! text-[11px] font-bold uppercase tracking-[0.14em] text-[#922e0c]">{kicker}</p>}
      <h3 className="m-0! mt-2! text-lg! font-semibold! leading-snug! tracking-tight! text-[#09263e]!">{title}</h3>
      {text && <p className="m-0! mt-2! line-clamp-3 text-sm leading-6 text-slate-600">{text}</p>}
      {meta.length > 0 && <p className="m-0! mt-3! text-xs leading-5 text-slate-600">{meta.join(" · ")}</p>}
      <span className="mt-auto flex pt-5">
        {record ? (
          <Link
            href={record.href}
            aria-label={`${ctaLabel}: ${record.title}`}
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#09263e]/60 bg-white px-5 text-sm font-semibold text-[#09263e]! no-underline transition-colors hover:bg-[#eaff6b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
          >
            {ctaLabel}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="button"
            disabled
            aria-disabled="true"
            className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center rounded-full border border-slate-300 bg-slate-100 px-5 text-sm font-semibold text-slate-600"
          >
            {ctaLabel}
          </button>
        )}
      </span>
    </article>
  );
}

/**
 * "Not sure where to begin?" - one card per project stage, in a carousel.
 * `managed` is the page's by-stage section: its cards (type, stage, title,
 * text, reading time, note, button) are drawn as written; the link of a card is
 * the guide or article of the same title in `writings` (none = disabled button).
 * Without managed cards, one card per stage from the built-in copy.
 */
export function StageGuidesSection({ id, stages, guides, writings = [], locale, t, tx, managed }) {
  const items = rowsOf(managed?.items).filter((item) => mt(item.title) || mt(item.kicker));
  const pendingLabel = tx("resources.stage.pending", "Guide in preparation");
  const readGuide = tx("resources.stage.read", "Read the guide");
  const cards = items.length
    ? items.map((item, index) => {
        const record = findByTitle(writings, item.title);
        const type = mt(item.tag) || tx("resources.stage.guide", "Guide");
        const kicker = mt(item.kicker);
        return (
          <StageGuideCard
            key={`${index}-${kicker || item.title}`}
            stageKey={filterKey(kicker)}
            kicker={kicker}
            typeLabel={type}
            title={mt(item.title) || kicker}
            text={mt(item.text) || record?.description || ""}
            metaLead={mt(item.meta)}
            note={mt(item.note)}
            ctaLabel={mt(item.cta_label) || (record ? readGuide : pendingLabel)}
            record={record}
            locale={locale}
            tx={tx}
          />
        );
      })
    : stages.map((stage) => {
        const label = t.has(`wb.stages.${stage.key}`) ? t(`wb.stages.${stage.key}`) : stage.label;
        const text = t.has(`wb.stageText.${stage.key}`) ? t(`wb.stageText.${stage.key}`) : stage.text;
        const guide = guideForStage(guides, stage, label);
        return (
          <StageGuideCard
            key={stage.key}
            stageKey={stage.key}
            kicker={label}
            typeLabel={tx("resources.stage.guide", "Guide")}
            title={guide ? guide.title : label}
            text={guide ? guide.description || text : text}
            ctaLabel={guide ? readGuide : pendingLabel}
            record={guide}
            locale={locale}
            tx={tx}
          />
        );
      });
  return (
    <Band id={id} labelledBy={`${id}-title`} tone="white" className={NAV_OFFSET}>
      <Carousel
        label={tx("resources.stage.region", "Guides by project stage")}
        previous={tx("resources.stage.prev", "Previous guides")}
        next={tx("resources.stage.next", "Next guides")}
        lead={
          <BandHeading
            id={`${id}-title`}
            eyebrow={mt(managed?.eyebrow) || tx("resources.stage.eyebrow", "By stage")}
            title={mt(managed?.heading) || tx("resources.stage.title", "Not sure where to begin? Start where your project is.")}
            intro={mt(managed?.intro)}
          />
        }
      >
        {cards}
      </Carousel>
      <div className="mt-8">
        <SmartLink href={mt(managed?.cta_href) || "/your-project"} locale={locale} className={BTN_LIME}>
          {mt(managed?.cta_label) || tx("resources.stage.all", "See every stage on Your Project")}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </SmartLink>
      </div>
    </Band>
  );
}

// ── Schemes ─────────────────────────────────────────────────────────────────

/** The navy panel: the scheme directory and the subsidies hub. `count` = published schemes (0 = unknown). */
export function SchemesPanel({ id, count, locale, tx, managed }) {
  const builtIn =
    count >= 20
      ? tx("resources.schemes.titleCount", "Over {count} subsidy schemes, each with its own page.", { count: Math.floor(count / 10) * 10 })
      : tx("resources.schemes.title", "Subsidy schemes, each with its own page.");
  const title = mt(managed?.heading) ? fillTokens(mt(managed.heading), { count }) : builtIn;
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("bg-white py-10 sm:py-14", NAV_OFFSET)}>
      <div className={WRAP}>
        <div className="rounded-3xl bg-[#09263e] px-6 py-10 text-white sm:px-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_auto] lg:items-center">
            <div>
              <p className={cn(EYEBROW, "text-[#eaff6b]!")}>{mt(managed?.eyebrow) || tx("resources.schemes.eyebrow", "Schemes")}</p>
              <h2
                id={`${id}-title`}
                className="m-0! max-w-none! text-[1.75rem]! font-semibold! leading-[1.15]! tracking-tight! text-white! sm:text-4xl!"
              >
                {title}
              </h2>
              <p className={cn(LEAD, "text-white/85!")}>
                {mt(managed?.text) ||
                  tx(
                    "resources.schemes.text",
                    "Each scheme page shows who it is for, what it pays and where it stands today. Check the status before you plan around a scheme.",
                  )}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <SmartLink href={mt(managed?.primary_href) || "/subsidies"} locale={locale} className={BTN_LIME}>
                {mt(managed?.primary_label) || tx("resources.schemes.find", "Find a subsidy")}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </SmartLink>
              <SmartLink href={mt(managed?.secondary_href) || "/schemes"} locale={locale} className={BTN_WHITE}>
                {mt(managed?.secondary_label) || tx("resources.schemes.browse", "Browse the scheme directory")}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </SmartLink>
            </div>
          </div>
        </div>
        <SvrTeaser context="resources" locale={locale} className="mt-6" />
      </div>
    </section>
  );
}

// ── Learn and stay updated ──────────────────────────────────────────────────

/** One card of "Learn and stay updated" (a managed card: label, title, text, note, button). */
function LearnCard({ item, href, locale }) {
  const tag = mt(item.tag);
  const note = href ? "" : mt(item.note);
  const cta = mt(item.cta_label);
  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      {tag && <p className="m-0! text-[11px] font-bold uppercase tracking-[0.14em] text-[#922e0c]">{tag}</p>}
      <h3 className="m-0! mt-3! text-lg! font-semibold! leading-snug! tracking-tight! text-[#09263e]!">{mt(item.title)}</h3>
      {mt(item.text) && <p className="m-0! mt-2! text-sm leading-6 text-slate-600">{mt(item.text)}</p>}
      {note && <p className="m-0! mt-3! text-xs leading-5 text-slate-600">{note}</p>}
      {cta && (
        <span className="mt-auto flex pt-5">
          {href ? (
            <SmartLink
              href={href}
              locale={locale}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#09263e]/60 bg-white px-5 text-sm font-semibold text-[#09263e]! no-underline transition-colors hover:bg-[#eaff6b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
            >
              {cta}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </SmartLink>
          ) : (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-5 text-sm font-semibold text-slate-600"
            >
              {cta}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </button>
          )}
        </span>
      )}
    </article>
  );
}

/**
 * Live sessions (the next ones) and the WhatsApp groups, both from the API.
 * `managed` is the page's learn-live section: its heading and its cards (live
 * sessions, WhatsApp community, advisers). A card without a link of its own
 * links to the live page when there is something live behind it (sessions,
 * the advisers page) and is otherwise a disabled placeholder.
 */
export function LearnSection({ id, sessions, locale, t, tx, managed }) {
  const cards = rowsOf(managed?.items).filter((item) => mt(item.title));
  const liveHrefs = [sessions.length > 0 ? "/sessions" : "", "", "/advisers"];
  return (
    <Band id={id} labelledBy={`${id}-title`} tone="grey" className={NAV_OFFSET}>
      <BandHeading
        id={`${id}-title`}
        eyebrow={mt(managed?.eyebrow) || tx("resources.learn.eyebrow", "Learn and stay updated")}
        title={mt(managed?.heading) || tx("resources.learn.title", "Learn with other owners, and hear about changes first.")}
        intro={mt(managed?.intro)}
        className="mb-8"
      />
      {cards.length > 0 && (
        <ul className="m-0 mb-8 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 xl:grid-cols-3">
          {cards.map((item, index) => (
            <li key={`${index}-${mt(item.title)}`} className="m-0 min-w-0">
              <LearnCard item={item} href={mt(item.href) || liveHrefs[index] || ""} locale={locale} />
            </li>
          ))}
        </ul>
      )}
      {sessions.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2 xl:grid-cols-3">
          {sessions.map((session) => (
            <li key={session.slug} className="m-0 min-w-0">
              <SessionCard session={session} locale={locale} t={t} />
            </li>
          ))}
        </ul>
      ) : (
        cards.length === 0 && (
          <p className="m-0! rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-slate-700">
            {tx("resources.learn.none", "No live sessions are scheduled right now. Join a WhatsApp group below to hear first.")}
          </p>
        )
      )}
      {cards.length === 0 && (
        <div className="mt-6">
          <Link href={`/${locale}/sessions`} className={BTN_OUTLINE}>
            {tx("resources.learn.all", "All live sessions")}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      )}
      <div className="mt-10">
        <CommunityInvite placement="resources" layout="full" locale={locale} />
      </div>
    </Band>
  );
}

// ── FAQ preview ─────────────────────────────────────────────────────────────

/** A few questions from the FAQ hub, with a link to all of them. `items`: [{ id, question, answerHtml }]. */
export function FaqPreviewSection({ id, items, locale, tx, managed }) {
  return (
    <Band id={id} labelledBy={`${id}-title`} tone="white" className={NAV_OFFSET}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
        <div>
          <BandHeading
            id={`${id}-title`}
            eyebrow={mt(managed?.eyebrow) || tx("resources.faq.eyebrow", "FAQs")}
            title={mt(managed?.heading) || tx("resources.faq.title", "Questions owners ask us first.")}
            intro={mt(managed?.intro) || tx("resources.faq.intro", "A few short answers. The full list is grouped by topic.")}
          />
          <div className="mt-6">
            <SmartLink href={mt(managed?.cta_href) || "/faqs"} locale={locale} className={BTN_LIME}>
              {mt(managed?.cta_label) || tx("resources.faq.all", "View all FAQs")}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </SmartLink>
          </div>
        </div>
        <FaqCardList items={items} defaultOpen="first" />
      </div>
    </Band>
  );
}
