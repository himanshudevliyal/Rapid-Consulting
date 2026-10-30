import { WhatsAppButton } from "@/components/contact/whatsapp";
import { ActiveSectionNav } from "@/components/common/active-section-nav";
import { AuthorReviewer } from "@/components/common/author-reviewer";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ClientTicker } from "@/components/common/client-ticker";
import { Html } from "@/components/common/html";
import { ShareActions } from "@/components/common/share-actions";
import { DownloadButton } from "@/components/pages/content-primitives";
import { pdfFor } from "@/lib/pages/downloads";
import { formatDate } from "@/lib/format-date";
import { rewriteContentLinks } from "@/lib/page-routes";
import { GreyCard, LimeAction, NavyPanel, Rich, RichActions } from "./blocks";
import { NextSteps, RelatedSets, Sources, hasSources } from "./extras";
import { EnquiryRail, stageOptions } from "./rail";
import { ContentLayout, Masthead, Pill, SectionBlock } from "./shell";
import { b2cText, enquirySource } from "./text";
import { hasFaqContent } from "@/lib/pages/faq";
import { FaqContent } from "@/components/pages/faq-content";
import { hasContent, readingMinutes, splitLead, withoutOnThisPage } from "./html-utils";

// Guide (B035) and article detail page (Figma 1449-76973): pills, H1, sub, meta
// line, sticky contents bar built from the headings of the body, the body with
// the right enquiry rail (tables with a navy header row, callout boxes and
// numbered lists come from the .b2c-prose styles). The record's HTML is rendered
// through components/common/html.jsx exactly as before.

// Land-use guides get the CLU rail; every other guide and article gets the
// generic one.
const LAND_USE = /(?:^|[^a-z])clu(?:[^a-z]|$)|change[-\s]of[-\s]land[-\s]use|change[-\s]in[-\s]land[-\s]use/i;

export async function WritingView({ page, t, has }) {
  const tx = b2cText(t);
  const guide = page.type === "guide";
  const clu = LAND_USE.test(`${page.slug} ${page.title}`);
  const pdf = pdfFor(page);

  const { lead, rest } = splitLead(withoutOnThisPage(page.introHtml));
  const briefHtml = hasContent(rest) ? rest : "";
  const sections = page.sections.filter((s) => hasContent(s.html));

  const navSections = [
    ...(briefHtml ? [{ id: "in-brief", title: tx("writing.inBrief", "In brief") }] : []),
    // A heading's data-nav is its menu label ("" keeps it out of the menu).
    ...sections.filter((s) => s.nav !== "").map((s) => ({ id: s.id, title: s.nav || s.title })),
    ...(hasSources(page) ? [{ id: "source-record", title: t("detail.sources.navLabel") }] : []),
  ];

  // "8 min read · Reviewed 3 October 2026 by Name": each part only when it exists.
  const reviewedDate = page.reviewer && page.reviewedAt ? formatDate(page.reviewedAt, page.locale) : "";
  const reviewer = page.reviewer ? (
    <a href={page.reviewer.href} className="font-semibold text-[#09263e] underline underline-offset-4">
      {page.reviewer.name}
    </a>
  ) : null;
  const parts = [
    tx("writing.minRead", "{n} min read", { n: readingMinutes(page) }),
    reviewer && (
      <span key="reviewed">
        {reviewedDate ? tx("writing.reviewedOn", "Reviewed {date} by", { date: reviewedDate }) : tx("writing.reviewedBy", "Reviewed by")}{" "}
        {reviewer}
      </span>
    ),
  ].filter(Boolean);
  const meta = parts.map((part, i) => (
    <span key={i}>
      {i > 0 && <span aria-hidden="true"> · </span>}
      {part}
    </span>
  ));

  const pills = [
    <Pill key="type" tone="navy">
      {guide ? tx("writing.guide", "Guide") : tx("writing.article", "Article")}
    </Pill>,
    page.family && page.group ? <Pill key="group">{page.group}</Pill> : null,
  ].filter(Boolean);

  const source = enquirySource(guide ? "guide" : "article", page.slug);

  const rail = clu ? (
    <EnquiryRail
      t={t}
      title={tx("writing.clu.title", "Find out if your land will get CLU, before you invest.")}
      source={source}
      pageId={page.id}
      pageTitle={page.h1}
      serviceName={tx("writing.clu.service", "Change of Land Use (CLU)")}
      fields={["district", "site", "activity"]}
      siteLabel={tx("writing.clu.site", "Village / khasra")}
      activityLabel={tx("writing.clu.activity", "What you want to build")}
      submitLabel={tx("writing.clu.cta", "Check my land for CLU")}
      helper={tx("writing.clu.helper", "A Rapid expert will call to understand your plot.")}
    />
  ) : (
    <EnquiryRail
      t={t}
      title={tx("writing.rail.title", "Not sure how this applies to your project?")}
      hint={tx("writing.rail.hint", "Tell us where your project stands. A Rapid expert will call you.")}
      source={source}
      pageId={page.id}
      pageTitle={page.h1}
      select={{
        label: tx("rail.whereProject", "Where's your project?"),
        placeholder: tx("rail.choose", "Choose one"),
        options: stageOptions(tx),
      }}
      fields={["district", "activity"]}
      activityLabel={tx("rail.yourProject", "Your project")}
      submitLabel={tx("writing.rail.cta", "Get my next steps")}
    />
  );

  return (
    <main id="main">
      <Breadcrumbs page={page} t={t} />
      <Masthead
        pills={pills}
        title={page.h1}
        titleId="writing-title"
        sub={lead ? <Html html={rewriteContentLinks(lead)} className="[&_p]:!m-0 !text-[17px] !leading-8" /> : null}
        meta={meta}
        actions={
          <>
            <LimeAction source={source} pageTitle={page.h1}>
              {clu ? tx("writing.clu.cta", "Check my land for CLU") : tx("writing.cta", "Discuss your project")}
            </LimeAction>
            <WhatsAppButton />
            {pdf && <DownloadButton href={pdf} label={t(guide ? "site.download.guide" : "site.download.generic")} />}
          </>
        }
      />
      {navSections.length > 1 && (
        <ActiveSectionNav
          title={t("service.onThisPage")}
          label={t("service.onThisPageLabel")}
          sections={navSections}
          contextLabel={tx("nav.jumpTo", "Jump to:")}
        />
      )}

      <ContentLayout label={tx("rail.label", "Enquiry")} rail={rail}>
        <AuthorReviewer page={page} t={t} className="!mt-0" />

        {briefHtml && (
          <SectionBlock id="in-brief" eyebrow={tx("writing.inBrief", "In brief")}>
            <div className="rounded-3xl bg-[#e8eef1] p-5 sm:p-8">
              <Rich html={briefHtml} />
            </div>
          </SectionBlock>
        )}

        {sections.map((section) => {
          const body = hasFaqContent(section.html) ? (
            <FaqContent html={section.html} />
          ) : (
            <RichActions html={section.html} source={source} pageTitle={page.h1} tone={section.tone === "navy" ? "navy" : undefined} />
          );
          // data-tone: "navy" and "grey" sections are panels; the others are plain sections.
          if (section.tone === "navy") {
            return (
              <NavyPanel key={section.id} id={section.id} eyebrow={section.eyebrow} title={section.title}>
                {body}
              </NavyPanel>
            );
          }
          if (section.tone === "grey") {
            return (
              <GreyCard key={section.id} id={section.id} eyebrow={section.eyebrow} title={section.title}>
                {body}
              </GreyCard>
            );
          }
          return (
            <SectionBlock key={section.id} id={section.id} eyebrow={section.eyebrow} title={section.title}>
              {body}
            </SectionBlock>
          );
        })}

        <Sources page={page} t={t} />
        <div className="mt-12">
          <ShareActions title={page.h1} />
        </div>
        <NextSteps page={page} t={t} />
        <RelatedSets page={page} t={t} has={has} />
      </ContentLayout>
      <ClientTicker />
    </main>
  );
}
