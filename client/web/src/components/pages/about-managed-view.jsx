import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { JsonLd } from "@/components/common/json-ld";
import { ClosingEnquiryPanel } from "@/components/forms/closing-enquiry-panel";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { Carousel } from "@/components/home/carousel";
import { SectionHeading } from "@/components/home/section-heading";
import { BTN_LIME, BTN_OUTLINE } from "@/components/home/styles";
import { BLOCKS, blockFor } from "@/components/site-pages/block-registry";
import { faqAccordionEntries } from "@/components/site-pages/managed-blocks";
import { siteText } from "@/components/site-pages/site-text";
import { ReviewsSection } from "@/home/reviews-section";
import { loadTeam } from "@/lib/content/site-data";
import { plainText } from "@/lib/content/site-page-adapters";
import { crumbsFrom, first, localHref, managedCardProps, mergeCard, paragraphs, rows, text as str } from "@/lib/content/managed-text";
import { b2eText } from "@/lib/pages/b2e-copy";
import { homeText } from "@/lib/pages/home-copy";
import { WHATSAPP_LABEL, WHATSAPP_NUMBER } from "@/lib/site";
import { Band, CARD, HeroBand, PlaceholderChip, StepCards, WhatsAppOutline } from "./b2e-ui";
import { GlanceRow, KindCard, loadKinds } from "./about-view";
import { TeamDirectory, groupsFromSection, leaderOf, normalizeTeamGroups } from "./team-section";

// About us (Figma 1501-77607) drawn from the managed page "about" (admin panel ->
// Pages). The layout is the website's own; every heading, label, paragraph and
// button comes from the page's sections, in the page's order. A field left empty
// keeps the website's built-in wording. Sections the page adds that this view does
// not know are drawn by the generic page renderer.
//
// Live data stays live: the team is the Advisers of the admin panel (the page's
// people cards are used only until the first adviser is added).

const WHATSAPP_HREF = `https://wa.me/${WHATSAPP_NUMBER}`;

function Generic({ section, ctx }) {
  const block = blockFor(section.type);
  if (!block) return null;
  const { Component } = block;
  return <Component section={section} ctx={ctx} />;
}

function Paragraphs({ value }) {
  return paragraphs(value).map((part, index) => <p key={index}>{part}</p>);
}

// A main/hero button: an address opens it, an empty one opens the enquiry form.
function Action({ label, href, locale, source, pageTitle, className = BTN_LIME, arrow = true }) {
  if (!str(label)) return null;
  const to = localHref(href, locale);
  const icon = arrow ? <span aria-hidden="true">→</span> : null;
  if (to) {
    return /^https?:/i.test(to) ? (
      <a href={to} target="_blank" rel="noopener noreferrer" className={className}>
        {label}
        {icon}
      </a>
    ) : (
      <Link href={to} className={className}>
        {label}
        {icon}
      </Link>
    );
  }
  return (
    <EnquiryTrigger className={className} source={source} pageTitle={pageTitle}>
      {label}
      {icon}
    </EnquiryTrigger>
  );
}

function PeopleCards({ items, t, text }) {
  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => {
        const name = str(item.name);
        const body = (
          <>
            <div className="relative flex aspect-[4/3.4] w-full items-center justify-center overflow-hidden bg-[#e8efec]">
              {str(item.initials) ? (
                <span className="text-5xl font-semibold tracking-wide text-[#1f5d57]/70" aria-hidden="true">
                  {str(item.initials)}
                </span>
              ) : null}
              {str(item.caption) && <span className="absolute inset-x-0 bottom-3 text-center text-xs text-slate-600">{str(item.caption)}</span>}
            </div>
            <div className="flex flex-1 flex-col gap-1.5 px-5 py-5">
              {str(item.tag) && <p className="m-0! text-[11px] font-bold uppercase tracking-[0.14em] text-[#922e0c]">{str(item.tag)}</p>}
              {name ? (
                <p className="m-0 text-lg font-bold leading-snug text-[#09263e]">{name}</p>
              ) : (
                <PlaceholderChip>{t("site.team.nameToBeAdded")}</PlaceholderChip>
              )}
              {str(item.role) ? (
                <p className="m-0 text-sm font-medium leading-5 text-slate-700">{str(item.role)}</p>
              ) : (
                !name && <p className="m-0 text-sm italic leading-5 text-slate-600">{text("about.people.roleTbc")}</p>
              )}
              {str(item.detail) && (
                <p className="m-0 mt-1 w-fit max-w-full rounded-full border border-[#09263e]/15 bg-[#f4f7f5] px-3 py-1 text-xs font-medium leading-4 text-[#09263e]">
                  {str(item.detail)}
                </p>
              )}
              {str(item.link_label) && str(item.href) && (
                <span className="mt-auto pt-4 text-sm font-semibold text-[#1f5d57]">
                  {str(item.link_label)} <span aria-hidden="true">↗</span>
                </span>
              )}
            </div>
          </>
        );
        const shell = "group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm";
        return (
          <li key={index} className="min-w-0">
            {str(item.href) ? (
              <Link href={item.href} className={`${shell} text-[#09263e] no-underline`}>
                {body}
              </Link>
            ) : (
              <div className={shell}>{body}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export async function ManagedAboutView({ managed, page, t, has, locale }) {
  const text = b2eText(t);
  const home = homeText(t, has, locale);
  const tx = siteText(t);
  const pageTitle = managed.page.h1 || page?.h1;

  const hero = managed.get("hero") ?? {};
  const [apiGroups, kinds] = await Promise.all([loadTeam(), loadKinds(locale)]);

  const ctxBase = { page: managed.page, locale, t, tx, has, records: {}, topic: "", stages: [], inColumn: false };
  let wash = true;
  const ctx = (section) => {
    const tone = wash ? "wash" : "plain";
    if (!BLOCKS[section.type]?.selfTone) wash = !wash;
    return { ...ctxBase, tone };
  };

  const crumbs = crumbsFrom(hero.breadcrumb, locale, `/${locale}/about`, [
    { label: t("common.home"), href: `/${locale}` },
    { label: t("breadcrumb.about"), href: `/${locale}/about` },
  ]);

  // ── hero ──
  const glanceRows = rows(hero.card_rows).filter((row) => str(row.label) || str(row.text));
  const legacyGlance = [
    [text("about.glance.based"), text("about.glance.basedValue")],
    [text("about.glance.since"), text("about.glance.sinceValue")],
    [text("about.glance.team"), text("about.glance.teamValue")],
    [text("about.glance.cover"), kinds.length ? kinds.map((kind) => kind.title).join(", ") : text("about.glance.coverFallback")],
    [text("about.glance.start"), text("about.glance.startValue")],
    [text("about.glance.file"), text("about.glance.fileValue")],
  ];
  const glance = (glanceRows.length ? glanceRows.map((row) => [str(row.label), str(row.text)]) : legacyGlance).map(([label, value]) => ({ label, value }));

  const glanceCard = (
    <aside aria-labelledby="about-glance-title" className={CARD}>
      <h2 id="about-glance-title" className="m-0! text-xl! font-semibold! leading-snug! tracking-tight! text-[#09263e]!">
        {first(hero.card_title, text("about.glance.title"))}
      </h2>
      <dl className="m-0 mt-3">
        {glance.map((row, index) => (
          <GlanceRow key={`${row.label}-${index}`} label={row.label} big={index === 1} last={index === glance.length - 1}>
            {row.value}
          </GlanceRow>
        ))}
      </dl>
    </aside>
  );

  const secondaryLabel = first(hero.secondary_label, text("common.whatsapp", { number: WHATSAPP_LABEL }));
  const secondaryHref = localHref(hero.secondary_href, locale, WHATSAPP_HREF);

  const heroBand = (
    <HeroBand
      id="about-title"
      eyebrow={first(hero.eyebrow, text("about.eyebrow"))}
      title={first(hero.heading, text("about.title"))}
      intro={str(hero.intro) ? <Paragraphs value={hero.intro} /> : undefined}
      actions={
        <>
          <Action
            label={first(hero.primary_label, text("common.discuss"))}
            href={hero.primary_href}
            locale={locale}
            source="about-hero"
            pageTitle={pageTitle}
          />
          {secondaryHref === WHATSAPP_HREF ? (
            <WhatsAppOutline label={secondaryLabel} />
          ) : (
            <a href={secondaryHref} className={BTN_OUTLINE}>
              {secondaryLabel}
            </a>
          )}
        </>
      }
      aside={glanceCard}
    />
  );

  // ── sections, in the page's order ──
  const faqEntries = managed.list.filter((section) => section.type === "faq_accordion").flatMap((section) => faqAccordionEntries(section.data));

  const renderSection = (section) => {
    const data = section.data;
    const id = section.anchor;
    switch (id) {
      case "hero":
        return null;

      case "clients":
        return <Generic key={section.id} section={section} ctx={ctx(section)} />;

      case "why-one-owner": {
        const columns = rows(data.columns).map((column) => str(column.text));
        const body = rows(data.rows).filter((row) => str(row.cell_1) || str(row.cell_2) || str(row.cell_3));
        if (!body.length) return null;
        return (
          <Band key={section.id} id={id} tone="grey" labelledBy={`${id}-title`}>
            <SectionHeading id={`${id}-title`} eyebrow={str(data.eyebrow)} title={first(data.heading, text("about.compare.heading"))} />
            <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white">
              {columns.some(Boolean) && (
                <div className="hidden gap-8 border-b border-slate-200 bg-[#f6f8f6] px-8 py-3 md:grid md:grid-cols-[1.1fr_1fr_1fr]">
                  {columns.slice(0, 3).map((column, index) => (
                    <p key={index} className={`m-0! text-xs font-bold uppercase tracking-[0.14em] ${index === 2 ? "text-[#922e0c]" : "text-slate-600"}`}>
                      {column}
                    </p>
                  ))}
                </div>
              )}
              <ul className="m-0 list-none divide-y divide-slate-200 p-0">
                {body.map((row, index) => {
                  const href = localHref(row.link_href, locale);
                  return (
                    <li key={index} className="m-0 grid gap-4 p-5 sm:p-8 md:grid-cols-[1.1fr_1fr_1fr] md:gap-8 md:py-6">
                      <div>
                        {columns[0] && <p className="m-0! mb-1! text-xs font-bold uppercase tracking-[0.14em] text-slate-600 md:hidden">{columns[0]}</p>}
                        <p className="m-0! text-lg font-semibold leading-snug text-[#09263e]">{str(row.cell_1)}</p>
                      </div>
                      <div>
                        {columns[1] && <p className="m-0! mb-1! text-xs font-bold uppercase tracking-[0.14em] text-slate-600 md:hidden">{columns[1]}</p>}
                        <p className="m-0! text-base leading-snug text-slate-800">{str(row.cell_2)}</p>
                      </div>
                      <div>
                        {columns[2] && <p className="m-0! mb-1! text-xs font-bold uppercase tracking-[0.14em] text-[#922e0c] md:hidden">{columns[2]}</p>}
                        {href ? (
                          <Link
                            href={href}
                            className="inline-flex items-center gap-1.5 text-base font-semibold leading-snug text-[#1f5d57]! underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
                          >
                            {str(row.cell_3)}
                            <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                          </Link>
                        ) : (
                          <p className="m-0! text-base font-semibold leading-snug text-[#1f5d57]">{str(row.cell_3)}</p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
            {(str(data.closing_text) || str(data.cta_label)) && (
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                {str(data.closing_text) && <p className="m-0! max-w-2xl text-xl font-semibold leading-snug text-[#09263e]">{str(data.closing_text)}</p>}
                <Action label={str(data.cta_label)} href={data.cta_href} locale={locale} source="about-compare" pageTitle={pageTitle} />
              </div>
            )}
          </Band>
        );
      }

      case "what-we-do": {
        const cards = rows(data.items).filter((item) => str(item.title));
        const list = cards.length
          ? cards.map((item, index) => ({
              id: `${index}-${str(item.title)}`,
              title: str(item.title),
              hint: str(item.text),
              href: localHref(item.href, locale) || kinds[index]?.href || "",
              icon: kinds[index]?.icon || "file-text",
              count: 0,
              label: str(item.cta_label),
            }))
          : kinds;
        if (!list.length) return null;
        return (
          <Band key={section.id} id={id} labelledBy="about-what-title">
            <Carousel
              label={text("about.what.carousel")}
              previous={text("common.previous")}
              next={text("common.next")}
              lead={
                <SectionHeading
                  id="about-what-title"
                  eyebrow={first(data.eyebrow, text("about.what.eyebrow"))}
                  title={first(data.heading, list.length === 6 ? text("about.what.titleSix") : text("about.what.titleMany"))}
                  intro={first(data.intro, text("about.what.intro"))}
                />
              }
            >
              {list.map((kind) => (
                <KindCard
                  key={kind.id}
                  kind={kind}
                  exploreLabel={kind.label || (cards.length ? "" : text("about.what.explore"))}
                  countLabel={(count) => text("about.what.count", { count })}
                />
              ))}
            </Carousel>
            {str(data.cta_label) && (
              <div className="mt-8">
                <Action label={str(data.cta_label)} href={data.cta_href} locale={locale} source="about-what" pageTitle={pageTitle} className={BTN_OUTLINE} arrow={false} />
              </div>
            )}
          </Band>
        );
      }

      case "people": {
        const items = rows(data.items);
        // Until the first adviser exists the page's own cards are shown.
        const groups = apiGroups.length ? normalizeTeamGroups(apiGroups, t) : [];
        const legacyTeam = page?.sections?.find((section) => ["the-rapid-team", "रैपिड-की-टीम"].includes(section.id));
        const fallbackGroups = !groups.length && !items.length ? normalizeTeamGroups(groupsFromSection(legacyTeam, locale), t) : [];
        const shown = groups.length ? groups : fallbackGroups;
        const leader = leaderOf(shown);
        const ctaLabel = first(data.cta_label, leader ? text("about.people.meet", { name: leader.name }) : "");
        const ctaHref = localHref(data.cta_href, locale) || leader?.href || "";
        return (
          <Band key={section.id} id={id} tone="grey" labelledBy={`${id}-title`}>
            <SectionHeading id={`${id}-title`} eyebrow={str(data.eyebrow)} title={first(data.heading, legacyTeam?.title, text("about.title"))} />
            {str(data.intro) && <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">{str(data.intro)}</p>}
            <div className="mt-10">
              {shown.length ? <TeamDirectory groups={shown} locale={locale} t={t} /> : <PeopleCards items={items} t={t} text={text} />}
            </div>
            {str(data.footer_text) && <p className="mb-0! mt-8! max-w-2xl text-base leading-7 text-slate-700">{str(data.footer_text)}</p>}
            {ctaLabel && ctaHref && (
              <div className="mt-8">
                <Link href={ctaHref} className={BTN_LIME}>
                  {ctaLabel}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </Band>
        );
      }

      case "how-we-work": {
        const steps = rows(data.items)
          .filter((item) => str(item.title))
          .map((item) => ({ title: str(item.title), text: str(item.text) }));
        const list = steps.length ? steps : [1, 2, 3].map((n) => ({ title: text(`about.how.s${n}.title`), text: text(`about.how.s${n}.text`) }));
        return (
          <Band key={section.id} id={id} labelledBy="about-how-title">
            <SectionHeading id="about-how-title" eyebrow={first(data.eyebrow, text("about.how.eyebrow"))} title={first(data.heading, text("about.how.title"))} />
            <div className="mt-8">
              <StepCards steps={list} />
            </div>
            <div className="mt-8">
              <Link href={localHref(data.cta_href, locale, `/${locale}/how-we-work`)} className={BTN_OUTLINE}>
                {first(data.cta_label, text("about.how.cta"))}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </Band>
        );
      }

      case "reviews":
        return (
          <div key={section.id} id={id} className="scroll-mt-24">
            <ReviewsSection text={home} data={data} />
          </div>
        );

      case "closing": {
        const title = first(data.form_title, data.heading);
        const base = {
          title,
          hint: str(data.form_hint) || undefined,
          seal: data.show_seal === false ? "none" : "free",
          source: "about-closing",
          pageId: managed.page.pageKey || undefined,
          pageTitle,
          serviceName: title,
          select: {
            label: text("contact.form.choice"),
            required: data.select_required !== false,
            options: [text("contact.form.haryana"), text("contact.form.another"), text("contact.form.notSure")],
            placeholder: text("contact.form.choicePlaceholder"),
          },
          fields: [data.show_district === false ? "" : "district", data.show_activity === false ? "" : "activity"].filter(Boolean),
          labels: {
            name: home("homeA.form.name"),
            phone: home("homeA.form.phone"),
            district: text("contact.form.district"),
            activity: text("contact.form.activity"),
            optional: text("contact.form.optional"),
            choiceError: text("contact.form.choiceError"),
            consent: home("homeA.form.consent"),
            consentHelp: home("homeA.form.consentHelp"),
            another: home("homeA.form.another"),
          },
          submitLabel: text("contact.form.submit"),
          helper: text("contact.form.helper"),
          whatsapp: true,
          whatsappLabel: text("common.chatWhatsapp"),
        };
        return (
          <ClosingEnquiryPanel
            key={section.id}
            id={id}
            eyebrow={str(data.eyebrow) || undefined}
            heading={first(data.heading, title)}
            intro={str(data.intro) || undefined}
            photoNote={str(data.photo_note) || undefined}
            card={mergeCard(base, managedCardProps(data))}
          />
        );
      }

      default:
        return <Generic key={section.id} section={section} ctx={ctx(section)} />;
    }
  };

  return (
    <>
      <Breadcrumbs items={crumbs} t={t} />
      {faqEntries.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqEntries.map((entry) => ({
              "@type": "Question",
              name: entry.question,
              acceptedAnswer: { "@type": "Answer", text: plainText(entry.answerHtml) },
            })),
          }}
        />
      )}
      <main id="main">
        {heroBand}
        {managed.list.map(renderSection)}
      </main>
    </>
  );
}
