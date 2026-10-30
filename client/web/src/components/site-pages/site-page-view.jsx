import { getTranslations } from "next-intl/server";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { JsonLd } from "@/components/common/json-ld";
import { ActiveSectionNav } from "@/components/common/active-section-nav";
import { ContactExperience } from "@/components/form/contact-experience";
import { PageAlternates } from "@/components/layout/page-alternates";
import { hasTranslation } from "@/i18n/has-translation";
import { loadLinkedRecords, loadSitePageParents, loadSitePageRegistry } from "@/lib/content/site-page-data";
import { asText, languagePaths, layoutOf, plainText, splitAroundRail, stageList } from "@/lib/content/site-page-adapters";
import { BLOCKS, blockFor, isRailBlock, recordTypeOf, resolveRegistry } from "./block-registry";
import { PageRail, hasRailForm } from "./page-rail";
import { H1_CLASS } from "./shared";
import { siteText } from "./site-text";

const settle = (promise, fallback) => promise.catch(() => fallback);

// FAQPage structured data from the visible faq / faq_hub blocks only.
function faqJsonLd(sections) {
  const entries = sections.flatMap((section) => blockFor(section.type)?.faq?.(section) ?? []);
  if (!entries.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: { "@type": "Answer", text: plainText(entry.answerHtml) },
    })),
  };
}

function Block({ section, ctx }) {
  const block = blockFor(section.type);
  if (!block) return null;
  const { Component } = block;
  return <Component section={section} ctx={ctx} />;
}

/**
 * A page composed in the admin panel: template layout + its visible sections.
 *
 *   - hidden, unknown and empty sections render nothing and leave no gap,
 *     jump link or structured data (they are removed before anything is built);
 *   - rail templates: breadcrumbs, the sticky "on this page" menu (visible
 *     sections' label/anchor only), then the sections. The sticky enquiry rail
 *     spans the FIRST consecutive run of sections whose block has rail:true;
 *     the first rail:false block (closing panel, enquiry form...) ends it and
 *     everything after is full width, with no second rail;
 *   - the rail shows the standard enquiry panel, or the page's own form card
 *     (FigmaEnquiryCard) when the masthead has a "Rail form" title (page-rail.jsx);
 *   - full (hub) templates: every section full width, no rail, no sub-menu;
 *   - exactly one <h1>: the masthead's heading (the page's H1 when the masthead
 *     has none); a page whose masthead is hidden gets a plain heading instead.
 *
 * `topic` (from ?topic=) preselects the FAQ hub tab. `preview` shows the draft banner.
 */
export async function SitePageView({ page, locale, topic = "", preview = false }) {
  const [t, fetchedRegistry] = await Promise.all([getTranslations({ locale }), loadSitePageRegistry()]);
  const tx = siteText(t);
  const has = hasTranslation(t);
  const registry = resolveRegistry(fetchedRegistry);

  // Known, visible blocks; then the ones with something to show.
  const known = page.sections.filter((section) => section.visible && blockFor(section.type));
  const records = await settle(loadLinkedRecords(known, locale, recordTypeOf), {});
  const stages = known.filter((s) => s.type === "stage_chooser").flatMap((s) => stageList(s.data.stages));
  const base = { page, locale, t, tx, has, records, topic, stages, inColumn: false, tone: "plain" };
  const sections = known.filter((section) => !BLOCKS[section.type].isEmpty(section, base));

  const layout = layoutOf(registry, page.template);
  const { before, rail, after } =
    layout === "rail"
      ? splitAroundRail(sections, (type) => isRailBlock(registry, type))
      : { before: sections, rail: [], after: [] };

  // Full-width blocks alternate a white and a wash band (blocks that paint their own band do not count).
  let wash = true;
  const wide = (list) =>
    list.map((section) => {
      const tone = wash ? "wash" : "plain";
      if (!BLOCKS[section.type].selfTone) wash = !wash;
      return <Block key={section.id} section={section} ctx={{ ...base, tone }} />;
    });
  const beforeNodes = wide(before);
  const afterNodes = wide(after);

  // Sticky menu of jump links. Rail pages always have it (above the page); a
  // hub page has it only when its masthead sets a lead label ("Choose your
  // project status:"), and then it sits right under the masthead.
  const navLead = asText(sections.find((section) => section.type === "masthead")?.data?.nav_label);
  const navSections =
    layout === "rail" || navLead
      ? sections.filter((section) => section.label && section.anchor).map((section) => ({ id: section.anchor, title: section.label }))
      : [];
  const hubNav = layout !== "rail" && navLead !== "" && navSections.length > 1;
  const navNode =
    navSections.length > 1 ? (
      <ActiveSectionNav
        key="section-nav"
        title={t("service.onThisPage")}
        label={navLead || t("service.onThisPageLabel")}
        contextLabel={navLead || undefined}
        sections={navSections}
      />
    ) : null;
  const mastheadAt = before.findIndex((section) => section.type === "masthead");
  const mainNodes = hubNav
    ? [...beforeNodes.slice(0, mastheadAt + 1), navNode, ...beforeNodes.slice(mastheadAt + 1)]
    : beforeNodes;
  const masthead = sections.find((section) => section.type === "masthead");
  // A managed page opens with a page_hero, which carries the page's one <h1>.
  const hasMasthead = Boolean(masthead) || sections.some((section) => section.type === "page_hero");
  const ownRail = masthead && hasRailForm(masthead);
  const parents = await settle(loadSitePageParents(page), []);
  const trail = [
    { label: t("common.home"), href: `/${locale}` },
    ...parents,
    { label: page.title || page.h1 },
  ];
  const faq = faqJsonLd(sections);
  const paths = languagePaths(page);

  return (
    <>
      {!preview && <PageAlternates en={paths.en} hi={paths.hi} />}
      {preview && (
        <div role="status" className="bg-amber-100 px-4 py-2 text-center text-sm font-medium text-amber-950">
          {tx("previewBanner", "Preview of an unpublished draft. This page is hidden from search engines.")}
        </div>
      )}

      <Breadcrumbs items={trail} t={t} />
      {faq && <JsonLd data={faq} />}
      {!hubNav && navNode}

      <main id="main">
        {!hasMasthead && (
          <header className="container mx-auto max-w-7xl px-4 pt-10">
            <h1 className={H1_CLASS}>{page.h1 || page.title}</h1>
          </header>
        )}

        {mainNodes}

        {rail.length > 0 && (
          <div className="bg-gray-50">
            <div className="container mx-auto max-w-7xl px-4">
              <div className="detail-layout">
                <div className="detail-content pb-8 pt-8">
                  {rail.map((section) => (
                    <Block key={section.id} section={section} ctx={{ ...base, inColumn: true }} />
                  ))}
                </div>
                <div className="detail-rail">
                  {ownRail ? (
                    <PageRail masthead={masthead} page={page} tx={tx} />
                  ) : (
                    <ContactExperience pageTitle={page.h1} pageId={page.pageKey || undefined} variant="rail" />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {afterNodes}
      </main>
    </>
  );
}
