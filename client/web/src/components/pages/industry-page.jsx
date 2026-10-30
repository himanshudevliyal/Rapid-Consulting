import Link from "next/link";
import { ArrowRight, ArrowUpRight, FileText } from "lucide-react";

import { ActiveSectionNav } from "@/components/common/active-section-nav";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { WhatsAppMark } from "@/components/contact/whatsapp";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { ClosingEnquiryPanel } from "@/components/forms/closing-enquiry-panel";
import { Carousel } from "@/components/home/carousel";
import { CaseCard, caseCardLabels } from "@/components/case-card";
import { LogoStrip } from "@/home/logo-strip";
import { ReviewsSection } from "@/home/reviews-section";
import { loadCaseStudies } from "@/lib/content/site-data";
import { b2bText, excerpt, textOf } from "@/lib/pages/b2b-text";
import { homeText } from "@/lib/pages/home-copy";
import { pageHref } from "@/lib/pages/content";
import { WHATSAPP_LABEL, WHATSAPP_NUMBER, serviceHref } from "@/lib/site";
import { LIME_BUTTON, LIME_ON_NAVY, OUTLINE_BUTTON } from "./b2b-buttons";
import { ContentCard } from "./content-card";
import { Html } from "./content-primitives";
import { FaqContent } from "./faq-content";
import { INDUSTRY_CLAIMS_ID, IndustryClaims } from "./industry-discovery";
import { casesForIndustry, industryModel } from "./industry-model";
import { PROJECT_SECTION_ID, ProjectCardLink, ProjectPicker } from "./industry-projects";
import { ReadingTabs } from "./reading-tabs";

const WATCH_ID = "watch-out";
const REPORT_ID = "one-report";
const CASES_ID = "cases";
const FAQ_ID = "faqs";
const NAV_OFFSET = "scroll-mt-[calc(var(--site-header-h,var(--header-height,80px))+var(--section-nav-h,52px)+16px)]";

const plain = (html = "") =>
  String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

// The "One report" section as written in the record:
//   <p>The bank, the scheme and the approvals, on one report.</p>
//   <ul><li><strong>The bank asks:</strong> can the project repay?</li> …</ul>
//   <p>Three separate worlds. …</p>
// -> the heading (first paragraph), one card per <li> (label, question up to its
// "?", and what follows as a detail line) and the closing note. Anything else
// keeps `asks` empty and the section shows its text as written.
function readReport(html = "") {
  const list = /<ul[\s>][\s\S]*?<\/ul>/i.exec(html);
  if (!list) return { heading: "", asks: [], note: "" };
  const asks = [...list[0].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)]
    .map((match) => {
      const label = plain(/<strong[^>]*>([\s\S]*?)<\/strong>/i.exec(match[1])?.[1] ?? "");
      const rest = plain(match[1].replace(/<strong[^>]*>[\s\S]*?<\/strong>/i, ""));
      const end = rest.indexOf("?");
      return {
        label,
        question: end >= 0 ? rest.slice(0, end + 1) : rest,
        detail: end >= 0 ? rest.slice(end + 1).trim() : "",
      };
    })
    .filter((ask) => ask.label && ask.question);
  const before = html.slice(0, list.index);
  const after = html.slice(list.index + list[0].length);
  return {
    heading: plain(/<p[^>]*>([\s\S]*?)<\/p>/i.exec(before)?.[1] ?? ""),
    asks,
    note: plain(/<p[^>]*>([\s\S]*?)<\/p>/i.exec(after)?.[1] ?? ""),
  };
}

// "Sources and review" as written in the record: a first paragraph
// "The people behind this guidance. Author: Rapid Consulting editorial team."
// then the sources. -> the heading, the author's name and the rest of the HTML.
function readSources(html = "") {
  const first = /<p[^>]*>([\s\S]*?)<\/p>/i.exec(html);
  const text = plain(first?.[1] ?? "");
  const match = /^(.*?)\s*Author:\s*(.+?)\.?$/i.exec(text);
  if (!first || !match) return { heading: "", author: "", rest: html };
  return { heading: match[1].trim(), author: match[2].trim(), rest: html.slice(first.index + first[0].length) };
}

// "Watch out: where food projects lose the subsidy" -> "Where food projects lose the subsidy."
// (the "Watch out" label is already shown above the heading).
function watchHeading(title = "") {
  const text = title.replace(/^\s*watch out\s*[:–—-]\s*/i, "").trim();
  if (!text) return "";
  const sentence = text[0].toUpperCase() + text.slice(1);
  return /[.?!]$/.test(sentence) ? sentence : `${sentence}.`;
}

// "Rapid Consulting editorial team" -> "RC"
const initials = (name) =>
  name
    .split(/\s+/)
    .filter((word) => /^[A-Z]/.test(word))
    .slice(0, 2)
    .map((word) => word[0])
    .join("") || name.slice(0, 2).toUpperCase();

// An industry page (Industries -> Food and agro processing ...), laid out as the
// Figma industry page:
//
//   breadcrumbs, hero (the industry's own heading and introduction, and a card
//   "What are you setting up?" whose rows select a project type below), logo
//   strip, sticky "Jump to:" bar, then
//   Your project (navy) -> What you can claim (table) -> Watch out (navy) ->
//   One report -> the other written sections -> services -> Cases -> FAQs ->
//   closing enquiry panel.
//
// Every block is built from the industry record (heading, introduction, body
// sections, the schemes and services chosen for it) and from the case studies;
// a block whose data is missing is left out. See industry-model.js for how the
// body sections are told apart.
export async function IndustryPage({ page, t, has }) {
  const tx = b2bText(t);
  const model = industryModel(page);
  const cases = casesForIndustry(page, await loadCaseStudies());
  const locale = page.locale;
  const name = page.title;
  const schemes = page.discovery?.schemes ?? [];
  const services = page.discovery?.services ?? [];

  const hasCases = cases.length > 0 || Boolean(model.experience);
  const nav = [
    model.projects.length > 0 && { id: PROJECT_SECTION_ID, title: tx("industry.navProject", "Your project") },
    schemes.length > 0 && { id: INDUSTRY_CLAIMS_ID, title: tx("industry.navClaims", "What you can claim") },
    model.watch && { id: WATCH_ID, title: tx("industry.navWatch", "Watch out") },
    model.report && { id: REPORT_ID, title: tx("industry.navReport", "One report") },
    hasCases && { id: CASES_ID, title: tx("industry.navCases", "Cases") },
    model.faq && { id: FAQ_ID, title: tx("industry.navFaq", "FAQs") },
  ].filter(Boolean);

  const projectLabels = {
    tabs: tx("industry.projectTabs", "Project types"),
    type: tx("industry.projectType", "Project type"),
    related: tx("industry.projectRelated", "Related links"),
    cta: tx("industry.projectCta", "Check my project"),
  };
  // Links shown under every project type: the services chosen for the industry,
  // then the industry's subsidies.
  const related = [
    ...services.slice(0, 3).map((service) => ({ label: service.title, href: serviceHref(service, locale) })),
    ...(schemes.length ? [{ label: tx("industry.projectSubsidies", "Subsidies for this industry"), href: `/${locale}/schemes?industry=${encodeURIComponent(page.slug)}` }] : []),
  ];

  // "Your project" heading: when the section is only titled "Your project" (the same as
  // its label) and opens with one short line, that line is the heading (Figma:
  // YOUR PROJECT / "Start with what you're setting up.").
  const projectTitle = model.projectSection?.title || tx("industry.projectTitle", "Pick the project closest to yours.");
  const projectLine = plain(model.projectIntro);
  const projectHeading =
    projectTitle.trim().toLowerCase() === tx("industry.navProject", "Your project").toLowerCase() && projectLine && projectLine.length <= 90
      ? { heading: projectLine, intro: "" }
      : { heading: projectTitle, intro: model.projectIntro };
  const report = readReport(model.report?.html);
  const sources = readSources(model.footnotes[0]?.html);
  // "Food & Agro Processing" -> "Food" (the cases heading: "Food units we've worked with.")
  const shortName = name.split(/\s+(?:&|and)\s+/i)[0];
  const relatedItems = page.relatedItems ?? [];
  const articles = relatedItems.filter((item) => item.type === "article").slice(0, 3);
  const guides = relatedItems.filter((item) => item.type === "guide").slice(0, 3);
  const readingGrid = (items) => (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <ContentCard key={item.id} page={item} locale={locale} t={t} has={has} />
      ))}
    </div>
  );
  const closingIntro = model.discuss ? excerpt(textOf(model.discuss.html.split(/<\/p>/i)[0]), 260) : "";
  // A short first line ("Planning a mill, dairy or food plant? …") is the closing heading itself.
  const closingHeadline = closingIntro && closingIntro.length <= 140 ? closingIntro : "";

  return (
    <main id="main" className="b2b-page b2b-industry" data-component="IndustryPage">
      <Breadcrumbs page={page} t={t} />

      {/* ── Hero: the hub look, with the project-type card on the right ── */}
      <section className="b2b-hubhero" aria-labelledby="industry-title">
        <div className={`b2b-wrap b2b-hubhero__grid ${model.projects.length ? "b2b-hubhero__grid--card" : ""}`}>
          <div className="min-w-0">
            <p className="b2b-eyebrow">{name}</p>
            <h1 id="industry-title" className="b2b-h1 b2b-h1--hub">
              {page.h1}
            </h1>
            <Html html={page.introHtml} className="b2b-lead" />
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <EnquiryTrigger className={LIME_BUTTON} source="industry-hero" serviceName={name} pageTitle={page.h1}>
                {t("service.discussProject")}
                <ArrowRight className="size-4" aria-hidden="true" />
              </EnquiryTrigger>
              <a className={OUTLINE_BUTTON} href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${WHATSAPP_LABEL}`}>
                <span className="size-4 [&>svg]:size-4" aria-hidden="true">
                  <WhatsAppMark />
                </span>
                WhatsApp {WHATSAPP_LABEL}
              </a>
            </div>
          </div>

          {model.projects.length > 0 && (
            <nav aria-labelledby="setting-up-title" className="b2b-hubcard">
              <h2 id="setting-up-title" className="b2b-hubcard__title">
                {tx("industry.cardTitle", "What are you setting up?")}
              </h2>
              <ul className="b2b-hubcard__rows">
                {model.projects.map((project) => (
                  <li key={project.id}>
                    <ProjectCardLink id={project.id} title={project.title} hint="" className="b2b-hubcard__row group" />
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>

      <LogoStrip eyebrow={tx("industry.logosEyebrow", "Our clients")} title={tx("industry.logosTitle", "Businesses that trust Rapid.")} />

      {nav.length > 0 && (
        <ActiveSectionNav
          title={t("service.onThisPage")}
          label={t("service.onThisPageLabel")}
          contextLabel={tx("industry.jump", "Jump to:")}
          sections={nav}
        />
      )}

      {/* ── Your project ── */}
      {model.projects.length > 0 && (
        <section id={PROJECT_SECTION_ID} className={`b2b-sec ${NAV_OFFSET}`} aria-labelledby="your-project-title" data-component="IndustryProjects">
          <ProjectPicker
            projects={model.projects}
            related={related}
            labels={projectLabels}
            industryName={name}
            headingId="your-project-title"
            eyebrow={tx("industry.navProject", "Your project")}
            heading={projectHeading.heading}
            intro={projectHeading.intro}
          />
        </section>
      )}

      {/* ── What you can claim ── */}
      <IndustryClaims
        page={page}
        t={t}
        eyebrow={tx("industry.navClaims", "What you can claim")}
        title={tx("industry.claimsTitle", "What {name} projects can claim, and from where.", { name })}
        lead={tx("industry.claimsLead", "The schemes chosen for this industry, by the kind of support they give. Check each scheme's own status before you rely on it.")}
        prose={model.claimProse}
      />

      {/* ── Watch out ── */}
      {model.watch && (
        <section id={WATCH_ID} className={`b2b-sec ${NAV_OFFSET}`} aria-labelledby="watch-title" data-component="IndustryWatch">
          {/* A rounded navy card on the white section: heading on the left, the risks and the button on the right. */}
          <div className="b2b-wrap">
            <div className="b2b-watch-card b2b-watch">
              <div>
                <p className="b2b-eyebrow b2b-eyebrow--on-navy">{tx("industry.navWatch", "Watch out")}</p>
                <h2 id="watch-title" className="b2b-h2 b2b-h2--on-navy">
                  {watchHeading(model.watch.title) || tx("industry.watchTitle", "Check these before you commit.")}
                </h2>
              </div>
              <div>
                <ul className="b2b-watch__rows">
                  {model.watch.rows.map((row, index) => (
                    <li key={`${row.title}-${index}`}>
                      <div className="min-w-0">
                        <strong>{row.title}</strong>
                        {row.text && <span>{row.text}</span>}
                      </div>
                    </li>
                  ))}
                </ul>
                <EnquiryTrigger className={`${LIME_ON_NAVY} mt-2`} source="industry-watch-out" serviceName={name}>
                  {tx("industry.watchCta", "Get my project checked")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </EnquiryTrigger>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── One report: "Your project report" and the three questions it answers ── */}
      {model.report && (
        <section id={REPORT_ID} className={`b2b-sec b2b-sec--band ${NAV_OFFSET}`} aria-labelledby="report-title" data-component="IndustryReport">
          <div className="b2b-wrap">
            <p className="b2b-eyebrow">{tx("industry.navReport", "One report")}</p>
            <h2 id="report-title" className="b2b-h2">
              {report.heading || model.report.title}
            </h2>
            {report.asks.length > 0 ? (
              <>
                <div className="mt-8 grid items-center gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-8">
                  <div className="flex min-h-[150px] flex-col justify-end gap-6 rounded-3xl bg-[#0d2f4f] p-7 text-white">
                    <FileText className="size-9 text-white" strokeWidth={1.5} aria-hidden="true" />
                    <p className="m-0! text-2xl font-semibold leading-tight text-white">{tx("industry.reportCard", "Your project report")}</p>
                  </div>
                  <ul className="m-0 grid list-none gap-4 p-0">
                    {report.asks.map((ask) => (
                      <li key={ask.label} className="m-0 flex items-center gap-4">
                        <ArrowRight className="hidden size-6 shrink-0 text-[#09263e] sm:block" aria-hidden="true" />
                        <div className="min-w-0 flex-1 rounded-2xl bg-white px-5 py-4 shadow-sm">
                          <p className="m-0! text-sm font-medium text-[#b3472d]">{ask.label}</p>
                          <p className="m-0! mt-1 text-lg font-semibold leading-snug text-[#09263e]">{ask.question}</p>
                          {ask.detail && <p className="m-0! mt-1.5 text-[13px] text-slate-600">{ask.detail}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                {report.note && <p className="mb-0! mt-6! max-w-3xl text-[15px] leading-6 text-slate-600">{report.note}</p>}
                <EnquiryTrigger className={`${LIME_BUTTON} mt-6`} source="industry-report" serviceName={name}>
                  {tx("industry.reportCta", "Start with a free check")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </EnquiryTrigger>
              </>
            ) : (
              <Html html={model.report.html} className="b2b-prose mt-4 max-w-4xl" />
            )}
          </div>
        </section>
      )}

      {/* ── The other written sections ── */}
      {model.general.map((section, index) => (
        <section key={section.id} id={section.id} className={`b2b-sec ${index % 2 === 0 ? "b2b-sec--band" : ""} ${NAV_OFFSET}`} aria-labelledby={`${section.id}-title`}>
          <div className="b2b-wrap">
            <h2 id={`${section.id}-title`} className="b2b-h2">
              {section.title}
            </h2>
            <Html html={section.html} className="b2b-prose mt-4 max-w-4xl" />
          </div>
        </section>
      ))}

      {/* ── Cases ── */}
      {hasCases && (
        <section id={CASES_ID} className={`b2b-sec ${NAV_OFFSET}`} aria-labelledby="cases-title" data-component="IndustryCases">
          <div className="b2b-wrap">
            {model.experience && (
              <>
                <p className="b2b-eyebrow">{tx("industry.navCases", "Cases")}</p>
                <h2 id="cases-title" className="b2b-h2">
                  {model.experience.title}
                </h2>
                <Html html={model.experience.html} className="b2b-prose mt-4 mb-6 max-w-4xl" />
              </>
            )}
            {cases.length > 0 && (
              <Carousel
                label={tx("industry.casesRegion", "Case studies")}
                previous={tx("industry.casesPrev", "Previous cases")}
                next={tx("industry.casesNext", "Next cases")}
                lead={
                  !model.experience && (
                    <>
                      <p className="b2b-eyebrow">{tx("industry.navCases", "Cases")}</p>
                      <h2 id="cases-title" className="b2b-h2">
                        {tx("industry.casesTitle", "{name} units we've worked with.", { name: shortName })}
                      </h2>
                    </>
                  )
                }
              >
                {cases.map((item) => (
                  <CaseCard
                    key={item.id}
                    item={item}
                    label={tx("industry.caseLabel", "Case study")}
                    cta={tx("industry.caseCta", "See how Rapid helped")}
                    labels={caseCardLabels(homeText(t, has, locale))}
                  />
                ))}
              </Carousel>
            )}
            <div className="mt-8 flex justify-end">
              <Link href={`/${locale}/case-studies`} className={LIME_BUTTON}>
                {tx("industry.casesAll", "View all case studies")}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── FAQs: heading on the left, question cards on the right ── */}
      {model.faq && (
        <section id={FAQ_ID} className={`b2b-sec b2b-sec--band ${NAV_OFFSET}`} aria-labelledby="faq-title" data-component="IndustryFaq">
          <div className="b2b-wrap b2b-faqgrid">
            <div>
              <p className="b2b-eyebrow">{tx("industry.navFaq", "FAQs")}</p>
              <h2 id="faq-title" className="b2b-h2">
                {model.faq.title}
              </h2>
            </div>
            <div>
              <FaqContent html={model.faq.html} />
              <div className="mt-6 flex justify-end">
                <Link href={`/${locale}/faqs`} className={LIME_BUTTON}>
                  {tx("industry.faqAll", "View all FAQs")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Client reviews (the shared reviews carousel) ── */}
      <ReviewsSection text={homeText(t, has, locale)} />

      {/* ── Author and sources ── */}
      {model.footnotes.length > 0 && (
        <section className="b2b-sec b2b-sec--band" aria-labelledby="sources-title" data-component="IndustrySources">
          <div className="b2b-wrap">
            <p className="b2b-eyebrow">{tx("industry.sourcesEyebrow", "Author and sources")}</p>
            <h2 id="sources-title" className="b2b-h2">
              {sources.heading || tx("industry.sourcesTitle", "The people behind this guidance.")}
            </h2>
            {sources.author && (
              <Link
                href={`/${locale}/about#people`}
                className="group mt-6 flex max-w-md items-center gap-4 rounded-2xl border border-slate-200 bg-white/60 px-4 py-3 no-underline transition-colors hover:bg-white"
              >
                <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#e9eef2] text-base font-bold text-[#09263e]">
                  {initials(sources.author)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-slate-500">{tx("industry.author", "Author")}</span>
                  <span className="block text-sm font-semibold text-[#09263e]">{sources.author}</span>
                </span>
                <ArrowUpRight className="size-5 shrink-0 text-[#09263e] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            )}
            {model.footnotes.map((section, index) => (
              <div key={section.id} id={section.id} className={`${NAV_OFFSET} mt-6`}>
                {index > 0 && <h3 className="b2b-h3">{section.title}</h3>}
                <Html html={index === 0 ? sources.rest : section.html} className="b2b-prose b2b-sources" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Further reading and downloads: Articles / Guides / Reports ── */}
      {(articles.length > 0 || guides.length > 0) && (
        <section className="b2b-sec" aria-labelledby="reading-title" data-component="IndustryReading">
          <div className="b2b-wrap">
            <p className="b2b-eyebrow">{tx("industry.readingEyebrow", "Further reading")}</p>
            <h2 id="reading-title" className="b2b-h2">
              {tx("industry.readingTitle", "Further reading and downloads.")}
            </h2>
            <ReadingTabs
              label={tx("industry.readingTabs", "Reading type")}
              panels={[
                { id: "articles", label: tx("industry.readingArticles", "Articles"), empty: !articles.length, content: readingGrid(articles) },
                { id: "guides", label: tx("industry.readingGuides", "Guides"), empty: !guides.length, content: readingGrid(guides) },
                { id: "reports", label: tx("industry.readingReports", "Reports"), empty: true, content: null },
              ]}
            />
            <div className="mt-8 flex justify-end">
              <Link className={LIME_BUTTON} href={pageHref("R01", locale)}>
                {tx("industry.readingAll", "View all articles")}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>
      )}

      <ClosingEnquiryPanel
        eyebrow={tx("industry.closingEyebrow", "Next step")}
        heading={closingHeadline || model.discuss?.title || tx("industry.closingTitle", "Tell us what you are setting up.")}
        intro={closingHeadline ? "" : closingIntro || tx("industry.closingIntro", "Tell us the product, the district and the stage you are at. A Rapid expert will call you.")}
        photoNote={tx("industry.closingPhoto", "Placeholder: a site in Haryana. Final photography to be supplied by Rapid.")}
        card={{
          title: tx("industry.formTitle", "Check what your unit can claim."),
          source: `industry-${page.slug}`.toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 60).replace(/-+$/, "") || "industry-page",
          pageId: page.slug,
          pageTitle: page.h1,
          serviceName: name,
          select: model.projects.length
            ? {
                label: tx("industry.cardTitle", "What are you setting up?"),
                options: model.projects.map((project) => project.title),
                placeholder: tx("industry.formChoose", "Not sure yet"),
              }
            : undefined,
          fields: ["district", "activity"],
          labels: { activity: tx("industry.formActivity", "Your product") },
          submitLabel: tx("industry.formSubmit", "Get my next steps"),
          helper: tx("industry.formHelper", "A Rapid expert will call you."),
          whatsapp: true,
        }}
      />
    </main>
  );
}
