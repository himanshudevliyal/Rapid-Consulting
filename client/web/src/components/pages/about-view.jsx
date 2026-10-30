import Link from "next/link";
import { ArrowUpRight, Building2, FileCheck2, Network, BookOpen } from "lucide-react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Icon } from "@/components/common/icon";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { Carousel } from "@/components/home/carousel";
import { SectionHeading } from "@/components/home/section-heading";
import { BTN_LIME, BTN_OUTLINE } from "@/components/home/styles";
import { ImagePlaceholder } from "@/components/ui/image-placeholder";
import { LogoStrip } from "@/home/logo-strip";
import placeholders from "@/lib/data/home-placeholders.json";
import { loadCategoryGroups, loadTeam } from "@/lib/content/site-data";
import { b2eText } from "@/lib/pages/b2e-copy";
import { getPage } from "@/lib/pages/content";
import { homeText } from "@/lib/pages/home-copy";
import { copy } from "@/lib/pages/w4-copy";
import { WHATSAPP_LABEL, serviceHref, servicesHref } from "@/lib/site";
import { Band, CARD, EYEBROW_FLAT, H3_CLASS, HeroBand, PlaceholderChip, StepCards, WhatsAppOutline } from "./b2e-ui";
import { Html } from "./content-primitives";
import { TeamDirectory, groupsFromSection, leaderOf, normalizeTeamGroups } from "./team-section";

const ADVANTAGE_ICONS = [Building2, FileCheck2, Network, BookOpen];

// Section ids of the About manuscript, English and Hindi.
const IDS = {
  story: ["the-rapid-story", "रैपिड-की-कहानी"],
  advantage: ["the-rapid-advantage", "रैपिड-के-साथ-काम-करने-के-फायदे"],
  team: ["the-rapid-team", "रैपिड-की-टीम"],
  contact: ["discuss-your-project", "अपने-प्रोजेक्ट-पर-बात-करें"],
};

// "<h3>Title</h3><p>…</p>…" -> [{ title, html }]
const cardsOf = (html = "") =>
  html
    .split(/(?=<h3\b)/)
    .filter((block) => block.startsWith("<h3"))
    .map((block) => {
      const title = (block.match(/^<h3\b[^>]*>([\s\S]*?)<\/h3>/)?.[1] || "").replace(/<[^>]+>/g, "").trim();
      return { title, html: block.replace(/^<h3\b[^>]*>[\s\S]*?<\/h3>/, "") };
    });

const plain = (value = "") => String(value).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

// The "kinds of work": the service categories of the admin panel (a category's
// overview page first). With no API data they fall back to the service families
// the About manuscript already describes (S01-S05 content pages).
export async function loadKinds(locale) {
  const groups = await loadCategoryGroups(locale).catch(() => []);
  if (groups.length) {
    return groups.map((group) => {
      const lead = group.family ?? group.services[0];
      const own = plain(group.family?.short_description);
      return {
        id: group.id ?? group.slug,
        title: group.title,
        href: lead ? serviceHref(lead, locale) : servicesHref(locale),
        hint: own || group.services.slice(0, 3).map((service) => service.title).join(" · "),
        icon: group.family?.icon || group.services[0]?.icon || "file-text",
        count: group.services.length,
      };
    });
  }
  return ["S02", "S01", "S03", "S04", "S05"]
    .map((code) => getPage(code, locale) || getPage(code, "en"))
    .filter(Boolean)
    .map((page) => ({ id: page.id, title: page.title, href: page.href, hint: plain(page.description), icon: page.icon || "file-text", count: 0 }));
}

export function GlanceRow({ label, children, big, last }) {
  return (
    <div className={`grid gap-1 py-3.5 sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-4 ${last ? "" : "border-b border-slate-200"}`}>
      <dt className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">{label}</dt>
      <dd className={`m-0 min-w-0 ${big ? "text-3xl font-bold leading-none tracking-tight text-[#09263e]" : "text-[15px] font-semibold leading-6 text-[#09263e]"}`}>
        {children}
      </dd>
    </div>
  );
}

export function KindCard({ kind, exploreLabel, countLabel }) {
  const Tag = kind.href ? "a" : "div";
  return (
    <Tag
      {...(kind.href ? { href: kind.href } : {})}
      className="group flex h-full min-h-[210px] flex-col rounded-2xl border border-slate-200 bg-white p-5 text-[#09263e]! no-underline shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#09263e]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
    >
      <span className="flex items-start justify-between gap-3">
        <Icon name={kind.icon} />
        {kind.href && <ArrowUpRight className="size-5 shrink-0 text-slate-500 transition-colors group-hover:text-[#09263e]" aria-hidden="true" />}
      </span>
      <span className="mt-4 block text-lg font-semibold leading-snug text-[#09263e]">{kind.title}</span>
      {kind.hint && <span className="mt-2 block text-sm leading-6 text-slate-700">{kind.hint}</span>}
      {(kind.count > 0 || exploreLabel) && (
        <span className="mt-auto pt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[#1f5d57]">
          {kind.count > 0 ? countLabel(kind.count) : exploreLabel}
        </span>
      )}
    </Tag>
  );
}

// About us (Figma 1501-77607): breadcrumb, hero with "Rapid at a glance", client
// logos, the one-owner comparison, the manuscript story and advantages, the kinds
// of work, the team (leadership 3-up, experts and the wider team 4-up, each card
// linking to its profile) and how Rapid works. `page` is the About manuscript
// (A03); the team comes from the Advisers of the admin panel. The closing
// enquiry panel is the footer's, so there is no second form here.
export async function AboutUsView({ page, t, has }) {
  const locale = page.locale;
  const text = b2eText(t);
  const home = homeText(t, has, locale);

  const find = (ids, fallbackIndex) => page.sections.find((s) => ids.includes(s.id)) ?? page.sections[fallbackIndex];
  const story = find(IDS.story, 0);
  const advantage = find(IDS.advantage, 1);
  const team = find(IDS.team, 2);
  const contact = find(IDS.contact, 3);

  const [apiGroups, kinds] = await Promise.all([loadTeam(), loadKinds(locale)]);
  // Until the first person is added in the admin panel, show the agreed
  // structure from the manuscript's labelled placeholders.
  const groups = normalizeTeamGroups(apiGroups.length ? apiGroups : groupsFromSection(team, locale), t);
  const teamIntro = (team?.html || "").split(/<h3\b/)[0];
  const cards = cardsOf(advantage?.html);
  const leader = leaderOf(groups);

  const logoTiles = Array.from({ length: placeholders.logos.count }, (_, index) =>
    home("homeA.logos.item", { n: String(index + 1).padStart(2, "0") }),
  );

  const coverText = kinds.length ? kinds.map((kind) => kind.title).join(", ") : text("about.glance.coverFallback");
  const groupNames = groups.map((group) => group.title).filter(Boolean).join(" · ");

  const crumbs = [
    { label: t("common.home"), href: `/${locale}` },
    { label: t("breadcrumb.about"), href: `/${locale}/about` },
  ];

  const glance = (
    <aside aria-labelledby="about-glance-title" className={CARD}>
      <h2 id="about-glance-title" className="m-0! text-xl! font-semibold! leading-snug! tracking-tight! text-[#09263e]!">
        {text("about.glance.title")}
      </h2>
      <dl className="m-0 mt-3">
        <GlanceRow label={text("about.glance.based")}>{text("about.glance.basedValue")}</GlanceRow>
        <GlanceRow label={text("about.glance.since")} big>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {text("about.glance.sinceValue")}
            <PlaceholderChip>{text("about.glance.placeholder")}</PlaceholderChip>
          </span>
        </GlanceRow>
        <GlanceRow label={text("about.glance.team")}>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
            {text("about.glance.teamValue")}
            <PlaceholderChip>{text("about.glance.placeholder")}</PlaceholderChip>
          </span>
          {groupNames && <span className="mt-1 block text-sm font-normal text-slate-700">{groupNames}</span>}
        </GlanceRow>
        <GlanceRow label={text("about.glance.cover")}>
          <span className="font-normal text-slate-800">{coverText}</span>
        </GlanceRow>
        <GlanceRow label={text("about.glance.start")}>{text("about.glance.startValue")}</GlanceRow>
        <GlanceRow label={text("about.glance.file")} last>
          {text("about.glance.fileValue")}
        </GlanceRow>
      </dl>
    </aside>
  );

  return (
    <>
      <Breadcrumbs items={crumbs} t={t} />
      <main id="main">
        <HeroBand
          id="about-title"
          eyebrow={text("about.eyebrow")}
          title={text("about.title")}
          intro={<Html html={page.introHtml} />}
          actions={
            <>
              <EnquiryTrigger className={BTN_LIME} source="about-hero" pageTitle={page.h1}>
                {text("common.discuss")}
                <span aria-hidden="true">→</span>
              </EnquiryTrigger>
              <WhatsAppOutline label={text("common.whatsapp", { number: WHATSAPP_LABEL })} />
            </>
          }
          aside={glance}
        />

        <div className="bg-white pt-8 sm:pt-10">
          <p className={`${EYEBROW_FLAT} text-center`}>{text("about.logos.eyebrow")}</p>
          <LogoStrip
            title={home("homeA.logos.title")}
            tiles={logoTiles}
            note={placeholders.logos.placeholder ? home("homeA.logos.placeholder") : ""}
          />
        </div>

        <Band tone="grey" labelledBy="about-compare-title">
          <h2 id="about-compare-title" className="sr-only">
            {text("about.compare.heading")}
          </h2>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-8">
            <div className="grid gap-6 md:grid-cols-[1.1fr_1fr_1fr] md:gap-8">
              <div>
                <p className="m-0! text-xs font-bold uppercase tracking-[0.14em] text-slate-600">{text("about.compare.colSituation")}</p>
                <p className="mb-0! mt-2! text-xl font-semibold leading-snug text-[#09263e]">{text("about.compare.situation")}</p>
              </div>
              <div className="md:border-l md:border-slate-200 md:pl-8">
                <p className="m-0! text-xs font-bold uppercase tracking-[0.14em] text-slate-600">{text("about.compare.colEffect")}</p>
                <p className="mb-0! mt-2! text-lg leading-snug text-slate-800">{text("about.compare.effect")}</p>
              </div>
              <div className="md:border-l md:border-slate-200 md:pl-8">
                <p className="m-0! text-xs font-bold uppercase tracking-[0.14em] text-[#922e0c]">{text("about.compare.colRapid")}</p>
                <Link
                  href={`/${locale}/how-we-work`}
                  className="mt-2 inline-flex items-center gap-1.5 text-lg font-semibold leading-snug text-[#1f5d57]! underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
                >
                  {text("about.compare.rapid")}
                  <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="m-0! max-w-2xl text-xl font-semibold leading-snug text-[#09263e]">{text("about.compare.closing")}</p>
            <EnquiryTrigger className={BTN_LIME} source="about-compare" pageTitle={page.h1}>
              {text("common.discuss")}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </EnquiryTrigger>
          </div>
        </Band>

        {story && (
          <Band id={story.id} labelledBy={`${story.id}-title`}>
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <div>
                <SectionHeading id={`${story.id}-title`} eyebrow={copy(t, "aboutUs.story.eyebrow")} title={story.title} />
                <Html html={story.html} className="mt-6 text-[17px] leading-8 text-slate-700 [&_p]:m-0 [&_p+p]:mt-4" />
              </div>
              <ImagePlaceholder ratio="4/3" label={copy(t, "aboutUs.story.photo")} className="rounded-2xl" />
            </div>
          </Band>
        )}

        {advantage && cards.length > 0 && (
          <Band id={advantage.id} tone="sage" labelledBy={`${advantage.id}-title`}>
            <SectionHeading id={`${advantage.id}-title`} eyebrow={copy(t, "aboutUs.advantage.eyebrow")} title={advantage.title} />
            <ul className="m-0 mt-8 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
              {cards.map((card, index) => {
                const CardIcon = ADVANTAGE_ICONS[index % ADVANTAGE_ICONS.length];
                return (
                  <li key={card.title} className="m-0 flex">
                    <article className="flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-6">
                      <span className="mb-5 flex size-12 items-center justify-center rounded-xl bg-[#09263e] text-[#eaff6b]">
                        <CardIcon className="size-6" strokeWidth={1.6} aria-hidden="true" />
                      </span>
                      <h3 className={H3_CLASS}>{card.title}</h3>
                      <Html
                        html={card.html}
                        className="mt-3 text-[15px] leading-7 text-slate-700 [&_a]:font-semibold [&_a]:text-[#1f5d57] [&_a:hover]:underline [&_p]:m-0 [&_p+p]:mt-3"
                      />
                    </article>
                  </li>
                );
              })}
            </ul>
          </Band>
        )}

        {kinds.length > 0 && (
          <Band id="what-we-do" labelledBy="about-what-title">
            <Carousel
              label={text("about.what.carousel")}
              previous={text("common.previous")}
              next={text("common.next")}
              lead={
                <SectionHeading
                  id="about-what-title"
                  eyebrow={text("about.what.eyebrow")}
                  title={kinds.length === 6 ? text("about.what.titleSix") : text("about.what.titleMany")}
                  intro={text("about.what.intro")}
                />
              }
            >
              {kinds.map((kind) => (
                <KindCard
                  key={kind.id}
                  kind={kind}
                  exploreLabel={text("about.what.explore")}
                  countLabel={(count) => text("about.what.count", { count })}
                />
              ))}
            </Carousel>
          </Band>
        )}

        {team && (
          <Band id={team.id} tone="grey" labelledBy={`${team.id}-title`}>
            <SectionHeading id={`${team.id}-title`} eyebrow={copy(t, "aboutUs.team.eyebrow")} title={team.title} />
            {teamIntro.trim() && (
              <Html html={teamIntro} className="mt-4 max-w-2xl text-base leading-7 text-slate-700 [&_p]:m-0" />
            )}
            <div className="mt-10">
              <TeamDirectory groups={groups} locale={locale} t={t} />
            </div>
            {leader && (
              <div className="mt-10">
                <Link href={leader.href} className={BTN_LIME}>
                  {text("about.people.meet", { name: leader.name })}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            )}
          </Band>
        )}

        <Band id="how-we-work" labelledBy="about-how-title">
          <SectionHeading id="about-how-title" eyebrow={text("about.how.eyebrow")} title={text("about.how.title")} />
          <div className="mt-8">
            <StepCards
              steps={[1, 2, 3].map((n) => ({ title: text(`about.how.s${n}.title`), text: text(`about.how.s${n}.text`) }))}
            />
          </div>
          <div className="mt-8">
            <Link href={`/${locale}/how-we-work`} className={BTN_OUTLINE}>
              {text("about.how.cta")}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </Band>

        {contact && (
          <Band id={contact.id} tone="sage" labelledBy={`${contact.id}-title`}>
            <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
              <div>
                <SectionHeading id={`${contact.id}-title`} eyebrow={t("site.about.letsTalk")} title={contact.title} />
                <Html html={contact.html} className="mt-4 max-w-xl text-base leading-7 text-slate-700 [&_p]:m-0" />
              </div>
              <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                <EnquiryTrigger className={BTN_LIME} source="about-discuss" pageTitle={page.h1}>
                  {text("common.discuss")}
                  <span aria-hidden="true">→</span>
                </EnquiryTrigger>
                <WhatsAppOutline label={text("common.whatsapp", { number: WHATSAPP_LABEL })} />
              </div>
            </div>
          </Band>
        )}
      </main>
    </>
  );
}
