import { formatDate } from "@/lib/format-date";
import { GlanceCard } from "@/components/b2c/shell";
import { b2cText } from "@/components/b2c/text";

// Look of each status. The label is always written out; colour only supports it.
export const STATUS_STYLE = {
  open: "border-[#14532d]/30 bg-[#e3f4e8] text-[#14532d]",
  upcoming: "border-[#1e3a8a]/30 bg-[#e6eefb] text-[#1e3a8a]",
  closed: "border-[#9a2f17]/40 bg-[#fde8e4] text-[#7f2410]",
  historical: "border-slate-400/60 bg-slate-200 text-slate-700",
  unspecified: "border-[#9a6a12]/35 bg-[#fff5df] text-[#664d1c]",
};

// "Agriculture Infrastructure Fund (AIF)" -> "AIF"; otherwise the full title.
export const shortSchemeName = (title = "") => title.match(/\(([^()]{2,14})\)\s*$/)?.[1]?.trim() || title;

/**
 * The status as a chip. A scheme whose status is not recorded never reads as an
 * open programme: it says the status is being checked.
 */
export function StatusChip({ page, t, className = "" }) {
  const tx = b2cText(t);
  const status = page.facts?.status;
  const known = status && status !== "unspecified" && STATUS_STYLE[status];
  const style = known ? STATUS_STYLE[status] : STATUS_STYLE.unspecified;
  return (
    <p
      data-scheme-status={known ? status : "unspecified"}
      className={`!m-0 inline-flex max-w-full items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-semibold leading-snug ${style} ${className}`}
    >
      <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-current" />
      {known ? t(`detail.scheme.status.${status}`) : tx("scheme.statusChecking", "Current status being checked")}
    </p>
  );
}

// Quick assessment for a scheme page, as the "<scheme> at a glance" card: what
// it pays, what it covers, who administers it - and, separately, where it
// stands in time. Policy period, application window and review date are three
// different things and are never merged. Rows the record does not have are left
// out (no placeholder rows), and a scheme whose status is not recorded shows
// "being checked", never an open badge.
export function SchemeFacts({ page, t }) {
  const facts = page.facts;
  if (!facts) return null;
  const tx = b2cText(t);

  const status = facts.status;
  const known = status && status !== "unspecified" && STATUS_STYLE[status];
  const official = page.sourceUrls?.[0];
  const reviewedOn = page.reviewer && page.reviewedAt ? formatDate(page.reviewedAt, page.locale) : "";
  const name = shortSchemeName(page.title);

  const statusNote = known
    ? status === "closed" || status === "historical"
      ? t(`detail.scheme.${status}Note`)
      : undefined
    : t("detail.scheme.statusUnspecified");

  // Rows written in the admin panel (label + text, in order) win over the fixed facts.
  const written = (facts.rows ?? [])
    .map((row) => {
      // "Official source" with no text links to the scheme's official address.
      const isSource = /official\s+source/i.test(row.label);
      if (!row.value && isSource && official) {
        return {
          label: row.label,
          value: (
            <a href={official} target="_blank" rel="noreferrer" className="font-semibold text-[#9a3412] underline underline-offset-4">
              {t("detail.scheme.officialSource")} <span aria-hidden="true">↗</span>
            </a>
          ),
        };
      }
      return row.value ? { label: row.label, value: row.value, big: row.bold && row.value.length <= 24, bold: row.bold } : null;
    })
    .filter(Boolean);

  const rows = written.length ? written : [
    { label: tx("scheme.pays", "What it pays"), value: facts.assistanceType, bold: true },
    { label: tx("scheme.covers", "What it covers"), value: facts.activity },
    { label: t("detail.scheme.authority"), value: facts.authority },
    { label: t("detail.scheme.policyPeriod"), value: facts.policyPeriod },
    { label: t("detail.scheme.applicationWindow"), value: facts.applicationWindow },
    {
      label: tx("scheme.statusRow", "Status"),
      value: known ? t(`detail.scheme.status.${status}`) : tx("scheme.statusChecking", "Current status being checked"),
      bold: true,
      note: statusNote,
    },
    { label: t("detail.scheme.reviewedOn"), value: reviewedOn },
  ];

  const footer = official && !written.length ? (
    <p className="m-0 text-sm leading-6 text-slate-700">
      <a
        href={official}
        target="_blank"
        rel="noreferrer"
        className="font-semibold text-[#09263e] underline underline-offset-4"
      >
        {t("detail.scheme.officialSource")} <span aria-hidden="true">↗</span>
      </a>
      {reviewedOn && <span className="text-slate-600"> · {tx("scheme.checkedOn", "checked {date}", { date: reviewedOn })}</span>}
    </p>
  ) : null;

  return (
    <GlanceCard
      id="scheme-facts"
      titleId="scheme-facts-title"
      title={tx("scheme.glanceTitle", "{name} at a glance", { name })}
      rows={rows}
      footer={footer}
    />
  );
}
