import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { contentPageMetadata, robots } from "@/lib/seo";
import { PageAlternates } from "@/components/layout/page-alternates";
import { ActiveSectionNav } from "@/components/common/active-section-nav";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ClientTicker } from "@/components/common/client-ticker";
import { ClosingEnquiryPanel } from "@/components/forms/closing-enquiry-panel";
import { Band, BandHeading, GuidanceSections, HeroActions, HeroBand } from "@/components/pages/b2d-parts";
import { FaqPreviewSection, LearnSection, SchemesPanel, StageGuidesSection, findByTitle } from "@/components/pages/resource-blocks";
import { ResourceSearchCard } from "@/components/pages/resource-search-card";
import { ResourceFeatured, ResourceTopics } from "@/components/pages/resource-topics";
import { NAV_OFFSET } from "@/components/site-pages/shared";
import { articleToSummary } from "@/lib/content/adapters";
import { loadInitialList } from "@/lib/content/loaders";
import { loadManagedPage, loadSitePage } from "@/lib/content/site-page-data";
import { formatDate } from "@/lib/format-date";
import { faqTopics } from "@/lib/content/site-page-adapters";
import { loadSessions } from "@/lib/content/site-data";
import { PROJECT_STAGES } from "@/lib/site-navigation";
import { b2dText } from "@/lib/pages/b2d-text";
import { enquiryCard } from "@/lib/pages/b2d-forms";
import { linksApiContent } from "@/lib/pages/card-copy";
import { effectiveState } from "@/lib/pages/session-format";
import { resolveContentPath } from "@/lib/pages/resolve";
import { closingCard, dataOf, heroHeading, heroIntro, mt, rowsOf, textsOf, withManagedMeta } from "@/lib/pages/managed-view";

const PATH = "/resources";
const FAQ_PREVIEW = 5;
const SESSIONS_SHOWN = 3;

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") return { robots };
  const t = await getTranslations({ locale });
  const managed = await loadManagedPage("resources", locale);
  return contentPageMetadata(withManagedMeta(found.page, managed), locale, t("meta.siteName"), PATH);
}

// A few questions for the preview: the first question of each FAQ-hub topic in
// turn, then the next ones, so every topic is represented. [] when the FAQ page
// cannot be read (the section is then left out).
async function faqPreview(locale) {
  try {
    let loaded = await loadSitePage("faqs", locale);
    if (loaded.kind !== "page" && locale !== "en") loaded = await loadSitePage("faqs", "en");
    if (loaded.kind !== "page") return [];
    const block = loaded.page.sections.find((section) => section.visible && section.type === "faq_hub");
    const topics = block ? faqTopics(block.data?.topics) : [];
    const picked = [];
    for (let round = 0; picked.length < FAQ_PREVIEW; round += 1) {
      let any = false;
      for (const topic of topics) {
        const item = topic.items[round];
        if (!item) continue;
        any = true;
        if (picked.length < FAQ_PREVIEW) picked.push({ id: `resources-faq-${picked.length + 1}`, question: item.question, answerHtml: item.answerHtml });
      }
      if (!any) break;
    }
    return picked;
  } catch {
    return [];
  }
}

// Resources hub (R00, Figma 1292-58851): a sticky "Find answers:" bar, guides
// by project stage, articles by topic, the scheme directory, live sessions and
// WhatsApp groups, a few FAQs and a closing question form. Articles, guides,
// schemes, sessions and groups all come from the API; the full filterable
// collection of articles and guides lives at /articles and /guides.
export default async function ResourcesRoute({ params }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const found = resolveContentPath(locale, PATH);
  if (found.kind !== "page") notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale });
  const tx = b2dText(t);
  const { page } = found;
  const guidance = page.sections.filter((section) => !linksApiContent(section.html));

  // The page's text (Figma R00) is managed in the admin panel; every field falls back to the built-in wording.
  const managed = await loadManagedPage("resources", locale);
  const hero = dataOf(managed, "hero");
  const stageData = dataOf(managed, "by-stage");
  const topicData = dataOf(managed, "by-topic");
  const schemesData = dataOf(managed, "schemes");
  const learnData = dataOf(managed, "learn-live");
  const faqData = dataOf(managed, "faqs");
  const closing = dataOf(managed, "closing");
  const label = (key, fallback) => mt(managed?.byKey?.[key]?.label) || fallback;
  const crumbs = rowsOf(hero.breadcrumb);
  const title = heroHeading(managed, page);

  const [articleData, schemeData, allSessions, hubFaqItems] = await Promise.all([
    loadInitialList("article"),
    loadInitialList("scheme"),
    loadSessions(),
    faqPreview(locale),
  ]);
  const managedFaqs = rowsOf(faqData.items)
    .filter((item) => mt(item.question))
    .map((item, index) => ({ id: `resources-faq-${index + 1}`, question: mt(item.question), answerHtml: mt(item.answer_html) }));
  const faqItems = managedFaqs.length ? managedFaqs : hubFaqItems;

  const writings = (articleData?.items ?? []).map(articleToSummary);
  const guides = writings.filter((item) => item.type === "guide");
  const articles = writings.filter((item) => item.type !== "guide");
  const topicItems = (articles.length ? articles : writings)
    .slice()
    .sort((a, b) => String(b.publishedAt ?? "").localeCompare(String(a.publishedAt ?? "")));
  const sessions = allSessions.filter((session) => effectiveState(session) === "upcoming").slice(0, SESSIONS_SHOWN);
  const learnSessions = sessions.length ? sessions : allSessions.slice(0, SESSIONS_SHOWN);
  const schemeCount = schemeData?.items?.length ?? 0;
  const stages = PROJECT_STAGES.filter((stage) => stage.key !== "file-stuck");

  // "By topic": the page's featured list (links resolved by title from the articles and guides) or, without one, the live articles.
  const featuredRows = rowsOf(topicData.items).filter((item) => mt(item.title));
  const featured = featuredRows.map((item) => {
    const record = findByTitle(writings, item.title);
    const reviewed = record?.reviewer && record?.reviewedAt ? tx("resources.stage.reviewed", "Reviewed {date}", { date: formatDate(record.reviewedAt, locale) }) : "";
    const reviewer = record?.reviewer?.name ? tx("resources.stage.reviewer", "Reviewer: {name}", { name: record.reviewer.name }) : "";
    return {
      title: mt(item.title),
      tag: mt(item.tag),
      topic: mt(item.topic),
      meta: [reviewed, mt(item.meta), reviewer].filter(Boolean).join(" · "),
      href: record?.href || mt(item.href),
    };
  });
  const topicChips = rowsOf(topicData.groups).flatMap((group) => textsOf(group.chips));
  const showTopics = featured.length > 0 || topicItems.length > 0;

  const sections = [
    { id: "by-stage", title: label("by-stage", tx("resources.nav.stage", "By stage")) },
    showTopics && { id: "by-topic", title: label("by-topic", tx("resources.nav.topic", "By topic")) },
    { id: "schemes", title: label("schemes", tx("resources.nav.schemes", "Schemes")) },
    { id: "learn", title: label("learn-live", tx("resources.nav.learn", "Learn live")) },
    faqItems.length > 0 && { id: "faqs", title: label("faqs", tx("resources.nav.faqs", "FAQs")) },
  ].filter(Boolean);

  const heroCard =
    mt(hero.card_kind) === "search" && (mt(hero.card_title) || mt(hero.search_placeholder)) ? (
      <ResourceSearchCard
        action={`/${locale}/articles`}
        popular={rowsOf(hero.card_rows)
          .filter((row) => mt(row.label))
          .map((row) => ({ label: mt(row.label), href: mt(row.href) }))}
        labels={{
          title: mt(hero.card_title),
          label: mt(hero.search_label),
          placeholder: mt(hero.search_placeholder),
          submit: mt(hero.search_button),
          popular: mt(hero.popular_label),
        }}
      />
    ) : undefined;

  return (
    <>
      <PageAlternates en={`/en${PATH}`} hi={page.hasHindi ? `/hi${PATH}` : null} />
      <Breadcrumbs
        items={[
          { label: crumbs.length > 1 ? mt(crumbs[0].label, t("common.home")) : t("common.home"), href: `/${locale}` },
          { label: crumbs.length > 1 ? mt(crumbs[crumbs.length - 1].label, page.title) : page.title, href: `/${locale}${PATH}` },
        ]}
      />
      <main id="main">
        <HeroBand
          titleId="resources-title"
          eyebrow={mt(hero.eyebrow) || tx("resources.hero.eyebrow", "Resources")}
          title={title}
          introHtml={heroIntro(managed, page)}
          actions={
            <HeroActions
              label={mt(hero.primary_label) || t("service.discussProject")}
              href={mt(hero.primary_href)}
              whatsappLabel={mt(hero.secondary_label)}
              locale={locale}
              source="resources-hero"
              pageTitle={title}
            />
          }
          card={heroCard}
        />

        <div className="b2d-nav">
          <ActiveSectionNav
            title={t("service.onThisPage")}
            label={mt(hero.nav_label).replace(/\s*:\s*$/, "") || tx("resources.nav.label", "Find answers")}
            contextLabel={mt(hero.nav_label) || tx("resources.nav.lead", "Find answers:")}
            sections={sections}
          />

          <StageGuidesSection id="by-stage" stages={stages} guides={guides} writings={writings} locale={locale} t={t} tx={tx} managed={stageData} />

          {showTopics && (
            <Band id="by-topic" labelledBy="by-topic-title" tone="sage" className={NAV_OFFSET}>
              <BandHeading
                id="by-topic-title"
                eyebrow={mt(topicData.eyebrow) || tx("resources.topic.eyebrow", "By topic")}
                title={mt(topicData.heading) || tx("resources.topic.title", "Read up on the question in front of you.")}
                intro={mt(topicData.intro)}
                className="mb-8"
              />
              {featured.length > 0 ? (
                <ResourceFeatured
                  items={featured}
                  chips={topicChips}
                  indexHref={mt(topicData.cta_href) || `/${locale}/articles`}
                  labels={{
                    all: mt(topicData.all_label) || tx("resources.topic.all", "All topics"),
                    topicRow: tx("resources.topic.row", "Topic"),
                    search: mt(topicData.search_label),
                    placeholder: mt(topicData.search_placeholder),
                    button: mt(topicData.search_button),
                    count: mt(topicData.count_template) || tx("resources.topic.count", "Showing {shown} of {total} articles"),
                    empty: mt(topicData.empty_text) || tx("resources.topic.empty", "No articles in this topic yet."),
                    viewAll: mt(topicData.cta_label) || tx("resources.topic.viewAll", "View all articles"),
                  }}
                />
              ) : (
                <ResourceTopics
                  items={topicItems}
                  locale={locale}
                  indexHref={mt(topicData.cta_href) || `/${locale}/articles`}
                  labels={{
                    all: mt(topicData.all_label) || tx("resources.topic.all", "All topics"),
                    topicRow: tx("resources.topic.row", "Topic"),
                    viewAll: mt(topicData.cta_label) || tx("resources.topic.viewAll", "View all articles"),
                    read: tx("resources.topic.read", "Read"),
                    empty: mt(topicData.empty_text) || tx("resources.topic.empty", "No articles in this topic yet."),
                    count: mt(topicData.count_template) || tx("resources.topic.count", "Showing {shown} of {total} articles"),
                    reviewed: tx("resources.topic.reviewed", "Reviewed {date}"),
                  }}
                />
              )}
            </Band>
          )}

          <SchemesPanel id="schemes" count={schemeCount} locale={locale} tx={tx} managed={schemesData} />

          <LearnSection id="learn" sessions={learnSessions} locale={locale} t={t} tx={tx} managed={learnData} />

          {faqItems.length > 0 && <FaqPreviewSection id="faqs" items={faqItems} locale={locale} tx={tx} managed={faqData} />}
        </div>

        <GuidanceSections sections={guidance} />

        <ClientTicker />

        <ClosingEnquiryPanel
          id="resources-closing"
          eyebrow={mt(closing.eyebrow) || undefined}
          heading={mt(closing.heading) || tx("resources.closing.heading", "Can't find your answer?")}
          intro={mt(closing.intro) || tx("resources.closing.intro", "Ask in your own words. A Rapid expert will reply with the next step.")}
          photoNote={mt(closing.photo_note) || tx("form.photoNote", "Placeholder: a factory site in Haryana. Final photography to be supplied by Rapid.")}
          card={closingCard(
            closing,
            enquiryCard(tx, {
              title: tx("resources.closing.cardTitle", "Tell us your question."),
              source: "resources-hub",
              pageId: page.id,
              pageTitle: title,
              serviceName: tx("resources.closing.service", "Question"),
              submit: tx("resources.closing.submit", "Send my question"),
              activityLabel: tx("resources.closing.activity", "Your question"),
              select: null,
            }),
          )}
        />
      </main>
    </>
  );
}
