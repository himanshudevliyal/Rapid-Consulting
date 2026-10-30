import { explanationNav } from "@/lib/pages/explanation-layouts";
import {
  getPage,
  getRelated,
  getSummaries,
  pageHref,
} from "@/lib/pages/content";
import { hasFaqContent } from "@/lib/pages/faq";
import {
  benefitSection,
  contactFormSection,
  contactPresentation,
  displayedEvidenceIds,
  evidenceCaseIds,
} from "@/lib/pages/presentation";
import { WhatsAppButton } from "@/components/contact/whatsapp";

import { cardCopy, linkedContentIds } from "@/lib/pages/card-copy";
import { ClientTicker } from "@/components/common/client-ticker";
import { ShareActions } from "@/components/common/share-actions";
import { ContactExperience } from "../form/contact-experience";
import { ContextActions } from "../common/context-actions";
import { AdviserPage } from "./adviser-page";
import Heading from "@/components/layout/heading";
import Section from "@/components/layout/section";
import { ActiveSectionNav } from "@/components/common/active-section-nav";
import { AuthorReviewer } from "@/components/common/author-reviewer";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { SvrTeaser } from "@/components/common/svr-teaser";
import { ContentCard as ServiceCard } from "@/components/common/content-card";
import { CaseContext, CaseEvidence } from "./case-evidence";
import { SchemeFacts } from "./scheme-facts";
import { pdfFor } from "@/lib/pages/downloads";
import { loadServicesForScheme } from "@/lib/content/related";
import { serviceHref } from "@/lib/site";




import { ContentCard, InvestmentMetric } from "./content-card";
import {
  DownloadButton,
  Html,
  Icon,
  PhotoPlaceholder,
  SectionNav,
} from "./content-primitives";
import { FaqContent } from "./faq-content";
import { HomeView } from "./home-view";
import { AboutUsView } from "./about-view";
import { IndustryPage } from "./industry-page";
import {
  InvestmentScenarios,
  isInvestmentScenarios,
} from "./investment-scenarios";
import {
  ServiceExplanation,
  serviceExplanationRole,
} from "./service-explanation";
import { TeamSection, isTeamSection } from "./team-section";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { loadCaseStudies } from "@/lib/content/site-data";

// Detail templates (hero + "on this page" + numbered sections + contact rail).
export const DETAIL_TYPES = [
  "service",
  "service-family",
  "additional-service",
  "article",
  "guide",
  "scheme",
  "case-study",
];
// Archive pages rendered with the searchable directory.
export const COLLECTIONS = {
  S00: "services",
  R01: "articles",
  R02: "schemes",
  W00: "cases",
  I00: "industries",
};

const eyebrowFor = (page, t) =>
  page.locale === "hi" ? t("site.eyebrowGroupFallback") : page.group;

// Anchored sections stop below the site header AND the sticky section bar.
const NAV_OFFSET =
  "scroll-mt-[calc(var(--site-header-h,var(--header-height,80px))+var(--section-nav-h,52px)+16px)]!";
const EYEBROW =
  "mb-2 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]";
const H1 =
  "mt-0 text-[clamp(34px,3.7vw,48px)] font-semibold leading-[1.16] tracking-[-0.04em] text-[#09263e]";

function BodySection({ section, page, index, t, has }) {
  const faq = hasFaqContent(section.html);
  const explanation = serviceExplanationRole(page, section);
  const evidence = evidenceCaseIds(section)
    .map((id) => getPage(id, page.locale) || getPage(id, "en"))
    .filter(Boolean);
  const classes = [
    "body-section",
    index % 2 ? "section-wash" : "",
    evidence.length ? "proof-section" : "",
    NAV_OFFSET,
  ];

  return (
    <Section id={section.id} className={classes.filter(Boolean).join(" ")}>
      {/* Section heading via Heading component */}
      <Heading
        eyebrow={String(index + 1).padStart(2, "0")}
        heading={section.title}
        className="text-left mb-5  flex  items-center gap-4"
                  eyebrowClassName="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]"
        headingClassName="text-[28px] leading-[1.35] font-semibold text-foreground "
      />
      {explanation ? (
        <ServiceExplanation section={section} role={explanation} />
      ) : isTeamSection(section) ? (
        <TeamSection section={section} locale={page.locale} t={t} />
      ) : isInvestmentScenarios(page, section) ? (
        <InvestmentScenarios section={section} t={t} />
      ) : faq ? (
        <FaqContent html={section.html} />
      ) : (
        <Html html={section.html} />
      )}
      {evidence.length > 0 && (
        <div className="evidence-cards">
          {evidence.map((p) => (
            <ContentCard
              key={p.id}
              page={p}
              locale={page.locale}
              t={t}
              has={has}
            />
          ))}
        </div>
      )}
    </Section>
  );
}

const PARENTS = {
  service: "S00",
  "service-family": "S00",
  "additional-service": "S00",
  industry: "I00",
  article: "R01",
  guide: "R01",
  scheme: "R02",
  "case-study": "W00",
  job: "U02",
  person: "A03",
};




// import { Html } from "..."  // apna existing Html component import yaha rakho



function ReviewNote({ page, t }) {
  if (page.reviewLabel === "Draft") return null;
  const [title, text] =
    page.type === "case-study"
      ? [t("site.review.caseTitle"), t("site.review.caseText")]
      : page.id === "P02"
        ? [t("site.review.privacyTitle"), t("site.review.privacyText")]
        : [t("service.reviewTitle"), t("service.reviewText")];
  return (
    <aside className="review-note">
      <Icon name="clipboard-text" />
      <p>
        <strong>{title} · </strong>
        {text}
      </p>
    </aside>
  );
}

// References (official / earlier pages) and the review of the page: the
// reviewer is the same linked name card used under the title. No reviewer, no
// review block; sources alone still list.
const SOURCEABLE = ["scheme", "article", "guide"];
const sourceLinks = (page) =>
  (SOURCEABLE.includes(page.type) ? (page.sourceUrls ?? []) : [])
    .map((url) => {
      try {
        return { url, host: new URL(url).hostname };
      } catch {
        return null;
      }
    })
    .filter(Boolean);
const hasSources = (page) =>
  sourceLinks(page).length > 0 ||
  (SOURCEABLE.includes(page.type) && Boolean(page.reviewer));

function Sources({ page, t }) {
  const links = sourceLinks(page);
  const reviewer = SOURCEABLE.includes(page.type) ? page.reviewer : null;
  if (!links.length && !reviewer) return null;
  return (
    <Section className={`source-panel ${NAV_OFFSET}`} id="source-record">
      <h2>{t("site.sources.title")}</h2>
      {links.length > 0 && (
        <>
          <p>{t("site.sources.intro")}</p>
          <ul>
            {links.map(({ url, host }, i) => (
              <li key={url}>
                <a href={url} target="_blank" rel="noreferrer">
                  {host.includes("rapidconsulting.in")
                    ? t("site.sources.earlierPage")
                    : host.replace("www.", "")}{" "}
                  <span className="source-label">
                    · {t("site.sources.reference")} {i + 1} ↗
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      {reviewer && (
        <div className="mt-6 border-t border-slate-200 pt-5">
          <AuthorReviewer page={page} t={t} variant="review" className="!my-0" />
          <p className="small">{t("detail.sources.reviewNote")}</p>
        </div>
      )}
    </Section>
  );
}

function Related({ page, t, has, compact = false }) {
  const shown = new Set(displayedEvidenceIds(page));
  // Pages built from API records bring their own related list (page.relatedItems).
  const pool = page.relatedItems ?? getRelated(page, undefined, Infinity);
  const group = (types, limit = 2) =>
    pool
      .filter((p) => types.includes(p.type) && !shown.has(p.id))
      .slice(0, limit);
  const sets = [
    {
      label: t("site.related.reading"),
      id: "R01",
      items: group(["article", "guide"]),
    },
    {
      label: t("site.related.services"),
      id: "S00",
      items: group(["service", "service-family"]),
    },
    {
      label: t("site.related.work"),
      id: "W00",
      items: group(["case-study"], 2),
    },
  ];
  return (
    <div
      className={compact ? "related-block compact-related" : "related-block"}
    >
      {sets
        .filter((s) => s.items.length)
        .map((s) => (
          <Section className="related-set" key={s.id}>
            <div className="section-heading">
              <div>
                <Heading
                  eyebrow={t("site.related.keepExploring")}
                  heading={s.label}
                  className="text-left"
                  eyebrowClassName="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]"
                  headingClassName="text-2xl font-semibold tracking-tight text-foreground mt-0"
                />
              </div>
              <a className="text-link" href={pageHref(s.id, page.locale)}>
                {t("common.viewAll")}
                {page.locale === "hi" ? t("common.englishSuffix") : ""}{" "}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
            <div className={`card-grid columns-${s.items.length}`}>
              {s.items.map((p) => (
                <ContentCard
                  key={p.id}
                  page={p}
                  locale={page.locale}
                  t={t}
                  has={has}
                />
              ))}
            </div>
          </Section>
        ))}
    </div>
  );
}

// Where to go after reading: the services relevant to a scheme (taken from
// the industries that list it) and the two directories. Real links only.
function NextSteps({ page, t, services = [] }) {
  const locale = page.locale;
  const links = [
    page.type !== "scheme" && {
      href: pageHref("R02", locale),
      label: t("detail.nextSteps.schemes"),
    },
    {
      href: `/${locale}/services`,
      label: t("detail.nextSteps.services"),
    },
  ].filter(Boolean);
  return (
    <Section className="related-block compact-related" containerClassName="px-0">
      <div className="related-set">
        <Heading
          eyebrow={t("site.related.keepExploring")}
          heading={t("detail.nextSteps.title")}
          className="text-left"
          eyebrowClassName={EYEBROW}
          headingClassName="text-2xl font-semibold tracking-tight text-foreground mt-0"
        />
        {services.length > 0 && (
          <div className={`card-grid columns-${services.length} mt-5`}>
            {services.map((service) => (
              <ServiceCard
                key={service.code}
                item={service}
                href={serviceHref(service, locale)}
                typeLabel={t(`card.types.${service.type}`)}
                englishTag={service.has_locale ? "" : t("common.englishTag")}
                actionLabel={t("card.explore")}
              />
            ))}
          </div>
        )}
        <ul className="m-0 mt-5 flex list-none flex-wrap gap-3 p-0">
          {links.map((link) => (
            <li key={link.href}>
              <a className="button button-secondary" href={link.href}>
                {link.label} <span aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}

function CaseIntroduction({ page, t }) {
  const pieces = [...page.introHtml.matchAll(/<p[^>]*>[\s\S]*?<\/p>/g)].map(
    (m) => m[0],
  );
  return (
    <div className="hero-copy case-introduction">
      {pieces.map((html, i) =>
        /₹/.test(html) && /<strong>/.test(html) ? (
          <InvestmentMetric key={i} page={page} t={t} size="hero" />
        ) : (
          <Html key={i} html={html} />
        ),
      )}
    </div>
  );
}

// WhatsApp first, then the enquiry drawer (same form as the page's callback rail).
function HeroActions({ page, t }) {
  return (
    <div className="actions">
      <WhatsAppButton />
      <EnquiryTrigger
        className="button button-secondary"
        source="page-hero"
        serviceName={page.type === "service" ? page.h1 : undefined}
      >
        {t("service.discussProject")}
        <span aria-hidden="true">↗</span>
      </EnquiryTrigger>
    </div>
  );
}

// Articles, guides, schemes and case studies: reading comes first. No banner
// picture above the title; the title, who wrote and reviewed it, then the
// opening copy.
function EditorialHero({ page, t }) {
  const intro = page.introHtml.replace(/<p>On this page:[\s\S]*?<\/p>/g, "");
  const pdf = pdfFor(page);
  const caseStudy = page.type === "case-study";
  return (
    <header className="page-hero detail-hero" data-component="EditorialHero">
      <span className={EYEBROW}>{eyebrowFor(page, t)}</span>
      <h1 className={H1}>{page.h1}</h1>
      <ShareActions title={page.h1} />
      <AuthorReviewer page={page} t={t} />
      {caseStudy ? (
        <CaseIntroduction page={page} t={t} />
      ) : (
        <Html html={intro} className="hero-copy" />
      )}
      {caseStudy && <CaseContext page={page} t={t} />}
      {page.type === "scheme" && <SchemeFacts page={page} t={t} />}
      {pdf && (
        <div className="download-row">
          <DownloadButton
            href={pdf}
            label={t(
              page.type === "scheme"
                ? "site.download.scheme"
                : page.type === "guide"
                  ? "site.download.guide"
                  : "site.download.generic",
            )}
          />
          <span>{t("site.download.note")}</span>
        </div>
      )}
      <HeroActions page={page} t={t} />
      {!caseStudy && <ReviewNote page={page} t={t} />}
    </header>
  );
}

// Plain breadcrumbs, then the sticky section bar across the full width (so a
// sticky form rail sits below the header and the bar), then the page and its
// callback rail.
export function DetailLayout({ page, t, nav, children }) {
  return (
    <>
      <Breadcrumbs page={page} t={t} />
      {nav}
      <Section as="div" className="py-0 bg-gray-50">
        <div className="detail-layout">
          <main className="detail-content" id="main">
            {children}
          </main>
          <aside className="detail-rail">
            <ContactExperience
              pageTitle={page.h1}
              pageId={page.id}
              variant="rail"
            />
          </aside>
        </div>
      </Section>
    </>
  );
}

export async function DetailView({ page, t, has }) {
  const sections = page.sections.filter((s) => s !== benefitSection(page));
  const nav = explanationNav[`${page.locale}/${page.id}`] ?? {};
  const navSections = [
    ...(page.type === "case-study" && page.proof
      ? [{ id: "evidence", title: t("detail.case.navEvidence") }]
      : []),
    ...sections.map((s) => ({ id: s.id, title: nav[s.id] || s.title })),
    ...(hasSources(page)
      ? [{ id: "source-record", title: t("detail.sources.navLabel") }]
      : []),
  ];
  const services =
    page.type === "scheme"
      ? await loadServicesForScheme(page.slug, page.locale).catch(() => [])
      : [];
  return (
    <>
      <DetailLayout
        page={page}
        t={t}
        nav={
          <ActiveSectionNav
            title={t("service.onThisPage")}
            label={t("service.onThisPageLabel")}
            sections={navSections}
          />
        }
      >
        {/* One reading width for the whole page */}
        <div className="w-full max-w-[860px]">
          <EditorialHero page={page} t={t} />
          {page.type === "case-study" && <CaseEvidence page={page} t={t} />}
          {sections.map((s, i) => (
            <BodySection
              section={s}
              page={page}
              index={i}
              key={s.id}
              t={t}
              has={has}
            />
          ))}
          <Sources page={page} t={t} />
          {page.type === "scheme" && <SvrTeaser context="scheme" />}
          <NextSteps page={page} t={t} services={services} />
          <Related page={page} t={t} has={has} compact />
        </div>
      </DetailLayout>
      <ClientTicker />
    </>
  );
}

// The industry page is built in industry-page.jsx (the Figma layout: hero with
// the project-type card, claims table, cases, FAQs); this stays as the one
// export other routes use for a page of type "industry".
export function IndustryView({ page, t, has }) {
  return <IndustryPage page={page} t={t} has={has} />;
}


export async function StandardView({ page, t, has }) {
  if (page.id === "U01")
    return (
      <AdviserPage
        page={page}
        breadcrumbs={<Breadcrumbs page={page} t={t} />}
        t={t}
        has={has}
        cases={await loadCaseStudies({ limit: 6 })}
      />
    );
  if (page.id === "A03") return <AboutUsView page={page} t={t} has={has} />;
  const contact = page.id === "C01";
  const recruitment = ["job", "careers", "recruitment-process"].includes(
    page.type,
  );
  const noForm = page.id === "P02" || recruitment;
  const formSection = contactFormSection(page);
  const formCopy = formSection ? contactPresentation(formSection) : undefined;
  const sections = page.sections.filter((s) => s !== formSection);
  const withPhoto = ["industry", "about", "person"].includes(page.type);
  return (
    <main
      id="main"
      className={`container standard-page ${page.type === "industry" ? "industry-page" : ""}`}
    >
      <Breadcrumbs page={page} t={t} />
      <Section className={`standard-hero ${withPhoto ? "with-photo" : ""}`}>
        <header className="page-hero">
          <p className="eyebrow">{eyebrowFor(page, t)}</p>
          <h1>{page.h1}</h1>
          <Html html={page.introHtml} className="hero-copy" />
          {!noForm && <ContextActions t={t} />}
          <ReviewNote page={page} t={t} />
        </header>
        {withPhoto && (
          <PhotoPlaceholder
            t={t}
            kind={page.type === "person" ? "person" : "facility"}
            label={page.type === "person" ? page.title : undefined}
          />
        )}
      </Section>
     
      {formSection && formCopy && (
         <>
               <Section >

          <ContactExperience
            pageTitle={page.h1}
            pageId={page.id}
            variant="section"
            requirementHint={formCopy.requirementHint}
          />
                </Section>

          </>
      )}

       <ClientTicker />
      <Section >
        {sections.map((s, i) => (
          <BodySection
            section={s}
            page={page}
            index={i}
            key={s.id}
            t={t}
            has={has}
          />
        ))}
      </Section>

      
      {page.type === "industry" && <Related page={page} t={t} has={has} />}
      {!contact && !noForm && (
        <Section>
        <ContactExperience
          pageTitle={page.h1}
          pageId={page.id}
          variant="section"
        />
        </Section>
      )}
    </main>
  );
}

/** One view for every content page; the page type picks the template. */
export function PageView({ page, t, has,image, industry = "" }) {
  const detail = DETAIL_TYPES.includes(page.type);
  if (page.id === "H01")
    return (
      <main id="main">
        <HomeView page={page} t={t} has={has} />
      </main>
    );
  if (detail) return <DetailView page={page} t={t} has={has} />;
  if (page.type === "industry")
    return <IndustryView page={page} t={t} has={has} />;
  return <StandardView page={page} t={t} has={has} />;
}
