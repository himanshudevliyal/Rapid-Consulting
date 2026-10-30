import Image from "next/image";
import { ArrowUpRight, Factory, Handshake, Landmark, Layers, MapPin, Briefcase, IndianRupee, BadgeCheck } from "lucide-react";
import Link from "next/link";

import { ImagePlaceholder } from "@/components/ui/image-placeholder";

const DEFAULT_LABELS = {
  investment: "Investment",
  projectInvestment: "Project investment",
  expenditure: "Expenditure",
  approximately: "Approximately",
  location: "Location",
  sector: "Sector",
  industry: "Industry",
  scheme: "Scheme",
  service: "Service",
  sample: "Sample case",
  role: "Rapid’s role",
  noteInvestment: "Investment figure, not subsidy received.",
  noteExpenditure: "Recorded expenditure, not subsidy received.",
  image: "Placeholder - project photograph. Final photography to be supplied by Rapid.",
};

// Labels added with the Figma card (messages/_additions/b2c.*.json, `b2c.caseCard`).
// They are optional: until that file is merged the English defaults above are used.
const CARD_LABELS = ["industry", "scheme", "service", "sample"];

/** Labels from the home copy (`text` = homeText(t, has, locale)). */
export const caseCardLabels = (text) => {
  const labels = Object.fromEntries(
    Object.keys(DEFAULT_LABELS)
      .filter((key) => !CARD_LABELS.includes(key))
      .map((key) => [key, text(`homePage.cases.${key}`)]),
  );
  for (const key of CARD_LABELS) {
    const path = `b2c.caseCard.${key}`;
    const value = text(path);
    // homeText returns the key itself when nothing is defined for it.
    if (value && value !== path) labels[key] = value;
  }
  return labels;
};

// What the figure measures, read from the case's own wording. A figure is only
// ever called investment or expenditure - never a subsidy, turnover or saving.
const EXPENDITURE = /expenditure|expense|spend|spent|खर्च/i;
const INVESTED = /invest|निवेश/i;
const basisOf = (basis = "") => (EXPENDITURE.test(basis) ? "expenditure" : INVESTED.test(basis) ? "projectInvestment" : "investment");

const ROW_ICON = { scheme: Landmark, service: Briefcase, industry: Factory, sector: Layers, location: MapPin, role: Handshake };

/** Rupee-in-a-circle with a tick: the graphic on the figure panel. */
function FigureMark() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute right-4 top-3.5 inline-flex size-11 items-center justify-center rounded-full bg-white/60 text-[#1f5d57] ring-1 ring-[#1f5d57]/15 sm:right-5 sm:size-12"
    >
      <IndianRupee className="size-5 sm:size-6" strokeWidth={2.25} />
      <BadgeCheck className="absolute -bottom-1 -right-1 size-5 rounded-full bg-[#dcebe0] text-[#1f5d57]" strokeWidth={2} />
    </span>
  );
}

/**
 * The one client-success card, shared by Home, About, services, schemes,
 * industries and the archive. A green figure panel (tag, amount, what the
 * amount measures, a rupee mark), a white body with the title, an icon table
 * (Scheme / Service, Industry, Location ...) and the outline button. The whole
 * card is one link: the button carries the link and stretches over the card.
 *
 * rows: [{ key, term, value, href?, clamp? }]. A row with its own href is a
 * separate link that sits above the card link.
 */
export function CaseTile({ tag, qualifier, amount, caption, note, title, description, rows = [], cta, href, image, imageLabel, className = "" }) {
  const body = (
    <>
      {amount ? (
        <div className="relative shrink-0 overflow-hidden bg-[#dcebe0] px-5 py-5 text-[#09263e] sm:px-6">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1f5d57]">{tag}</span>
          <FigureMark />
          <p className="m-0! mt-3! flex flex-wrap items-baseline gap-x-2 text-[#09263e]">
            {qualifier && <span className="text-sm font-medium text-slate-700">{qualifier}</span>}
            <span className="text-[1.75rem] font-bold leading-tight tracking-tight sm:text-3xl">{amount}</span>
          </p>
          {caption && <p className="m-0! mt-1! text-sm font-medium leading-5 text-[#09263e]">{caption}</p>}
          {note && <p className="m-0! mt-1! text-xs leading-5 text-slate-700">{note}</p>}
        </div>
      ) : (
        <div className="relative aspect-[16/8] w-full shrink-0 overflow-hidden bg-[#dcebe0]">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              unoptimized={/^https?:\/\//i.test(image)}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
            />
          ) : (
            <ImagePlaceholder className="absolute inset-0 rounded-none border-0" label={imageLabel} />
          )}
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {!amount && tag && <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]">{tag}</span>}
        <h3 className={`mb-0! ${amount ? "mt-0!" : "mt-2!"} text-xl! font-semibold! leading-snug! tracking-tight! text-[#09263e]!`}>{title}</h3>

        {description && <p className="mb-0! mt-3! line-clamp-4 text-[15px] leading-6 text-slate-700">{description}</p>}

        {rows.length > 0 && (
          <dl className="m-0 mt-4 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-[#f7faf8] text-sm leading-5">
            {rows.map((row) => {
              const Icon = ROW_ICON[row.key] || Layers;
              return (
                <div key={`${row.key}-${row.term}`} className="flex items-start gap-2.5 px-3 py-2.5">
                  <dt className="flex w-[6.5rem] shrink-0 items-center gap-2 text-slate-600">
                    <Icon className="size-4 shrink-0 text-[#1f5d57]" aria-hidden="true" />
                    <span className="min-w-0 truncate">{row.term}</span>
                  </dt>
                  <dd className={`m-0 min-w-0 font-medium text-[#09263e] [overflow-wrap:anywhere] ${row.clamp ? "line-clamp-2" : ""}`}>
                    {row.href ? (
                      <Link href={row.href} className="relative z-10 text-[#09263e] underline decoration-[#1f5d57]/50 underline-offset-2 hover:decoration-[#09263e]">
                        {row.value}
                      </Link>
                    ) : (
                      row.value
                    )}
                  </dd>
                </div>
              );
            })}
          </dl>
        )}

        {cta && (
          <span className="mt-auto flex pt-5">
            {href ? (
              <Link
                href={href}
                data-case-card
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#09263e]/40 bg-white text-sm font-semibold text-[#09263e]! no-underline transition-colors after:absolute after:inset-0 after:content-[''] group-hover:bg-[#f2f6f4] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#09263e]/40"
              >
                {cta}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            ) : (
              <span className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#09263e]/25 bg-white text-sm font-semibold text-[#09263e]/70">
                {cta}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </span>
            )}
          </span>
        )}
      </div>
    </>
  );

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-[#09263e] shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${className}`}
    >
      {body}
    </article>
  );
}

/**
 * The case-study record -> CaseTile. Rows, in order: Scheme (or Service),
 * Industry, Sector, Location, Rapid's role; each only when the case has it.
 * The client's name is never shown. A draft / sample case says so where the
 * label sits.
 */
export function CaseCard({
  item,
  label = "Case Study",
  cta = "Read the case",
  // Qualifier ("Approximately"); kept for callers that pass it.
  amountLabel,
  labels: given,
}) {
  const labels = { ...DEFAULT_LABELS, ...given };
  const qualifier = amountLabel || labels.approximately;

  const metric = item.metric || "";
  const approximate = /^approximately\s+/i.test(metric) || /^(?:लगभग)\s+/.test(metric);
  const amount = metric.replace(/^(?:approximately|लगभग)\s+/i, "");
  const basisKind = basisOf(item.metricLabel);

  const industry = item.industryName || item.industry || item.sector;
  const sector = item.sector && item.sector !== industry ? item.sector : "";
  const scheme = item.schemeName
    ? { key: "scheme", term: labels.scheme, value: item.schemeName }
    : item.serviceName
      ? { key: "service", term: labels.service, value: item.serviceName }
      : null;

  const rows = [
    scheme,
    { key: "industry", term: labels.industry, value: industry },
    { key: "sector", term: labels.sector, value: sector },
    { key: "location", term: labels.location, value: item.location },
    { key: "role", term: labels.role, value: item.rapidRole, clamp: true },
  ].filter((row) => row && row.value && String(row.value).trim());

  return (
    <CaseTile
      tag={item.isDraft ? labels.sample : label}
      qualifier={approximate ? qualifier : ""}
      amount={amount}
      caption={item.metricLabel || labels[basisKind]}
      note={basisKind === "expenditure" ? labels.noteExpenditure : labels.noteInvestment}
      title={item.title}
      description={item.description}
      rows={rows}
      cta={cta}
      href={item.href}
      image={item.image}
      imageLabel={labels.image}
    />
  );
}
