/**
 * CaseStudiesPage - collection view for the Case Studies index page (W00, Figma 1677-96674).
 *
 * Isolated from all other collection pages. Change this file freely
 * without touching Services, Schemes, Articles, or Industries.
 *
 * Order: hero with the "What every case shows" card, the filterable archive
 * (components in ./directory.js), client reviews (the Home section, labelled
 * sample content), the page's guidance copy, the client ticker and the closing
 * enquiry panel.
 */

import { Check } from "lucide-react";

import { ClientTicker } from "@/components/common/client-ticker";
import { ClosingEnquiryPanel } from "@/components/forms/closing-enquiry-panel";
import { GuidanceSections, HeroActions, HeroBand, HeroCard } from "@/components/pages/b2d-parts";
import { ReviewsSection } from "@/home/reviews-section";
import { b2dText } from "@/lib/pages/b2d-text";
import { enquiryCard } from "@/lib/pages/b2d-forms";
import { linksApiContent } from "@/lib/pages/card-copy";
import { closingCard, dataOf, heroHeading, heroIntro, mt, rowsOf, stripColon } from "@/lib/pages/managed-view";
import { homeText } from "@/lib/pages/home-copy";
import { CaseStudiesDirectory } from "./CaseStudiesDirectory";

/**
 * Case studies come from the API (CaseStudiesDirectory); `initialData` is the
 * list the server already fetched.
 */
export function CaseStudiesPage({ page, t, has, locale = "en", initialData, managed = null }) {
  const tx = b2dText(t);
  // The text of the page is managed in the admin panel (Figma W00); each field falls back to the built-in wording.
  const hero = dataOf(managed, "hero");
  const list = dataOf(managed, "all-cases");
  const reviews = dataOf(managed, "reviews");
  const closing = dataOf(managed, "closing");
  const title = heroHeading(managed, page);
  // Sections of the index copy that only list individual case studies are
  // replaced by the live directory; the rest is guidance.
  const guidanceSections = page.sections.filter((s) => !linksApiContent(s.html));

  const builtIn = [
    [tx("cases.shows.investment", "The investment"), tx("cases.shows.investmentText", "What the unit spent, not the subsidy.")],
    [
      tx("cases.shows.handled", "What Rapid handled"),
      tx("cases.shows.handledText", "The records, the application and the follow-up."),
    ],
    [tx("cases.shows.stands", "Where it stands"), tx("cases.shows.standsText", "Filed, sanctioned or paid, as confirmed.")],
  ];
  const managedRows = rowsOf(hero.card_rows)
    .map((row) => [stripColon(row.label), mt(row.text)])
    .filter(([label]) => label);
  const shows = managedRows.length ? managedRows : builtIn;

  // Client reviews: the Home section, its headings from the page's reviews text.
  const homeCopy = homeText(t, has, locale);
  const reviewText = {
    "homeA.reviews.eyebrow": mt(reviews.eyebrow),
    "homeA.reviews.title": mt(reviews.heading),
    "homeA.reviews.intro": mt(reviews.intro),
    "homeA.reviews.overall": mt(reviews.rating_label),
    "homeA.reviews.chip": mt(reviews.trust_label),
    "homeA.reviews.servicesTaken": mt(reviews.services_label),
    "homeA.reviews.viewAll": mt(reviews.cta_label),
  };
  const reviewCopy = (key, values) => reviewText[key] || homeCopy(key, values);

  const card = (
    <HeroCard id="case-shows-title" title={mt(hero.card_title) || tx("cases.shows.title", "What every case shows")} as="section">
      <ul className="m-0 mt-5 grid list-none gap-3 p-0">
        {shows.map(([label, text]) => (
          <li key={label} className="m-0 flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4">
            <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#09263e] text-white">
              <Check className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-base font-semibold leading-snug text-[#09263e]">{label}</span>
              {text && <span className="mt-0.5 block text-sm leading-5 text-slate-600">{text}</span>}
            </span>
          </li>
        ))}
      </ul>
    </HeroCard>
  );

  return (
    <>
      <HeroBand
        titleId="cases-title"
        eyebrow={mt(hero.eyebrow) || tx("cases.hero.eyebrow", "Case studies")}
        title={title}
        introHtml={heroIntro(managed, page)}
        actions={
          <HeroActions
            label={mt(hero.primary_label) || t("service.discussProject")}
            href={mt(hero.primary_href)}
            whatsappLabel={mt(hero.secondary_label)}
            locale={locale}
            source="case-archive-hero"
            pageTitle={title}
          />
        }
        card={card}
      />

      <CaseStudiesDirectory
        initialData={initialData}
        copy={{
          eyebrow: mt(list.eyebrow),
          title: mt(list.heading),
          industryRow: stripColon(list.filter_label),
          allLabel: mt(list.all_label),
          countTemplate: mt(list.count_template),
        }}
      />

      <ReviewsSection text={reviewCopy} />

      <GuidanceSections sections={guidanceSections} />

      <ClientTicker />

      <ClosingEnquiryPanel
        id="cases-closing"
        eyebrow={mt(closing.eyebrow) || undefined}
        heading={mt(closing.heading) || tx("cases.closing.heading", "Have a similar investment in mind?")}
        intro={
          mt(closing.intro) ||
          tx(
            "cases.closing.intro",
            "Tell us what you plan to build or buy. A Rapid expert will check the route before you commit.",
          )
        }
        photoNote={mt(closing.photo_note) || tx("form.photoNote", "Placeholder: a factory site in Haryana. Final photography to be supplied by Rapid.")}
        card={closingCard(
          closing,
          enquiryCard(tx, {
            title: tx("cases.closing.cardTitle", "Get your project checked."),
            source: "case-archive",
            pageId: page.id,
            pageTitle: title,
            serviceName: tx("cases.closing.service", "Project check"),
            submit: tx("cases.closing.submit", "Check my project"),
            activityLabel: tx("cases.closing.activity", "What are you buying or building?"),
          }),
        )}
      />
    </>
  );
}
