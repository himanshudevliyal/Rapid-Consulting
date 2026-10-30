import { WhatsAppButton } from "@/components/contact/whatsapp";
import { ActiveSectionNav } from "@/components/common/active-section-nav";
import { AuthorReviewer } from "@/components/common/author-reviewer";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ClientTicker } from "@/components/common/client-ticker";
import { Html } from "@/components/common/html";
import { ShareActions } from "@/components/common/share-actions";
import { SvrTeaser } from "@/components/common/svr-teaser";
import { DownloadButton } from "@/components/pages/content-primitives";
import { SchemeFacts, StatusChip, shortSchemeName } from "@/components/pages/scheme-facts";
import { hasFaqContent } from "@/lib/pages/faq";
import { pdfFor } from "@/lib/pages/downloads";
import { loadServicesForScheme } from "@/lib/content/related";
import { rewriteContentLinks } from "@/lib/page-routes";
import { ServiceSection } from "@/app/[locale]/services/_components/ServiceSection";
import { GreyCard, LimeAction, NavyPanel, Rich, RichOrFaq } from "./blocks";
import { NextSteps, RelatedSets, Sources, hasSources } from "./extras";
import { EnquiryRail, stageOptions } from "./rail";
import { ContentLayout, Masthead, SectionBlock } from "./shell";
import { b2cText, enquirySource } from "./text";
import { WATCH_OUT, hasContent, splitLead } from "./html-utils";

// Scheme detail page (Figma 1370-64825): masthead with the "<scheme> at a
// glance" card, sticky "On this page" bar, body with the right enquiry rail,
// tables with a navy header, navy WATCH OUT panel, "How it's claimed" steps
// card, cases.
//
// Everything is read from the scheme record. A part the record does not have
// (a loan limit, "your share", a worked example...) is left out, never
// invented; a status the record does not give reads "being checked", never
// "open".

const ROLES = { eligibility: "who", benefits: "get", "how-to-apply": "claimed" };

const roleOf = (section) => {
  if (ROLES[section.id]) return ROLES[section.id];
  if (hasFaqContent(section.html)) return "faq";
  if (WATCH_OUT.test(section.title)) return "watch";
  return "other";
};

export async function SchemeView({ page, t, has }) {
  const tx = b2cText(t);
  const name = shortSchemeName(page.title);
  const { lead, rest } = splitLead(page.introHtml);
  const fitHtml = hasContent(rest) ? rest : "";
  const pdf = pdfFor(page);

  const sections = page.sections.filter((s) => hasContent(s.html));
  const by = (role) => sections.filter((s) => roleOf(s) === role);
  const main = [...sections.filter((s) => ["other", "who", "get"].includes(roleOf(s)))];
  const watch = by("watch");
  const claimed = by("claimed");
  const faq = by("faq");

  // Sections written in the admin panel: FAQs follow the cases, the rest follow the body text.
  const extra = page.extraSections ?? [];
  const extraBody = extra.filter((section) => section.role !== "faq");
  const extraFaq = extra.filter((section) => section.role === "faq");
  const extraService = { code: "", title: page.title, h1: page.h1 };
  const renderExtra = (section, index) => (
    <ServiceSection key={section.key} section={section} index={index} service={extraService} servicesByCode={new Map()} locale={page.locale} t={t} />
  );

  const hasCases = (page.relatedItems ?? []).some((item) => item.type === "case-study");
  const services = await loadServicesForScheme(page.slug, page.locale).catch(() => []);

  const navLabel = {
    who: tx("scheme.nav.who", "Who can apply"),
    get: tx("scheme.nav.get", "What you get"),
    watch: tx("scheme.nav.watch", "Watch out"),
    claimed: tx("scheme.nav.claimed", "How it's claimed"),
    faq: tx("scheme.nav.faq", "FAQs"),
  };
  const navSections = [
    ...(fitHtml ? [{ id: "does-it-fit", title: tx("scheme.nav.fit", "Does it fit") }] : []),
    ...main.map((s) => ({ id: s.id, title: navLabel[roleOf(s)] || s.title })),
    ...extraBody.map((s) => ({ id: s.key, title: s.nav_label || s.title })),
    ...watch.map((s) => ({ id: s.id, title: navLabel.watch })),
    ...claimed.map((s) => ({ id: s.id, title: navLabel.claimed })),
    ...(hasCases ? [{ id: "cases", title: tx("scheme.nav.cases", "Cases") }] : []),
    ...faq.map((s) => ({ id: s.id, title: navLabel.faq })),
    ...extraFaq.map((s) => ({ id: s.key, title: s.nav_label || s.title })),
    ...(hasSources(page) ? [{ id: "source-record", title: t("detail.sources.navLabel") }] : []),
  ];

  const source = enquirySource("scheme", page.slug);
  const topic = page.topic && page.topic !== "Other programme support" ? page.topic : tx("scheme.eyebrow", "Scheme");

  const renderSection = (section) => {
    const role = roleOf(section);
    if (role === "who")
      return (
        <SectionBlock key={section.id} id={section.id} eyebrow={tx("scheme.who.eyebrow", "Who can apply")} title={tx("scheme.who.title", "Who can apply, and on what conditions.")}>
          <Rich html={section.html} />
        </SectionBlock>
      );
    if (role === "get")
      return (
        <SectionBlock key={section.id} id={section.id} eyebrow={tx("scheme.get.eyebrow", "What you get")} title={tx("scheme.get.title", "What the scheme gives.")}>
          <Rich html={section.html} />
        </SectionBlock>
      );
    if (role === "watch")
      return (
        <NavyPanel key={section.id} id={section.id} eyebrow={tx("scheme.watch.eyebrow", "Watch out")} title={section.title}>
          <Rich html={section.html} tone="navy" />
        </NavyPanel>
      );
    if (role === "claimed")
      return (
        <GreyCard
          key={section.id}
          id={section.id}
          eyebrow={tx("scheme.claimed.eyebrow", "How it's claimed")}
          title={tx("scheme.claimed.title", "How a claim is made.")}
          action={
            <LimeAction source={source} pageTitle={page.h1} serviceName={name}>
              {tx("scheme.claimed.cta", "Start with a free check")}
            </LimeAction>
          }
        >
          <Rich html={section.html} className="b2c-steps" />
        </GreyCard>
      );
    if (role === "faq")
      return (
        <SectionBlock key={section.id} id={section.id} eyebrow={navLabel.faq} title={section.title}>
          <RichOrFaq html={section.html} />
        </SectionBlock>
      );
    return (
      <SectionBlock key={section.id} id={section.id} title={section.title}>
        <Rich html={section.html} />
      </SectionBlock>
    );
  };

  return (
    <main id="main">
      <Breadcrumbs page={page} t={t} />
      <Masthead
        eyebrow={topic}
        title={page.h1}
        titleId="scheme-title"
        sub={lead ? <Html html={rewriteContentLinks(lead)} className="[&_p]:!m-0 !text-[17px] !leading-8" /> : null}
        chip={<StatusChip page={page} t={t} />}
        actions={
          <>
            <LimeAction source={source} pageTitle={page.h1} serviceName={name}>
              {tx("scheme.cta", "Check my eligibility")}
            </LimeAction>
            <WhatsAppButton />
            {pdf && <DownloadButton href={pdf} label={t("site.download.scheme")} />}
          </>
        }
        aside={<SchemeFacts page={page} t={t} />}
      />
      {navSections.length > 0 && (
        <ActiveSectionNav
          title={t("service.onThisPage")}
          label={t("service.onThisPageLabel")}
          sections={navSections}
          contextLabel={tx("nav.onThisPage", "On this page:")}
        />
      )}

      <ContentLayout
        label={tx("rail.label", "Enquiry")}
        rail={
          <EnquiryRail
            t={t}
            title={tx("scheme.railTitle", "Check {name} for your project.", { name })}
            source={source}
            pageId={page.id}
            pageTitle={page.h1}
            serviceName={name}
            select={{
              label: tx("rail.whereProject", "Where's your project?"),
              placeholder: tx("rail.choose", "Choose one"),
              options: stageOptions(tx),
            }}
            fields={["district", "activity"]}
            activityLabel={tx("rail.yourProject", "Your project")}
            submitLabel={tx("scheme.cta", "Check my eligibility")}
          />
        }
      >
        <AuthorReviewer page={page} t={t} className="!mt-0" />

        {fitHtml && (
          <SectionBlock
            id="does-it-fit"
            eyebrow={tx("scheme.fit.eyebrow", "Does it fit")}
            title={tx("scheme.fit.title", "Does {name} fit your project?", { name })}
          >
            <Rich html={fitHtml} />
            <div className="mt-6">
              <LimeAction source={source} pageTitle={page.h1} serviceName={name}>
                {tx("scheme.fit.cta", "Check if mine fits")}
              </LimeAction>
            </div>
          </SectionBlock>
        )}

        {main.map(renderSection)}
        {extraBody.map(renderExtra)}
        {watch.map(renderSection)}
        {claimed.map(renderSection)}
        {hasCases && <RelatedSets page={page} t={t} has={has} casesId="cases" only={["work"]} />}
        {faq.map(renderSection)}
        {extraFaq.map(renderExtra)}

        <Sources page={page} t={t} />
        <div className="mt-12">
          <ShareActions title={page.h1} />
        </div>
        <div className="mt-8">
          <SvrTeaser context="scheme" />
        </div>
        <NextSteps page={page} t={t} services={services} />
        <RelatedSets page={page} t={t} has={has} only={["reading"]} />
      </ContentLayout>
      <ClientTicker />
    </main>
  );
}
