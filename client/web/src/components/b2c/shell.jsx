import { H1, H2 } from "./text";

// Layout pieces shared by the scheme, guide / article and case-study pages
// (server-safe, no hooks).

/** A small rounded label ("GUIDE", "LAND AND CLU"). */
export function Pill({ children, tone = "line" }) {
  return (
    <li
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase leading-none tracking-[0.12em] ${
        tone === "navy"
          ? "bg-[#09263e] text-[#eaff6b]"
          : "border border-[#09263e]/25 bg-white text-[#09263e]"
      }`}
    >
      {children}
    </li>
  );
}

/**
 * The sage band at the top of the page: eyebrow or pills, the page's one <h1>,
 * the sub, a meta line, a status chip and the buttons on the left; an optional
 * card (the "at a glance" box) on the right.
 */
export function Masthead({ eyebrow, pills, title, sub, meta, chip, actions, aside, titleId = "page-title" }) {
  return (
    <header className="b2c-band" data-component="Masthead">
      <div
        className={`mx-auto grid max-w-7xl gap-10 px-4 py-9 sm:px-6 md:py-12 lg:px-8 ${
          aside ? "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-14" : ""
        }`}
      >
        <div className="min-w-0">
          {eyebrow && <p className="wc2-eyebrow !m-0">{eyebrow}</p>}
          {pills && pills.length > 0 && (
            <ul className="m-0 flex list-none flex-wrap gap-2 p-0">{pills}</ul>
          )}
          <h1 id={titleId} className={`${H1} ${eyebrow || pills?.length ? "!mt-4" : ""} ${aside ? "!max-w-[26ch]" : "!max-w-[32ch]"}`}>
            {title}
          </h1>
          {sub && <div className="mt-5 max-w-[62ch] text-[17px] leading-8 text-slate-700">{sub}</div>}
          {meta && <p className="m-0 mt-4 text-sm font-medium leading-6 text-slate-700">{meta}</p>}
          {chip && <div className="mt-5">{chip}</div>}
          {actions && <div className="mt-7 flex flex-wrap items-center gap-3">{actions}</div>}
        </div>
        {aside && <div className="min-w-0">{aside}</div>}
      </div>
    </header>
  );
}

/** Body of the page: article on the left, sticky enquiry rail on the right. */
export function ContentLayout({ children, rail, label }) {
  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="b2c-layout py-10 md:py-14">
          <div className="b2c-main">{children}</div>
          {rail && (
            <aside className="b2c-rail" aria-label={label}>
              <div className="b2c-rail-sticky">{rail}</div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}

/** A body section: rust eyebrow, H2, then its content. */
export function SectionBlock({ id, eyebrow, title, children, className = "" }) {
  return (
    <section id={id} aria-labelledby={id && title ? `${id}-title` : undefined} className={`b2c-anchor mt-12 first:mt-0 ${className}`}>
      {eyebrow && <p className="wc2-eyebrow !m-0">{eyebrow}</p>}
      {title && (
        <h2 id={id ? `${id}-title` : undefined} className={`${H2} ${eyebrow ? "!mt-2" : ""} !mb-5`}>
          {title}
        </h2>
      )}
      {children}
    </section>
  );
}

/** Label / value rows inside a white card ("at a glance"). */
export function GlanceCard({ title, rows, footer, titleId, id, lead }) {
  const shown = rows.filter((row) => row && row.value);
  if (!shown.length && !footer) return null;
  return (
    <section
      id={id}
      aria-labelledby={titleId}
      data-component="GlanceCard"
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(9,38,62,0.55)] sm:p-7"
    >
      <h2 id={titleId} className="!m-0 !text-xl !font-semibold !leading-snug !tracking-[-0.01em] !text-[#09263e]">
        {title}
      </h2>
      {lead && <div className="mt-2 text-sm leading-6 text-slate-600">{lead}</div>}
      <dl className="m-0 mt-4">
        {shown.map((row) => (
          <div
            key={row.label}
            className="grid gap-1 border-t border-slate-200 py-3.5 first:border-t-0 sm:grid-cols-[minmax(0,9.5rem)_minmax(0,1fr)] sm:gap-4"
          >
            <dt className="text-[13px] font-semibold leading-6 text-slate-600">{row.label}</dt>
            <dd
              className={`m-0 min-w-0 text-[#09263e] [overflow-wrap:anywhere] ${
                row.big ? "text-2xl font-bold leading-tight tracking-tight" : row.bold ? "text-[15px] font-bold leading-6" : "text-[15px] leading-6"
              }`}
            >
              {row.value}
              {row.note && <span className="mt-1 block text-[13px] font-normal leading-5 text-slate-600">{row.note}</span>}
            </dd>
          </div>
        ))}
      </dl>
      {footer && <div className="mt-2 border-t border-slate-200 pt-4">{footer}</div>}
    </section>
  );
}
