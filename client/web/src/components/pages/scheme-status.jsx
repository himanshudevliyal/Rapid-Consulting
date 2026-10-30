import { cn } from "@/lib/utils";

// Scheme status, as the data records it (adapters.SCHEME_STATUSES):
// open | upcoming | closed | historical | unspecified. The label is always
// written out; colour only supports it. "unspecified" (nothing recorded) is
// shown as "Being checked" and never reads as an open programme. A status
// that is not in this list is treated as "unspecified".

export const SCHEME_STATUS_ORDER = ["open", "upcoming", "closed", "historical", "unspecified"];

const STYLE = {
  open: "border-[#14532d]/30 bg-[#e3f4e8] text-[#14532d]",
  upcoming: "border-[#1e3a8a]/30 bg-[#e6eefb] text-[#1e3a8a]",
  closed: "border-[#9a2f17]/40 bg-[#fde8e4] text-[#7f2410]",
  historical: "border-slate-400/60 bg-slate-200 text-slate-700",
  unspecified: "border-[#8a5a00]/35 bg-[#fff4d6] text-[#6b4500]",
};

export const knownStatus = (status) => (SCHEME_STATUS_ORDER.includes(status) ? status : "unspecified");

/** The visible name of a status. `t` is the translator with the root namespace, `tx` = b2dText(t). */
export const statusLabel = (status, t, tx) => {
  const key = knownStatus(status);
  return key === "unspecified" ? tx("schemes.status.unspecified", "Being checked") : t(`detail.scheme.status.${key}`);
};

export function StatusPill({ status, label, className }) {
  const key = knownStatus(status);
  return (
    <span
      data-scheme-status={key}
      className={cn(
        "inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-semibold leading-none",
        STYLE[key],
        className,
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

// The colours given, in order, to the legend cards of the page's own text
// (open, changed, existing claims only, being checked, discontinued).
const LEGEND_STYLES = ["open", "upcoming", "closed", "unspecified", "historical"];

/**
 * "Reading a status": one card per status the data can record. `items`
 * ([{ label, text }], from the page's own text) replaces the built-in cards.
 */
export function StatusLegend({ t, tx, titleId = "scheme-status-title", items }) {
  if (items?.length) {
    return (
      <ul aria-labelledby={titleId} className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {items.map((item, index) => (
          <li key={`${index}-${item.label}`} className="m-0 flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
            <StatusPill status={LEGEND_STYLES[index % LEGEND_STYLES.length]} label={item.label} />
            {item.text && <p className="m-0! text-sm leading-6 text-slate-700">{item.text}</p>}
          </li>
        ))}
      </ul>
    );
  }
  const text = {
    open: tx(
      "schemes.legend.open",
      "The scheme is recorded as open. Check its application window on the scheme page before you plan around it.",
    ),
    upcoming: tx(
      "schemes.legend.upcoming",
      "The scheme is recorded as upcoming and is not open yet. Check the official source for when it opens.",
    ),
    closed: t("detail.scheme.closedNote"),
    historical: t("detail.scheme.historicalNote"),
    unspecified: tx(
      "schemes.legend.unspecified",
      "We have not recorded the current status yet. Check the official source for current status.",
    ),
  };
  return (
    <ul aria-labelledby={titleId} className="m-0 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      {SCHEME_STATUS_ORDER.map((status) => (
        <li key={status} className="m-0 flex flex-col items-start gap-3 rounded-2xl border border-slate-200 bg-white p-5">
          <StatusPill status={status} label={statusLabel(status, t, tx)} />
          <p className="m-0! text-sm leading-6 text-slate-700">{text[status]}</p>
        </li>
      ))}
    </ul>
  );
}
