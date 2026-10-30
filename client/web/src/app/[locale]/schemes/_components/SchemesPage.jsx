/**
 * SchemesPage - collection view for the Schemes index page (R02, Figma 1660-96044).
 *
 * Isolated from other collection pages so that UI changes here
 * have NO effect on Services, Articles, Case Studies or Industries.
 *
 * Order: hero with the "Find a scheme." card, the searchable list (the Round-2
 * interaction contract lives in components/pages/scheme-directory.jsx), "Reading
 * a status", the SVR teaser, the page's guidance copy, the client ticker and the
 * closing enquiry panel.
 */

import { ClientTicker } from "@/components/common/client-ticker";
import { SvrTeaser } from "@/components/common/svr-teaser";
import { ClosingEnquiryPanel } from "@/components/forms/closing-enquiry-panel";
import { Band, BandHeading, GuidanceSections, HeroActions, HeroBand } from "@/components/pages/b2d-parts";
import { StatusLegend } from "@/components/pages/scheme-status";
import { BannerBlock, FaqAccordionBlock } from "@/components/site-pages/managed-blocks";
import { closingCard, dataOf, heroHeading, heroIntro, mt, rowsOf, stripColon } from "@/lib/pages/managed-view";
import { schemeToSummary } from "@/lib/content/adapters";
import { b2dText } from "@/lib/pages/b2d-text";
import { enquiryCard } from "@/lib/pages/b2d-forms";
import { linksApiContent } from "@/lib/pages/card-copy";
import { matchesSchemeSearch, schemeSearchDoc } from "@/lib/pages/scheme-groups";
import { SchemeFindCard } from "./SchemeFindCard";
import { SchemesDirectory } from "./SchemesDirectory";

export function SchemesPage({ page, t, locale = "en", initialData, initialIndustries, filters = {}, managed = null }) {
  const tx = b2dText(t);
  // The text of the page is managed in the admin panel (Figma R02); each field falls back to the built-in wording.
  const hero = dataOf(managed, "hero");
  const list = dataOf(managed, "all-schemes");
  const legend = dataOf(managed, "status-legend");
  const closing = dataOf(managed, "closing");
  const title = heroHeading(managed, page);
  const ctx = { locale, page: { h1: title, title: page.title, path: "schemes" } };
  const groups = rowsOf(list.groups);
  const legendItems = rowsOf(legend.items)
    .map((item) => ({ label: mt(item.tag) || mt(item.title), text: mt(item.text) }))
    .filter((item) => item.label);
  // Schemes come from the API (SchemesDirectory). Sections of the index copy
  // that only list individual schemes are replaced by it; the rest is guidance.
  const guidanceSections = page.sections.filter((section) => !linksApiContent(section.html));

  // "Popular" words are only offered when they find at least one scheme.
  const docs = (initialData?.items ?? []).map((record) => schemeSearchDoc(schemeToSummary(record)));
  const managedChips = rowsOf(hero.chips)
    .map((chip) => ({ label: mt(chip.label) || mt(chip.term), term: mt(chip.term) || mt(chip.label) }))
    .filter((chip) => chip.term);
  const builtInChips = tx("schemes.hero.popularList", "CGTMSE, AIF, MSE-CDP, NHB, Warehousing")
    .split(",")
    .map((word) => word.trim())
    .filter(Boolean)
    .map((word) => ({ label: word, term: word }));
  const popular = (managedChips.length ? managedChips : builtInChips).filter(
    (chip) => docs.length > 0 && docs.some((doc) => matchesSchemeSearch(doc, chip.term)),
  );

  const card = (
    <SchemeFindCard
      action={`/${locale}/schemes`}
      popular={popular}
      initial={filters.q ?? ""}
      labels={{
        title: mt(hero.card_title) || tx("schemes.find.title", "Find a scheme."),
        label: mt(hero.search_label) || tx("schemes.find.label", "Scheme name, ministry or keyword"),
        placeholder: mt(hero.search_placeholder) || tx("schemes.find.placeholder", "For example CGTMSE or stamp duty"),
        submit: mt(hero.search_button) || tx("schemes.find.submit", "Search"),
        popular: mt(hero.popular_label) || tx("schemes.find.popular", "Popular:"),
      }}
    />
  );

  return (
    <>
      <HeroBand
        titleId="schemes-title"
        eyebrow={mt(hero.eyebrow) || tx("schemes.hero.eyebrow", "Scheme directory")}
        title={title}
        introHtml={heroIntro(managed, page)}
        actions={
          <HeroActions
            label={mt(hero.primary_label) || t("service.discussProject")}
            href={mt(hero.primary_href)}
            whatsappLabel={mt(hero.secondary_label)}
            locale={locale}
            source="scheme-directory-hero"
            pageTitle={title}
          />
        }
        card={card}
      />

      <SchemesDirectory
        initialData={initialData}
        initialIndustries={initialIndustries}
        filters={filters}
        copy={{
          eyebrow: mt(list.eyebrow),
          title: mt(list.heading),
          topicRow: stripColon(groups[0]?.label),
          industryRow: stripColon(groups[1]?.label),
          allLabel: mt(list.all_label),
          clearLabel: mt(list.clear_label),
          moreLabel: mt(list.more_label),
          countTemplate: mt(list.count_template),
        }}
      />

      <Band id="reading-a-status" labelledBy="scheme-status-title" tone="white">
        <BandHeading
          id="scheme-status-title"
          eyebrow={mt(legend.eyebrow) || tx("schemes.legend.eyebrow", "Reading a status")}
          title={mt(legend.heading) || tx("schemes.legend.title", "What each status means.")}
          intro={mt(legend.intro)}
          className="mb-8"
        />
        <StatusLegend t={t} tx={tx} items={legendItems} />
      </Band>

      <section className="bg-white pb-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <SvrTeaser context="schemes" />
        </div>
      </section>

      {managed?.byKey?.["policy-change"] && <BannerBlock section={managed.byKey["policy-change"]} ctx={ctx} />}

      {managed?.byKey?.faqs && rowsOf(managed.byKey.faqs.data?.items).some((item) => mt(item.question)) && (
        <FaqAccordionBlock section={managed.byKey.faqs} ctx={ctx} />
      )}

      <GuidanceSections sections={guidanceSections} />

      <ClientTicker />

      <ClosingEnquiryPanel
        id="scheme-closing"
        eyebrow={mt(closing.eyebrow) || undefined}
        heading={mt(closing.heading) || tx("schemes.closing.heading", "Check which schemes fit your project.")}
        intro={
          mt(closing.intro) ||
          tx(
            "schemes.closing.intro",
            "Tell us what you plan to build or buy. A Rapid expert will check which schemes apply and what their status is today.",
          )
        }
        photoNote={mt(closing.photo_note) || tx("form.photoNote", "Placeholder: a factory site in Haryana. Final photography to be supplied by Rapid.")}
        card={closingCard(
          closing,
          enquiryCard(tx, {
            title: tx("schemes.closing.cardTitle", "Check schemes for your project."),
            source: "scheme-directory",
            pageId: page.id,
            pageTitle: title,
            serviceName: tx("schemes.closing.service", "Scheme check"),
            submit: tx("schemes.closing.submit", "Check my eligibility"),
            activityLabel: tx("form.project", "Your project"),
          }),
        )}
      />
    </>
  );
}
