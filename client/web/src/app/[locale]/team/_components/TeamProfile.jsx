import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SocialIcon } from "@/components/layout/social-icons";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ClientTicker } from "@/components/common/client-ticker";
import { JsonLd } from "@/components/common/json-ld";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { FigmaEnquiryCard } from "@/components/forms/figma-enquiry-card";
import { CaseCard, caseCardLabels } from "@/components/case-card";
import { SectionHeading } from "@/components/home/section-heading";
import { BTN_LIME, BTN_OUTLINE, WRAP } from "@/components/home/styles";
import { EYEBROW_FLAT, WhatsAppOutline } from "@/components/pages/b2e-ui";
import { Html } from "@/components/pages/content-primitives";
import { hasTranslation } from "@/i18n/has-translation";
import { stripTags } from "@/lib/content/adapters";
import { b2eText } from "@/lib/pages/b2e-copy";
import { homeText } from "@/lib/pages/home-copy";
import { SITE_URL, WHATSAPP_LABEL, absoluteUrl, mainSiteHref } from "@/lib/site";

const hasMarkup = (value) => /<[a-z][\s\S]*>/i.test(value);

// The biography is plain text or editor HTML; either way it renders as prose.
function Bio({ text }) {
  if (!text?.trim()) return null;
  if (hasMarkup(text)) return <Html html={text} className="text-[17px] leading-8 text-slate-700" />;
  return (
    <div className="prose text-[17px] leading-8 text-slate-700">
      {text
        .split(/\n\s*\n/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean)
        .map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
    </div>
  );
}

// Structured data only for real profiles: a labelled placeholder is not a
// person Rapid can vouch for yet.
function personJsonLd(person) {
  const url = absoluteUrl(person.href);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#person`,
    name: person.name,
    url,
    ...(person.designation ? { jobTitle: person.designation } : {}),
    ...(person.photo ? { image: person.photo } : {}),
    ...(person.linkedin ? { sameAs: [person.linkedin] } : {}),
    ...(person.expertise.length ? { knowsAbout: person.expertise } : {}),
    worksFor: { "@type": "Organization", name: "Rapid Consulting", url: SITE_URL },
  };
}

const TITLES = /^(dr|ca|cs|cma|mr|mrs|ms|adv|er|prof)\.?$/i;
const firstNameOf = (name = "") => {
  const words = String(name).split(/\s+/).filter(Boolean);
  return words.find((word) => !TITLES.test(word)) ?? words[0] ?? name;
};

const initialsOf = (name = "") =>
  String(name)
    .split(/\s+/)
    .filter((word) => word && !TITLES.test(word))
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join("")
    .toUpperCase();

// One short paragraph of the biography for the hero.
function summaryOf(bio = "", max = 280) {
  const first = stripTags(bio).split(/\n\s*\n|(?<=[.!?])\s{2,}/)[0]?.trim() ?? "";
  if (first.length <= max) return first;
  const cut = first.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(" ")).trim()}…`;
}

// A team member's profile (Team profile / CMS person record; Figma 1550-83468):
// portrait tile, name, role, credential chips and links; then About, the guides
// and pages they wrote and reviewed (`children`: PersonResources) and their
// cases, with an "Ask <name>'s team" form rail beside all three. The same record
// backs the reviewer and author cards shown on articles, schemes and case studies.
export function TeamProfile({ person, locale, t, cases = [], children = null }) {
  const text = b2eText(t);
  const home = homeText(t, hasTranslation(t), locale);
  const about = mainSiteHref("A03", locale, false);
  const first = person.placeholder ? person.name : firstNameOf(person.name);
  const items = [
    { label: t("common.home"), href: `/${locale}` },
    { label: t("breadcrumb.about"), href: about },
    { label: person.name },
  ];
  const caseLabels = caseCardLabels(home);
  const summary = person.placeholder ? "" : summaryOf(person.bio);
  const showBio = !person.placeholder && person.bio?.trim();

  return (
    <>
      <Breadcrumbs items={items} t={t} />
      {!person.placeholder && <JsonLd data={personJsonLd(person)} />}

      <main id="main">
        <section aria-labelledby="profile-title" className="bg-[#eef3f0] py-10 md:py-14">
          <div className={WRAP}>
            <div className="grid items-start gap-8 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)] md:gap-12">
              <figure className="m-0 mx-auto w-full max-w-[280px] md:mx-0">
                {person.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={person.photo}
                    alt={person.name}
                    className="aspect-[4/5] w-full rounded-3xl border border-slate-200 object-cover"
                  />
                ) : (
                  <div
                    role="img"
                    aria-label={text("profile.portraitFull")}
                    className="flex aspect-[4/5] w-full items-center justify-center rounded-3xl border border-[#09263e]/10 bg-[#e1ebe6] text-[88px] font-semibold tracking-wide text-[#1f5d57]/80"
                  >
                    <span aria-hidden="true">{initialsOf(person.name)}</span>
                  </div>
                )}
                {!person.photo && (
                  <figcaption className="mt-3 text-center text-xs font-medium leading-5 text-slate-600">
                    {text("profile.portrait")}
                  </figcaption>
                )}
              </figure>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <p className={EYEBROW_FLAT}>{t("detail.team.eyebrow")}</p>
                  {person.placeholder && (
                    <span className="inline-flex items-center rounded-full bg-[#09263e] px-3 py-1 text-[11px] font-bold uppercase leading-none tracking-[0.14em] text-[#eaff6b]">
                      {text("profile.sample")}
                    </span>
                  )}
                </div>
                <h1
                  id="profile-title"
                  className="mb-0! mt-3! max-w-none! text-[clamp(32px,3.6vw,46px)]! font-bold! leading-[1.1]! tracking-[-0.03em]! text-[#09263e]!"
                >
                  {person.name}
                </h1>
                {person.designation && (
                  <p className="mb-0! mt-3! text-lg font-bold leading-snug text-[#09263e]">{person.designation}</p>
                )}
                {summary && <p className="mb-0! mt-4! max-w-[60ch] text-[17px] leading-8 text-slate-700">{summary}</p>}

                {person.expertise.length > 0 && (
                  <ul className="m-0 mt-5 flex list-none flex-wrap gap-2 p-0" aria-label={t("detail.team.expertise")}>
                    {person.expertise.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-[#09263e]/15 bg-white px-3.5 py-1.5 text-sm font-medium text-[#09263e]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {person.linkedin && (
                  <p className="mb-0! mt-5!">
                    <a
                      href={person.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-[#1f5d57]! underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
                    >
                      <span className="inline-flex size-4 items-center justify-center [&>svg]:size-4"><SocialIcon id="linkedin" /></span>
                      {t("detail.team.linkedin")}
                      <ArrowUpRight className="size-4" aria-hidden="true" />
                    </a>
                  </p>
                )}

                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <EnquiryTrigger className={BTN_LIME} source="team-profile" serviceName={person.name} pageTitle={person.name}>
                    {text("common.discuss")}
                    <span aria-hidden="true">→</span>
                  </EnquiryTrigger>
                  <WhatsAppOutline label={text("common.whatsapp", { number: WHATSAPP_LABEL })} />
                </div>
                <p className="mb-0! mt-5!">
                  <Link
                    href={about}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#09263e]! underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    {t("detail.team.backToTeam")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* The form rail runs from About to Cases and stops before the full-width sections below. */}
        <div className="bg-white py-12 sm:py-16 lg:py-20">
          <div className={WRAP}>
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-14">
              <div className="min-w-0">
                <section id="about" aria-labelledby="profile-about-title" className="scroll-mt-28">
                  <SectionHeading
                    id="profile-about-title"
                    eyebrow={text("profile.about", { name: first })}
                    title={text("profile.background")}
                  />
                  <div className="mt-6">
                    {showBio ? (
                      <Bio text={person.bio} />
                    ) : (
                      <p className="m-0! rounded-xl border border-dashed border-[#09263e]/25 bg-[#e8efec] px-4 py-3 text-sm text-[#09263e]">
                        {t("detail.team.placeholderNote")}
                      </p>
                    )}
                  </div>
                </section>

                {/* Written and reviewed: PersonResources renders nothing for a person with no
                    items, and the heading hides with it (no empty headings). */}
                <section id="written-and-reviewed" className="group/pr scroll-mt-28 has-[[data-component=PersonResources]_section]:mt-14">
                  <div className="hidden group-has-[[data-component=PersonResources]_section]/pr:block">
                    <SectionHeading
                      eyebrow={text("profile.writtenEyebrow")}
                      title={text("profile.writtenTitle", { name: first })}
                    />
                    {person.placeholder && (
                      <p className="mb-0! mt-3! text-sm leading-6 text-slate-600">{text("profile.sampleNote")}</p>
                    )}
                  </div>
                  <div className="[&>div>section:first-child]:mt-8">{children}</div>
                </section>

                {cases.length > 0 && (
                  <section id="cases" aria-labelledby="profile-cases-title" className="mt-14 scroll-mt-28">
                    <SectionHeading
                      id="profile-cases-title"
                      eyebrow={text("profile.casesEyebrow")}
                      title={text("profile.casesTitle", { name: first })}
                    />
                    <ul className="m-0 mt-8 grid list-none gap-6 p-0 md:grid-cols-2">
                      {cases.map((item) => (
                        <li key={item.id} className="m-0 flex">
                          <div className="w-full min-w-0 [&>*]:h-full">
                            <CaseCard
                              item={item}
                              labels={caseLabels}
                              label={home("homeA.cases.label")}
                              cta={home("homeA.cases.cta")}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                    <p className="mb-0! mt-8!">
                      <Link href={`/${locale}/case-studies`} className={BTN_OUTLINE}>
                        {text("profile.seeCases")}
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </Link>
                    </p>
                  </section>
                )}
              </div>

              <aside aria-label={text("profile.askTitle", { name: first })} className="b2e-rail min-w-0">
                <FigmaEnquiryCard
                  id="ask-the-team"
                  title={text("profile.askTitle", { name: first })}
                  seal="free"
                  source="team-profile"
                  pageId={person.slug}
                  pageTitle={person.name}
                  serviceName={`${text("profile.about", { name: person.name })}`}
                  select={{
                    label: text("contact.form.choice"),
                    required: true,
                    options: [text("contact.form.haryana"), text("contact.form.another"), text("contact.form.notSure")],
                    placeholder: text("contact.form.choicePlaceholder"),
                  }}
                  fields={["district", "activity"]}
                  labels={{
                    name: home("homeA.form.name"),
                    phone: home("homeA.form.phone"),
                    district: text("contact.form.district"),
                    activity: text("contact.form.activity"),
                    optional: text("contact.form.optional"),
                    choiceError: text("contact.form.choiceError"),
                    consent: home("homeA.form.consent"),
                    consentHelp: home("homeA.form.consentHelp"),
                    another: home("homeA.form.another"),
                  }}
                  submitLabel={text("contact.form.submit")}
                  helper={text("contact.form.helper")}
                  whatsapp
                  whatsappLabel={text("common.chatWhatsapp")}
                />
              </aside>
            </div>
          </div>
        </div>
      </main>
      <ClientTicker />
    </>
  );
}
