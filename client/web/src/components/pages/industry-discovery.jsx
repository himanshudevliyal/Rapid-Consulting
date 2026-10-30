import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ContentCard as ServiceCard } from "@/components/common/content-card";
import { ContentCard } from "./content-card";
import { Html } from "./content-primitives";
import Section from "@/components/layout/section";
import { b2bText } from "@/lib/pages/b2b-text";
import { serviceHref } from "@/lib/site";

// A short preview: 2-3 entries per group, then the filtered directory.
const PREVIEW = 3;

export const INDUSTRY_SCHEMES_ID = "industry-schemes";
export const INDUSTRY_SERVICES_ID = "industry-services";

// Which of the two groups an industry page shows (for the section navigation).
export const industryGroups = (page) => {
  const { services = [], schemes = [] } = page.discovery ?? {};
  return { schemes: schemes.length > 0, services: services.length > 0 };
};

const ViewAll = ({ href, children }) => (
  <a
    className="industry-archive-link inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-[#eaff6b] px-5 text-sm font-semibold text-[#09263e] no-underline transition-colors hover:bg-[#dcf24f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
    href={href}
  >
    {children}
    <ArrowUpRight className="size-4" aria-hidden="true" />
  </a>
);

// The schemes and services chosen for an industry in the admin panel
// (Industries -> Related services and schemes), shown after the page body as
// two separate groups. Each group previews 2-3 entries, in the order the
// single industry catalogue gives, and has its own "View all" button that
// opens the matching directory already filtered to this industry.
// Nothing is listed here that the API did not return.
export function IndustryDiscovery({ page, t, has }) {
  const { services = [], schemes = [], note = "" } = page.discovery ?? {};
  if (!services.length && !schemes.length) return null;
  const locale = page.locale;
  const filter = `?industry=${encodeURIComponent(page.slug)}`;

  return (
    <div className="industry-service-groups industry-discovery" data-component="IndustryDiscovery">
      {schemes.length > 0 && (
        <Section
          as="div"
          id={INDUSTRY_SCHEMES_ID}
          className="industry-discovery-group scroll-mt-[calc(var(--site-header-h,var(--header-height,80px))+var(--section-nav-h,52px)+16px)]! py-9"
          containerClassName="px-0"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]">
            {t("detail.industry.schemesEyebrow")}
          </p>
          <h2 className="!m-0 !text-2xl !font-semibold !tracking-tight !text-[#09263e]">
            {t("site.industryServices.schemes")}
          </h2>
          {note && <p className="industry-discovery-note">{note}</p>}
          <div className="industry-discovery-grid mt-5">
            {schemes.slice(0, PREVIEW).map((item) => (
              <ContentCard key={item.id} page={item} locale={locale} t={t} has={has} />
            ))}
          </div>
          <div>
            <ViewAll href={`/${locale}/schemes${filter}`}>{t("site.industryServices.viewSchemes")}</ViewAll>
          </div>
        </Section>
      )}
      {services.length > 0 && (
        <Section
          as="div"
          id={INDUSTRY_SERVICES_ID}
          className="industry-discovery-group scroll-mt-[calc(var(--site-header-h,var(--header-height,80px))+var(--section-nav-h,52px)+16px)]! py-9"
          containerClassName="px-0"
        >
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]">
            {t("detail.industry.servicesEyebrow")}
          </p>
          <h2 className="!m-0 !text-2xl !font-semibold !tracking-tight !text-[#09263e]">
            {t("site.industryServices.services")}
          </h2>
          <div className="industry-discovery-grid mt-5">
            {services.slice(0, PREVIEW).map((service) => (
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
          <div>
            <ViewAll href={`/${locale}/services${filter}`}>{t("site.industryServices.viewServices")}</ViewAll>
          </div>
        </Section>
      )}
    </div>
  );
}

// ── The Figma industry page ─────────────────────────────────────────────────

export const INDUSTRY_CLAIMS_ID = "what-you-can-claim";

const PILL_STATUSES = ["open", "upcoming", "closed", "historical"];

// "Open", "Closed"...; a scheme whose status has not been recorded is "Being
// checked" - it must never read as an open programme.
function StatusPill({ status, t }) {
  const tx = b2bText(t);
  const known = PILL_STATUSES.includes(status);
  return (
    <span className={`b2b-pill b2b-pill--${known ? status : "checking"}`} data-scheme-status={known ? status : "unspecified"}>
      {known ? t(`detail.scheme.status.${status}`) : tx("industry.statusChecking", "Being checked")}
    </span>
  );
}

// Schemes grouped by the kind of support they give (the scheme's own
// "assistance type", else the topic it is filed under).
export function claimRowsOf(schemes = [], fallbackKind = "") {
  const groups = new Map();
  for (const scheme of schemes) {
    const kind = scheme.facts?.assistanceType?.trim() || scheme.topic || fallbackKind;
    if (!groups.has(kind)) groups.set(kind, { kind, activities: [], schemes: [] });
    const group = groups.get(kind);
    const activity = scheme.facts?.activity?.trim();
    if (activity && !group.activities.includes(activity)) group.activities.push(activity);
    group.schemes.push(scheme);
  }
  return [...groups.values()];
}

// "What a food unit can claim, and from where": the schemes chosen for the
// industry (Industries -> Related schemes), grouped by kind of support, each with
// its status. The "what it pays back" column appears only when the schemes
// carry that information. Nothing is listed that the API did not return.
export function IndustryClaims({ page, t, eyebrow, title, lead, prose = [] }) {
  const tx = b2bText(t);
  const schemes = page.discovery?.schemes ?? [];
  if (!schemes.length) return null;
  const rows = claimRowsOf(schemes, tx("industry.claimsGeneric", "Schemes selected for this industry"));
  const showPays = rows.some((row) => row.activities.length > 0);
  const filter = `?industry=${encodeURIComponent(page.slug)}`;

  return (
    <section id={INDUSTRY_CLAIMS_ID} className="b2b-sec b2b-sec--band scroll-mt-[calc(var(--site-header-h,var(--header-height,80px))+var(--section-nav-h,52px)+16px)]" aria-labelledby="claims-title" data-component="IndustryClaims">
      <div className="b2b-wrap">
        <p className="b2b-eyebrow">{eyebrow}</p>
        <h2 id="claims-title" className="b2b-h2">
          {title}
        </h2>
        {lead && <p className="b2b-sec__lead">{lead}</p>}
        <div className="b2b-table-wrap" role="region" aria-labelledby="claims-title" tabIndex={0}>
          <table className="b2b-table">
            <thead>
              <tr>
                <th scope="col">{tx("industry.colKind", "Kind of support")}</th>
                {showPays && <th scope="col">{tx("industry.colPays", "What it pays back")}</th>}
                <th scope="col">{tx("industry.colSchemes", "Schemes to look at")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.kind}>
                  <th scope="row">{row.kind}</th>
                  {showPays && <td>{row.activities.join("; ")}</td>}
                  <td>
                    <ul className="b2b-scheme-list">
                      {row.schemes.map((scheme) => (
                        <li key={scheme.id}>
                          <Link href={scheme.href}>{scheme.title}</Link>
                          <StatusPill status={scheme.facts?.status} t={t} />
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {prose.map((section) => (
          <div key={section.id} id={section.id} className="b2b-claims-note">
            <h3>{section.title}</h3>
            <Html html={section.html} className="b2b-prose" />
          </div>
        ))}
        <div className="mt-6">
          <Link
            href={`/${page.locale}/schemes${filter}`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#eaff6b] px-5 text-sm font-semibold text-[#09263e] no-underline transition-colors hover:bg-[#dcf24f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
          >
            {t("site.industryServices.viewSchemes")}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// The services chosen for the industry, as service cards, with the link to the
// filtered services directory.
export function IndustryServices({ page, t, eyebrow, title }) {
  const services = page.discovery?.services ?? [];
  if (!services.length) return null;
  const locale = page.locale;
  const filter = `?industry=${encodeURIComponent(page.slug)}`;
  return (
    <section
      id={INDUSTRY_SERVICES_ID}
      className="b2b-sec scroll-mt-[calc(var(--site-header-h,var(--header-height,80px))+var(--section-nav-h,52px)+16px)]"
      aria-labelledby="industry-services-title"
      data-component="IndustryServices"
    >
      <div className="b2b-wrap">
        <p className="b2b-eyebrow">{eyebrow}</p>
        <h2 id="industry-services-title" className="b2b-h2">
          {title}
        </h2>
        <div className="industry-discovery-grid mt-6">
          {services.slice(0, PREVIEW).map((service) => (
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
        <div className="mt-6">
          <ViewAll href={`/${locale}/services${filter}`}>{t("site.industryServices.viewServices")}</ViewAll>
        </div>
      </div>
    </section>
  );
}
