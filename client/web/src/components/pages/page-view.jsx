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
import { ArrowRight } from "lucide-react";

import { cardCopy, linkedContentIds } from "@/lib/pages/card-copy";
import { isIndustryServiceSection } from "@/lib/pages/industry-services";
import { ClientTicker } from "@/components/common/client-ticker";
import { ShareActions } from "@/components/common/share-actions";
import { ContactExperience } from "../form/contact-experience";
import { ContextActions } from "../common/context-actions";
import { AdviserPage } from "./adviser-page";
import Heading from "@/components/layout/heading";
import Section from "@/components/layout/section";
import { ActiveSectionNav } from "@/components/common/active-section-nav";


import { ChevronRight, ChevronsUp } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ContentCard, InvestmentMetric } from "./content-card";
import {
  DownloadButton,
  Html,
  Icon,
  PhotoPlaceholder,
  SectionNav,
} from "./content-primitives";
import { Directory } from "./directory";
import { FaqContent } from "./faq-content";
import { HomeSections } from "@/home/home-sections";
import { IndustryServices } from "./industry-services";
import {
  InvestmentScenarios,
  isInvestmentScenarios,
} from "./investment-scenarios";
import { ProjectStages } from "./project-stages";
import {
  ServiceExplanation,
  serviceExplanationRole,
} from "./service-explanation";
import { TeamSection, isTeamSection } from "./team-section";
import Image from "next/image";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import Link from "next/link";

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
  ];

  return (
    <Section id={section.id} className={classes.filter(Boolean).join(" ")}>
      {/* Section heading via Heading component */}
      <Heading
        eyebrow={String(index + 1).padStart(2, "0")}
        heading={section.title}
        className="text-left mb-5  flex  items-center gap-4"
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
        headingClassName="text-[28px] leading-[1.35] font-semibold text-foreground "
      />
      {explanation ? (
        <ServiceExplanation section={section} role={explanation} />
      ) : isTeamSection(section) ? (
        <TeamSection section={section} locale={page.locale} t={t} />
      ) : isInvestmentScenarios(page, section) ? (
        <InvestmentScenarios section={section} t={t} />
      ) : isIndustryServiceSection(page, section) ? (
        <IndustryServices section={section} page={page} t={t} has={has} />
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

export function HeroSection({ t, page }) {
  // Split h1 into two halves: first half dark navy, second half teal
  const words = String(page.h1 || "").split(" ");
  const mid = Math.ceil(words.length / 2);
  const line1 = words.slice(0, mid).join(" ");
  const line2 = words.slice(mid).join(" ");

  return (
      <div className="grid min-h-[640px] lg:min-h-[730px] lg:grid-cols-2">
        {/* ───── Left content ───── */}
        <div className="flex items-center px-4 py-16 sm:px-6 lg:py-24 lg:pl-[max(2rem,calc((100vw-82.5rem)/2+2rem))] lg:pr-12">
          <div className="max-w-[620px]">
            {/* Eyebrow */}
            <p className="mb-5 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-[#1f5d57]">
              <ChevronsUp className="size-4" aria-hidden="true" />
              {t("site.eyebrowHome")}
            </p>

            {/* H1 */}
            <h1 className="text-[2.2rem] font-semibold leading-[1.12] tracking-tight text-foreground sm:text-5xl lg:text-[3.5rem]">
              {line1}
              {line2 && (
                <span className="text-[#1f5d57]"> {line2}</span>
              )}
            </h1>

            {/* Intro paragraph */}
            <div
              className="mt-5 max-w-xl text-base leading-8 text-muted-foreground sm:text-[17px] [&_p]:m-0 [&_p+p]:mt-4"
              dangerouslySetInnerHTML={{ __html: page.introHtml }}
            />

            {/* CTAs */}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button
                asChild
                className="group h-[60px] rounded-full bg-primary pl-8 pr-2 text-base font-semibold text-foreground shadow-none transition-all hover:bg-[#dcf24f] hover:-translate-y-0.5"
              >
                <Link href="/about">
                  <span>About Us</span>
                  <span className="ml-3 flex size-11 items-center justify-center rounded-full bg-accent text-white transition-transform group-hover:translate-x-0.5">
                    <ChevronRight className="size-5" aria-hidden="true" />
                  </span>
                </Link>
              </Button>

              <WhatsAppButton />
            </div>
          </div>
        </div>

        {/* ───── Right image (full-bleed) ───── */}
        <div className="relative min-h-[380px] w-full lg:min-h-full">
          <Image
            src="/assets/hero-section.jpg"
            alt="Rapid Consulting team"
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
          {/* Subtle left-edge gradient to blend with content */}
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#f6f6f6] to-transparent lg:hidden"
          />
        </div>
      </div>
  );
}


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

function Attribution({ page, t }) {
  return (
    <div className="attribution">
      <div className="avatar-placeholder">
        <Icon name="users-three" />
      </div>
      <div>
        {["article", "guide"].includes(page.type) && (
          <span>{t("site.attribution.authorPending")}</span>
        )}
        <p>
          {t("site.attribution.designatedReviewer")}{" "}
          <a href={pageHref("P01", page.locale)}>Atul Goyal</a>
          <span> · {t("site.attribution.founderRole")}</span>
        </p>
        <small>{t("site.attribution.reviewPending")}</small>
      </div>
    </div>
  );
}

function Sources({ page, t }) {
  if (
    !page.sourceUrls.length ||
    !["scheme", "article", "guide"].includes(page.type)
  )
    return null;
  return (
    <Section className="source-panel" id="source-record">
      <h2>{t("site.sources.title")}</h2>
      <p>{t("site.sources.intro")}</p>
      <ul>
        {page.sourceUrls.map((url, i) => {
          const host = new URL(url).hostname;
          return (
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
          );
        })}
      </ul>
      <p className="small">{t("site.sources.reviewerNote")}</p>
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
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
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

function Hero({ page, t, detail = false }) {
  const benefit = benefitSection(page);
  const intro = (benefit ? benefit.html : page.introHtml).replace(
    /<p>On this page:[\s\S]*?<\/p>/g,
    "",
  );
  const downloadable =
    page.locale === "en" && ["guide", "scheme"].includes(page.type);

  // Industry pages get the Heading component treatment
  if (page.type === "industry") {
    return (
      <header className={`page-hero ${detail ? "detail-hero" : ""}`}>
        <Heading
          eyebrow={eyebrowFor(page, t)}
          heading={page.h1}
          className="text-left"
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
          headingClassName="text-[clamp(34px,3.7vw,48px)] leading-[1.16] tracking-[-0.04em] font-semibold text-foreground mt-0"
        />
        {benefit && <h2 className="benefit-heading">{benefit.title}</h2>}
        <Html html={intro} className="hero-copy" />
        <ContextActions t={t} />
        <ReviewNote page={page} t={t} />
      </header>
    );
  }

  return (
    <header className={`page-hero ${detail ? "detail-hero" : ""}`}>
      <p className="eyebrow">
        {page.type === "home" ? t("site.eyebrowHome") : eyebrowFor(page, t)}
      </p>
      <h1>{page.h1}</h1>
      {detail && <ShareActions title={page.h1} />}
      {["article", "guide", "scheme", "case-study"].includes(page.type) && (
        <Attribution page={page} t={t} />
      )}
      {benefit && <h2 className="benefit-heading">{benefit.title}</h2>}
      {page.type === "case-study" ? (
        <CaseIntroduction page={page} t={t} />
      ) : (
        <Html html={intro} className="hero-copy" />
      )}
      <ContextActions t={t} />
      {downloadable && (
        <div className="download-row">
          <DownloadButton
            href={`/downloads/${page.id}.pdf`}
            label={
              page.type === "guide"
                ? t("site.download.guide")
                : t("site.download.scheme")
            }
          />
          <span>{t("site.download.note")}</span>
        </div>
      )}
      <ReviewNote page={page} t={t} />
    </header>
  );
}

function  HomeView({ page, t, has }) {
  const credibility = [
    [t("site.credibility.years"), "chart-line-up"],
    [t("site.credibility.assignments"), "clipboard-text"],
    [t("site.credibility.businesses"), "users-three"],
  ];

  return (
    <>
      {/* Hero Section */}
     <HeroSection t={t} page={page} ></HeroSection>

      {/* Credibility Strip */}
      <Section className="border-y border-border bg-white py-0">
          <div className="grid grid-cols-1 divide-y divide-[#d6dde3] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {credibility.map(([label, icon]) => (
              <div
                key={icon}
                className="flex items-center gap-4 px-5 py-6 sm:px-8 lg:py-9"
              >
                {/* Icon bubble */}
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-foreground">
                  <Icon name={icon} />
                </div>

                {/* Stats */}
                <div className="flex flex-col">
                  <strong className="text-2xl font-bold leading-none tracking-tight text-foreground">
                    —
                  </strong>
                  <span className="mt-1 text-sm font-semibold text-foreground">
                    {label}
                  </span>
                  <small className="mt-0.5 text-xs text-muted-foreground">
                    {t("site.credibility.pending")}
                  </small>
                </div>
              </div>
            ))}
          </div>
        
      </Section>

      {/* Client Ticker */}
      
          <ClientTicker />
      
      {/* Home Sections */}
      <HomeSections
        page={page}
        t={t}
        has={has}
      />
    </>
  );
}

export function DetailLayout({ page, t, children }) {
  return (
<>
            <Breadcrumbs page={page} t={t} />

    <Section as="div" className="py-0  bg-gray-50">
      <div className="[&_.breadcrumbs]:py-3 border-b border-slate-200 mb-0">
  
      </div>
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

export function DetailView({ page, t, has }) {
  const sections = page.sections.filter((s) => s !== benefitSection(page));
  const nav = explanationNav[`${page.locale}/${page.id}`] ?? {};
  return (
    <>
    <DetailLayout page={page} t={t}>
      <Hero page={page} t={t} detail />
      <ActiveSectionNav
        title={t("service.onThisPage")}
        label={t("service.onThisPageLabel")}
        sections={sections.map((s) => ({
          id: s.id,
          title: nav[s.id] || s.title,
        }))}
      />
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
      <Related page={page} t={t} has={has} compact />
    </DetailLayout>
          <ClientTicker />
</>
  );
}

export function IndustryView({ page, t, has }) {
  const navSections = page.sections.map((s) => ({ id: s.id, title: s.title }));

  return (
    <>
      <DetailLayout page={page} t={t}>
        <Hero page={page} t={t} />
        {navSections.length > 0 && (
          <ActiveSectionNav
            title={t("service.onThisPage")}
            label={t("service.onThisPageLabel")}
            sections={navSections}
          />
        )}
        {page.sections.map((s, i) => (
          <BodySection
            section={s}
            page={page}
            index={i}
            key={s.id}
            t={t}
            has={has}
          />
        ))}
        <Related page={page} t={t} has={has} compact />
      </DetailLayout>
      <ClientTicker />
    </>
  );
}

export function AboutUsView({ page, t, has }) {
  const contactId =
    page.locale === "hi"
      ? "अपने-प्रोजेक्ट-पर-बात-करें"
      : "discuss-your-project";
  const contact = page.sections.find((section) => section.id === contactId);
  const sections = page.sections.filter((section) => section !== contact);
  return (
    <main id="main" className="container standard-page about-page">
      <Breadcrumbs page={page} t={t} />
      <header className="page-hero about-hero">
        <p className="eyebrow">Rapid Consulting</p>
        <h1>{page.h1}</h1>
        <Html html={page.introHtml} className="hero-copy" />
        <ContextActions t={t} />
      </header>
      <ClientTicker />
      <div className="standard-body">
        {sections.map((section, index) => {
          const advantage = [
            "the-rapid-advantage",
            "रैपिड-के-साथ-काम-करने-के-फायदे",
          ].includes(section.id);
          if (!advantage)
            return (
              <BodySection
                key={section.id}
                section={section}
                page={page}
                index={index}
                t={t}
                has={has}
              />
            );
          const blocks = section.html.split(/(?=<h3\b)/);
          return (
            <Section
              key={section.id}
              id={section.id}
              className="body-section section-wash about-advantage"
            >
              <Heading
                eyebrow={String(index + 1).padStart(2, "0")}
                heading={section.title}
                className="text-left mb-5"
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
                headingClassName="text-[28px] leading-[1.35] font-semibold text-foreground mt-1"
              />
              <div className="about-advantage-grid">
                {blocks
                  .filter((block) => block.trim())
                  .map((html, i) => (
                    <article key={i}>
                      <Icon
                        name={
                          [
                            "target",
                            "clipboard-text",
                            "users-three",
                            "factory",
                          ][i] || "target"
                        }
                      />
                      <Html html={html} />
                    </article>
                  ))}
              </div>
            </Section>
          );
        })}
      </div>
      <Section id={contact?.id || contactId} className="about-contact">
        <div>
          <p className="eyebrow">{t("site.about.letsTalk")}</p>
          <h2>{contact?.title || t("site.about.discussProject")}</h2>
          {contact && <Html html={contact.html} />}
        </div>
        <ContactExperience
          pageTitle={page.h1}
          pageId={page.id}
          variant="section"
        />
      </Section>
    </main>
  );
}

export function StandardView({ page, t, has }) {
  if (page.id === "U01")
    return (
      <AdviserPage
        page={page}
        breadcrumbs={<Breadcrumbs page={page} t={t} />}
        t={t}
        has={has}
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
