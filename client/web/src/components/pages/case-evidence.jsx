import { formatDate } from "@/lib/format-date";
import { GlanceCard } from "@/components/b2c/shell";
import { b2cText } from "@/components/b2c/text";
import { Html } from "./content-primitives";

// What a headline figure measures, read from the record's own wording.
const SUBSIDY_BASIS = /subsidy (?:amount|received|sanctioned|disbursed|paid)|sanctioned (?:amount|subsidy)|disbursed|subsidy of/i;
const EQUIPMENT_BASIS = /equipment|machin|analy[sz]er|plant/i;
const EXPENDITURE_BASIS = /expenditure|expense|spend|spent|खर्च/i;
// "Hisar" is a district; "Hisar, Haryana" or "Sector 5, Faridabad" is a location.
// ("Sirsa, Haryana" is a district followed by the state.)
const looksLikeDistrict = (raw) => {
  const value = raw.replace(/,\s*Haryana$/i, "");
  return !/[,\d]/.test(value) && !/haryana|district|sector|industrial|area|phase/i.test(value);
};

// The "At a glance" card of a case study: industry, district, what the unit
// spent, the scheme, Rapid's role and where the file stands. Rows the record
// does not have are left out. The figure is the unit's own spend or
// investment: it is never relabelled as a subsidy unless the record says it is.
export function CaseGlance({ page, t }) {
  const tx = b2cText(t);
  const basis = page.metricLabel || "";
  const subsidy = SUBSIDY_BASIS.test(basis);
  const spendLabel = subsidy
    ? tx("case.subsidyAmount", "Subsidy amount")
    : EQUIPMENT_BASIS.test(basis)
      ? tx("case.equipmentSpend", "Equipment spend")
      : EXPENDITURE_BASIS.test(basis)
        ? tx("case.spend", "Spend")
        : t("detail.case.investmentLabel");

  const industry = page.industry || page.sector;
  const place = page.location;
  const milestoneDate = page.proof ? formatDate(page.proof.milestoneDate, page.locale) : "";
  const standing = page.proof?.milestoneLabel || milestoneDate;
  const hasMarkup = (value) => /<[a-z][\s\S]*>/i.test(value);

  const rows = [
    { label: tx("case.industry", "Industry"), value: industry },
    { label: looksLikeDistrict(place || "") ? tx("case.district", "District") : t("detail.case.location"), value: place, bold: true },
    {
      label: spendLabel,
      value: page.metric,
      big: true,
      // (the basis is left out when it only repeats the row's label)
      note: [basis && !/^equipment spend$/i.test(basis.trim()) && `${basis.charAt(0).toUpperCase()}${basis.slice(1)}.`, !subsidy && tx("case.spendNote", "This is what the unit spent, not the subsidy.")].filter(Boolean).join(" "),
    },
    { label: tx("case.scheme", "Scheme"), value: page.schemeName || page.serviceName },
    {
      label: t("detail.case.rapidRole"),
      value: page.rapidRole ? (hasMarkup(page.rapidRole) ? <Html html={page.rapidRole} className="[&_p]:m-0" /> : page.rapidRole) : "",
    },
    {
      label: tx("case.standing", "Where it stands"),
      value: standing,
      note: page.proof?.milestoneLabel && milestoneDate ? milestoneDate : undefined,
    },
  ];

  return <GlanceCard id="case-glance" titleId="case-glance-title" title={tx("case.glanceTitle", "At a glance")} rows={rows} />;
}

// Project context of a case study: where, which sector and what Rapid itself
// was responsible for. The client stays anonymous. Only fields that exist are
// shown; investment is labelled as investment and is never relabelled as a
// subsidy, sanction or disbursement.
export function CaseContext({ page, t }) {
  const rows = [
    [t("detail.case.location"), page.location],
    [t("detail.case.sector"), page.sector],
    [t("detail.case.rapidRole"), page.rapidRole],
  ].filter(([, value]) => value);
  const hasMarkup = (value) => /<[a-z][\s\S]*>/i.test(value);
  if (!rows.length) return null;

  return (
    <dl
      data-component="CaseContext"
      className="my-6 grid gap-x-8 gap-y-1 rounded-2xl border border-slate-200 bg-white p-5 sm:grid-cols-2"
    >
      {rows.map(([label, value]) => (
        <div key={label} className="border-b border-slate-200 py-3 last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0">
          <dt className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f5d57]">{label}</dt>
          <dd className="m-0 mt-1 text-[15px] leading-snug text-[#09263e]">
            {hasMarkup(value) ? <Html html={value} className="[&_p]:m-0" /> : value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

// Evidence of the outcome, shown only when Rapid has supplied approved
// material: a redacted document, a dated milestone and/or an approved quote.
// Each part is optional. Milestone labels are shown exactly as authored
// (e.g. "Sanction letter", "Disbursement"): this component never invents one.
export function CaseEvidence({ page, t }) {
  const proof = page.proof;
  if (!proof) return null;

  const date = formatDate(proof.milestoneDate, page.locale);
  const hasMilestone = proof.milestoneLabel || date;
  // A status line alone ("Application filed; result to be confirmed") is shown in the
  // "At a glance" card; this block is for a document, a dated milestone or a quote.
  if (!proof.image && !proof.quote && !date) return null;

  return (
    <section
      id="evidence"
      aria-labelledby="case-evidence-title"
      data-component="CaseEvidence"
      className="my-8 scroll-mt-[calc(var(--site-header-h,var(--header-height,80px))+var(--section-nav-h,52px)+16px)]! rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]">{t("detail.case.evidenceEyebrow")}</p>
      <h2 id="case-evidence-title" className="!m-0 !text-2xl !font-semibold !tracking-tight !text-[#09263e]">
        {t("detail.case.evidenceTitle")}
      </h2>

      <div className={`mt-5 grid gap-6 ${proof.image ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" : ""}`}>
        {proof.image && (
          <figure className="m-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={proof.image}
              alt={proof.caption || t("detail.case.documentAlt")}
              loading="lazy"
              className="h-auto w-full rounded-xl border border-slate-200 bg-slate-50 object-contain"
            />
            {proof.caption && <figcaption className="mt-2 text-[13px] leading-snug text-slate-600">{proof.caption}</figcaption>}
          </figure>
        )}

        <div className="flex flex-col gap-5">
          {hasMilestone && (
            <div>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f5d57]">{t("detail.case.milestone")}</p>
              <p className="m-0 text-[17px] font-semibold leading-snug text-[#09263e]">{proof.milestoneLabel}</p>
              {date && (
                <p className="m-0 mt-0.5 text-[15px] text-slate-700">
                  <time dateTime={String(proof.milestoneDate).slice(0, 10)}>{date}</time>
                </p>
              )}
            </div>
          )}

          {proof.quote && (
            <blockquote className="m-0 border-l-4 border-[#1f5d57] pl-4">
              <p className="m-0 text-[17px] leading-relaxed text-[#09263e]">&ldquo;{proof.quote}&rdquo;</p>
              {proof.quoteBy && <footer className="mt-2 text-[13px] text-slate-600">{proof.quoteBy}</footer>}
            </blockquote>
          )}
        </div>
      </div>
    </section>
  );
}
