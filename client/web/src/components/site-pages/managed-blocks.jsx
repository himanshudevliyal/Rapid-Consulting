import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { Html } from "@/components/common/html";
import { cn } from "@/lib/utils";
import { asArray, asText, hasHtml, imageUrl, localizeHref, safeHref } from "@/lib/content/site-page-adapters";
import { Carousel } from "@/components/home/carousel";
import { CaseTile } from "@/components/case-card";
import { OfficeMap } from "@/components/ui/office-map";
import { BandHead, LINK_BUTTON } from "./band";
import { BlockShell, H1_CLASS, H3, Plain, SmartLink } from "./shared";

// Generic renderers for the blocks of the Managed pages (page_hero, stats_strip,
// data_table, feature_cards, team_cards, case_cards, faq_accordion, banner,
// directory, tabs_panel, info_panel). The website's own views (About, Contact,
// Resources ...) draw these pages themselves from the same fields; these
// components make the editor preview, and any other page that uses the blocks,
// show the text. Server-safe: no hooks, carousels are scroll rows, accordions
// are <details>, tabs are shown one after the other.
//
// Empty text hides its element; nothing is invented.

const items = (value) => asArray(value).filter((item) => item && typeof item === "object");
const texts = (value) => items(value).map((item) => asText(item.text)).filter(Boolean);
const OUTLINE_BUTTON =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#09263e] bg-white px-6 py-2.5 text-sm font-semibold !text-[#09263e] no-underline transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2";
const LIGHT_BUTTON =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold !text-[#09263e] no-underline transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2";
const CHIP = "inline-flex items-center rounded-full border border-slate-300 bg-white px-3.5 py-1.5 text-sm font-medium text-[#09263e]";
const PILL = "inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700";
const CARD = "rounded-2xl border border-slate-200 bg-white p-5";

// A button: a link when it has an address, otherwise it opens the enquiry form.
function Cta({ label, href, ctx, className = LINK_BUTTON, source }) {
  const text = asText(label);
  if (!text) return null;
  const arrow = <span aria-hidden="true">→</span>;
  if (asText(href)) {
    return (
      <SmartLink href={href} locale={ctx.locale} className={className}>
        {text}
        {arrow}
      </SmartLink>
    );
  }
  return (
    <EnquiryTrigger className={className} source={source || "managed-page"} pageTitle={ctx.page.h1}>
      {text}
      {arrow}
    </EnquiryTrigger>
  );
}

function Eyebrow({ children, className }) {
  if (!children) return null;
  return <p className={cn("wc2-eyebrow !m-0", className)}>{children}</p>;
}

// ── page_hero ──

const formFieldList = (data) =>
  [
    [data.name_label, data.name_placeholder, true],
    [data.phone_label, data.phone_placeholder, true],
    [data.select_label, data.select_placeholder, true],
    [data.district_label, data.district_placeholder, false],
    [data.location_label, data.location_placeholder, false],
    [data.activity_label, data.activity_placeholder, false],
  ]
    .map(([label, placeholder, required]) => ({ label: asText(label), placeholder: asText(placeholder), required }))
    .filter((field) => field.label);

function HeroCard({ data, ctx, id }) {
  const kind = asText(data.card_kind);
  if (!kind || kind === "none") return null;
  const rows = items(data.card_rows)
    .map((row) => ({ label: asText(row.label), text: asText(row.text), href: asText(row.href) }))
    .filter((row) => row.label || row.text);
  const title = asText(data.card_title);
  const text = asText(data.card_text);
  const eyebrow = asText(data.card_eyebrow);
  const chips = items(data.chips).map((chip) => asText(chip.label)).filter(Boolean);

  return (
    <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(9,38,62,0.55)] sm:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow className="!text-[#b4501f]">{eyebrow}</Eyebrow>
          {title && (
            <h2 id={id} className="!m-0 !text-xl !font-semibold !leading-snug !text-[#09263e]">
              {title}
            </h2>
          )}
          {text && <Plain className="mt-1 !text-sm">{text}</Plain>}
        </div>
        {kind === "form" && asText(data.badge_text) && (
          <span className="shrink-0 rounded-md bg-[#b4301f] px-2.5 py-1 text-center text-[10px] font-bold uppercase leading-tight tracking-wide text-white">
            {asText(data.badge_text)
              .split("/")
              .map((part, index) => (
                <span key={index} className="block">
                  {part.trim()}
                </span>
              ))}
          </span>
        )}
      </div>

      {kind === "rows" && rows.length > 0 && (
        <dl className="m-0 mt-4 grid gap-0 divide-y divide-slate-200">
          {rows.map((row, index) => (
            <div key={index} className="grid gap-1 py-2.5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-4">
              <dt className="text-sm font-semibold text-[#09263e]">{row.label}</dt>
              <dd className="m-0 text-sm text-slate-600">{row.text}</dd>
            </div>
          ))}
        </dl>
      )}

      {kind === "search" && (
        <div className="mt-4">
          {asText(data.search_label) && (
            <label className="mb-1 block text-sm font-semibold text-[#09263e]">{asText(data.search_label)}</label>
          )}
          <div className="flex gap-2">
            <input
              readOnly
              tabIndex={-1}
              placeholder={asText(data.search_placeholder)}
              className="h-12 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm"
            />
            {asText(data.search_button) && <span className={cn(LINK_BUTTON, "!min-h-12")}>{asText(data.search_button)}</span>}
          </div>
          {asText(data.popular_label) && (chips.length > 0 || rows.length > 0) && (
            <p className="!m-0 !mt-4 !text-sm !font-semibold !text-slate-600">{asText(data.popular_label)}</p>
          )}
          {chips.length > 0 && (
            <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
              {chips.map((chip) => (
                <li key={chip} className={CHIP}>
                  {chip}
                </li>
              ))}
            </ul>
          )}
          {rows.length > 0 && (
            <ul className="m-0 mt-2 grid list-none gap-1 p-0">
              {rows.map((row, index) => (
                <li key={index} className="flex items-center justify-between gap-3 border-b border-slate-200 py-2 text-sm text-[#09263e]">
                  <span>{row.label}</span>
                  <span aria-hidden="true">↗</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {kind === "form" && (
        <div className="mt-4 grid gap-3">
          {items(data.form_tabs).length > 0 && (
            <div className="flex gap-1 rounded-full bg-slate-100 p-1 text-sm font-semibold">
              {items(data.form_tabs).map((tab, index) => (
                <span key={index} className={cn("flex-1 rounded-full px-3 py-2 text-center", index === 0 ? "bg-[#09263e] text-white" : "text-slate-600")}>
                  {asText(tab.label)}
                </span>
              ))}
            </div>
          )}
          {formFieldList(data).map((field) => (
            <label key={field.label} className="block text-sm font-semibold text-[#09263e]">
              {field.label}
              <span className="ml-2 text-xs font-normal text-slate-500">
                {field.required ? asText(data.required_label) : asText(data.optional_label)}
              </span>
              <input
                readOnly
                tabIndex={-1}
                placeholder={field.placeholder}
                className="mt-1 block h-11 w-full rounded-xl border border-slate-300 px-3 text-sm font-normal"
              />
            </label>
          ))}
          {asText(data.consent_label) && (
            <p className="!m-0 !text-sm !text-slate-600">
              <span aria-hidden="true">☐ </span>
              {asText(data.consent_label)}
            </p>
          )}
          {(asText(data.submit_label) || asText(items(data.form_tabs)[0]?.submit_label)) && (
            <EnquiryTrigger className={cn(LINK_BUTTON, "w-full")} source="managed-page-hero" pageTitle={ctx.page.h1}>
              {asText(data.submit_label) || asText(items(data.form_tabs)[0]?.submit_label)}
            </EnquiryTrigger>
          )}
          {asText(data.form_error) && <p className="!m-0 !text-xs !text-red-700">{asText(data.form_error)}</p>}
          {asText(data.helper) && <p className="!m-0 !text-center !text-sm !text-slate-600">{asText(data.helper)}</p>}
          {asText(data.whatsapp_label) && (
            <SmartLink href={asText(data.secondary_href) || ctx.whatsappHref || ""} locale={ctx.locale} className={OUTLINE_BUTTON}>
              {asText(data.whatsapp_label)}
            </SmartLink>
          )}
        </div>
      )}
    </div>
  );
}

export const pageHeroEmpty = (data) => !asText(data.heading);

export function PageHeroBlock({ section, ctx }) {
  const data = section.data;
  const titleId = `${section.anchor}-title`;
  const cardId = `${section.anchor}-card`;
  const hasCard = asText(data.card_kind) && asText(data.card_kind) !== "none";
  const bullets = items(data.bullets).filter((bullet) => asText(bullet.title));
  const links = items(data.links).filter((link) => asText(link.label));
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} className="bg-[#eef3f0] !pb-10 !pt-8 md:!pb-14 md:!pt-12">
      <div className={cn("grid items-start gap-10", hasCard && "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14")}>
        <div className="min-w-0">
          <Eyebrow>{asText(data.eyebrow)}</Eyebrow>
          <h1 id={titleId} className={cn(H1_CLASS, "!max-w-[24ch] !text-[clamp(32px,3.6vw,46px)]", data.eyebrow && "!mt-3")}>
            {asText(data.heading)}
          </h1>
          {asText(data.intro) && <Plain className="mt-5 max-w-[56ch] !text-[17px] !leading-8 !text-slate-700">{asText(data.intro)}</Plain>}
          {bullets.length > 0 && (
            <ul className="m-0 mt-6 grid list-none gap-3 p-0">
              {bullets.map((bullet, index) => (
                <li key={index}>
                  <p className="!m-0 !text-base !font-semibold !text-[#09263e]">{asText(bullet.title)}</p>
                  {asText(bullet.text) && <p className="!m-0 !text-sm !text-slate-600">{asText(bullet.text)}</p>}
                </li>
              ))}
            </ul>
          )}
          {links.length > 0 && (
            <ul className="m-0 mt-5 grid list-none gap-1 p-0">
              {links.map((link, index) => (
                <li key={index}>
                  <SmartLink href={asText(link.href)} locale={ctx.locale} className="text-sm font-semibold text-[#b4501f] underline">
                    {asText(link.label)}
                  </SmartLink>
                </li>
              ))}
            </ul>
          )}
          {asText(data.plain_text) && <p className="!m-0 !mt-1 !text-sm !text-slate-700">{asText(data.plain_text)}</p>}
          {(asText(data.primary_label) || (asText(data.secondary_label) && asText(data.card_kind) !== "form") || asText(data.secondary_label)) && (
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Cta label={data.primary_label} href={data.primary_href} ctx={ctx} source="managed-page-hero" />
              {asText(data.secondary_label) && (
                <SmartLink href={asText(data.secondary_href)} locale={ctx.locale} className={OUTLINE_BUTTON}>
                  {asText(data.secondary_label)}
                </SmartLink>
              )}
            </div>
          )}
          {asText(data.footnote) && <p className="!m-0 !mt-4 max-w-[56ch] !text-xs !text-slate-600">{asText(data.footnote)}</p>}
        </div>
        {hasCard && <HeroCard data={data} ctx={ctx} id={cardId} />}
      </div>
    </BlockShell>
  );
}

// ── stats_strip ──

export const statsStripEmpty = (data) => items(data.items).length === 0 && !asText(data.heading);

export function StatsStripBlock({ section, ctx }) {
  const data = section.data;
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <div className="grid overflow-hidden rounded-2xl lg:grid-cols-[3fr_2fr]">
        <div className="bg-[#e9eff4] p-6 sm:p-8">
          {heading && (
            <h2 id={titleId} className="!m-0 !text-xl !font-semibold !text-[#09263e]">
              {heading}
            </h2>
          )}
          <ul className="m-0 mt-5 grid list-none gap-4 p-0 sm:grid-cols-3">
            {items(data.items).map((item, index) => (
              <li key={index}>
                <span className="block text-3xl font-bold text-[#09263e]">{asText(item.value) || "—"}</span>
                <span className="block text-sm text-slate-600">{asText(item.label)}</span>
              </li>
            ))}
          </ul>
        </div>
        {(asText(data.panel_value) || asText(data.panel_label)) && (
          <div className="bg-[#dcebe0] p-6 sm:p-8">
            <span className="block text-3xl font-bold text-[#09263e]">{asText(data.panel_value) || "—"}</span>
            <span className="block text-sm text-slate-700">{asText(data.panel_label)}</span>
          </div>
        )}
      </div>
    </BlockShell>
  );
}

// ── data_table ──

const tableRows = (data) =>
  items(data.rows)
    .map((row) => ({
      one: asText(row.cell_1),
      two: asText(row.cell_2),
      three: asText(row.cell_3),
      href: asText(row.link_href),
    }))
    .filter((row) => row.one || row.two || row.three);

export const dataTableEmpty = (data) => tableRows(data).length === 0;

export function DataTableBlock({ section, ctx }) {
  const data = section.data;
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  const columns = texts(data.columns);
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} intro={asText(data.intro)} />
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          {columns.length > 0 && (
            <thead className="bg-[#e9eff4]">
              <tr>
                {columns.map((column) => (
                  <th key={column} scope="col" className="px-4 py-3 font-semibold text-[#09263e]">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody>
            {tableRows(data).map((row, index) => (
              <tr key={index} className="border-t border-slate-200 align-top">
                <th scope="row" className="px-4 py-3 font-semibold text-[#09263e]">
                  {row.one}
                </th>
                <td className="px-4 py-3 text-slate-700">{row.two}</td>
                <td className="px-4 py-3 text-slate-700">
                  {row.href ? (
                    <SmartLink href={row.href} locale={ctx.locale} className="font-semibold text-[#b4501f] underline">
                      {row.three} ↗
                    </SmartLink>
                  ) : (
                    row.three
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {asText(data.closing_text) && <Plain className="mt-5 !font-semibold !text-[#09263e]">{asText(data.closing_text)}</Plain>}
      <div className="mt-5">
        <Cta label={data.cta_label} href={data.cta_href} ctx={ctx} />
      </div>
    </BlockShell>
  );
}

// ── feature_cards ──

const featureItems = (data) =>
  items(data.items)
    .map((item) => ({
      tag: asText(item.tag),
      kicker: asText(item.kicker),
      title: asText(item.title),
      text: asText(item.text),
      meta: asText(item.meta),
      note: asText(item.note),
      href: asText(item.href),
      cta: asText(item.cta_label),
    }))
    .filter((item) => item.title || item.text);

export const featureCardsEmpty = (data) => featureItems(data).length === 0;

export function FeatureCardsBlock({ section, ctx }) {
  const data = section.data;
  const list = featureItems(data);
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  const filters = texts(data.filters);
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} intro={asText(data.intro)} />
      {filters.length > 0 && (
        <ul className="m-0 mt-5 flex list-none flex-wrap items-center gap-2 p-0">
          {asText(data.filter_label) && <li className="text-sm font-semibold text-slate-600">{asText(data.filter_label)}</li>}
          {filters.map((filter) => (
            <li key={filter} className={CHIP}>
              {filter}
            </li>
          ))}
        </ul>
      )}
      <ul
        className={cn(
          "m-0 mt-6 list-none p-0",
          section.variant === "carousel" ? "r3-scroll-row" : "grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {list.map((item, index) => (
          <li key={index} className={cn(CARD, "flex flex-col")}>
            {(item.tag || item.kicker) && (
              <p className="!m-0 flex flex-wrap items-center gap-2">
                {item.tag && <span className={PILL}>{item.tag}</span>}
                {item.kicker && <span className="text-xs font-bold uppercase tracking-wider text-[#b4301f]">{item.kicker}</span>}
              </p>
            )}
            {item.title && <H3 className={item.tag || item.kicker ? "mt-3" : undefined}>{item.title}</H3>}
            {item.text && <Plain className="mt-2 !text-sm">{item.text}</Plain>}
            {item.meta && <p className="!m-0 !mt-2 !text-xs !text-slate-500">{item.meta}</p>}
            {item.note && <p className="!m-0 !mt-1 !text-xs !text-slate-500">{item.note}</p>}
            {item.cta && (
              <p className="!m-0 !mt-4">
                {item.href ? (
                  <SmartLink href={item.href} locale={ctx.locale} className="text-sm font-semibold text-[#09263e] underline">
                    {item.cta} ↗
                  </SmartLink>
                ) : (
                  <span className="text-sm font-semibold text-slate-400">{item.cta} ↗</span>
                )}
              </p>
            )}
          </li>
        ))}
      </ul>
      {asText(data.footer_text) && <Plain className="mt-5">{asText(data.footer_text)}</Plain>}
      {asText(data.cta_label) && (
        <div className="mt-6">
          <Cta label={data.cta_label} href={data.cta_href} ctx={ctx} />
        </div>
      )}
    </BlockShell>
  );
}

// ── team_cards ──

const teamItems = (data) =>
  items(data.items)
    .map((item) => ({
      initials: asText(item.initials),
      caption: asText(item.caption),
      tag: asText(item.tag),
      name: asText(item.name),
      role: asText(item.role),
      detail: asText(item.detail),
      href: asText(item.href),
      linkLabel: asText(item.link_label),
    }))
    .filter((item) => item.name || item.role || item.tag || item.caption);

export const teamCardsEmpty = (data) => teamItems(data).length === 0;

export function TeamCardsBlock({ section, ctx }) {
  const data = section.data;
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} intro={asText(data.intro)} />
      <ul className="m-0 mt-6 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {teamItems(data).map((item, index) => (
          <li key={index} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex aspect-[4/3] flex-col items-center justify-center bg-slate-200 text-slate-600">
              <span className="text-2xl font-bold">{item.initials || "—"}</span>
              {item.caption && <span className="text-xs">{item.caption}</span>}
            </div>
            <div className="p-4">
              {item.tag && <p className="!m-0 text-xs font-bold uppercase tracking-wider text-[#1f5d57]">{item.tag}</p>}
              {item.name && <H3 className="mt-1">{item.name}</H3>}
              {item.role && <p className="!m-0 !text-sm !text-slate-700">{item.role}</p>}
              {item.detail && <p className="!m-0 !text-xs !text-slate-500">{item.detail}</p>}
              {item.linkLabel && item.href && (
                <SmartLink href={item.href} locale={ctx.locale} className="mt-2 inline-block text-sm font-semibold text-[#b4501f] underline">
                  {item.linkLabel} ↗
                </SmartLink>
              )}
            </div>
          </li>
        ))}
      </ul>
      {asText(data.footer_text) && <Plain className="mt-5">{asText(data.footer_text)}</Plain>}
      {asText(data.cta_label) && (
        <div className="mt-6">
          <Cta label={data.cta_label} href={data.cta_href} ctx={ctx} />
        </div>
      )}
    </BlockShell>
  );
}

// ── case_cards ──

const caseItems = (data) =>
  items(data.items)
    .map((item) => ({
      panel: asText(item.panel_label),
      amount: asText(item.amount),
      caption: asText(item.caption),
      status: asText(item.status),
      dateLabel: asText(item.date_label),
      dateValue: asText(item.date_value),
      title: asText(item.title),
      rows: items(item.rows)
        .map((row) => ({ label: asText(row.label), value: asText(row.value), href: asText(row.href) }))
        .filter((row) => row.label || row.value),
      cta: asText(item.cta_label),
      href: asText(item.href),
    }))
    .filter((item) => item.title || item.amount);

const rowKey = (label = "") => {
  const l = label.toLowerCase();
  if (/scheme|योजना/.test(l)) return "scheme";
  if (/industr|उद्योग/.test(l)) return "industry";
  if (/sector|क्षेत्र/.test(l)) return "sector";
  if (/locat|स्थान/.test(l)) return "location";
  if (/role|भूमिका/.test(l)) return "role";
  return "service";
};
const localHref = (href, locale) => {
  const clean = safeHref(href);
  return clean ? localizeHref(clean, locale) : "";
};

export const caseCardsEmpty = (data) => caseItems(data).length === 0;

export function CaseCardsBlock({ section, ctx }) {
  const data = section.data;
  const list = caseItems(data);
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  const filters = texts(data.filters);
  const count = asText(data.count_template)
    .replace("{shown}", String(list.length))
    .replace("{total}", String(list.length));
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      {filters.length > 0 && (
        <ul className="m-0 mt-5 flex list-none flex-wrap items-center gap-2 p-0">
          {asText(data.filter_label) && <li className="text-sm font-semibold text-slate-600">{asText(data.filter_label)}</li>}
          {[asText(data.all_label), ...filters].filter(Boolean).map((filter) => (
            <li key={filter} className={CHIP}>
              {filter}
            </li>
          ))}
        </ul>
      )}
      {count && filters.length > 0 && <p className="!m-0 !mt-3 !text-sm !text-slate-600">{count}</p>}
      <Carousel
        label={section.label || heading || "Case studies"}
        previous={asText(data.previous_label) || "Previous"}
        next={asText(data.next_label) || "Next"}
        lead={<BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} intro={asText(data.intro)} />}
      >
        {list.map((item, index) => (
          <CaseTile
            key={index}
            tag={item.panel}
            amount={item.amount}
            caption={[item.caption, item.status].filter(Boolean).join(" · ")}
            note={item.dateValue ? `${item.dateLabel} ${item.dateValue}`.trim() : ""}
            title={item.title}
            rows={item.rows.map((row) => ({ key: rowKey(row.label), term: row.label, value: row.value, href: localHref(row.href, ctx.locale) }))}
            cta={item.cta}
            href={localHref(item.href, ctx.locale)}
          />
        ))}
      </Carousel>
      {asText(data.footnote) && <Plain className="mt-5 !text-sm">{asText(data.footnote)}</Plain>}
      {asText(data.cta_label) && (
        <div className="mt-6">
          <Cta label={data.cta_label} href={data.cta_href} ctx={ctx} />
        </div>
      )}
    </BlockShell>
  );
}

// ── faq_accordion ──

const faqRows = (data) =>
  items(data.items)
    .map((item) => ({ question: asText(item.question), answerHtml: asText(item.answer_html) }))
    .filter((item) => item.question);

export const faqAccordionEmpty = (data) => faqRows(data).length === 0;

// FAQPage structured data: only the questions that have an answer.
export const faqAccordionEntries = (data) => faqRows(data).filter((item) => hasHtml(item.answerHtml));

export function FaqAccordionBlock({ section, ctx }) {
  const data = section.data;
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
        <div>
          <BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} intro={asText(data.intro)} />
          {asText(data.cta_label) && (
            <div className="mt-6">
              <Cta label={data.cta_label} href={data.cta_href} ctx={ctx} />
            </div>
          )}
        </div>
        <div className="grid gap-2">
          {faqRows(data).map((row, index) => (
            <details key={index} className="r3-accordion rounded-xl border border-slate-200 bg-white" open={index === 0 && hasHtml(row.answerHtml)}>
              <summary className="flex items-center justify-between gap-3 px-4 py-3.5 text-base font-semibold text-[#09263e]">
                {row.question}
                <span aria-hidden="true">+</span>
              </summary>
              {hasHtml(row.answerHtml) && <Html html={row.answerHtml} className="px-4 pb-4 text-[15px] leading-7 text-slate-700" />}
            </details>
          ))}
        </div>
      </div>
    </BlockShell>
  );
}

// ── banner ──

export const bannerEmpty = (data) => !asText(data.heading) && !asText(data.text);

export function BannerBlock({ section, ctx }) {
  const data = section.data;
  const navy = asText(data.tone) !== "light";
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  const image = imageUrl(data.image);
  return (
    <section
      id={section.anchor}
      data-block={section.type}
      aria-labelledby={titleId}
      className={cn("py-12 md:py-14", navy ? "r3-contour r3-contour--navy bg-[#09263e] text-white" : "bg-[#eef3f0]")}
    >
      <div className="container mx-auto grid max-w-7xl items-center gap-8 px-4 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} navy={navy} />
          {asText(data.subheading) && (
            <p className={cn("!m-0 !mt-4 !text-lg !font-semibold", navy ? "!text-white" : "!text-[#09263e]")}>{asText(data.subheading)}</p>
          )}
          {asText(data.text) && <Plain className={cn("mt-3 max-w-[64ch] !text-base", navy && "!text-white/85")}>{asText(data.text)}</Plain>}
          <div className="mt-6 flex flex-wrap gap-3">
            <Cta label={data.primary_label} href={data.primary_href} ctx={ctx} />
            {asText(data.secondary_label) && (
              <Cta label={data.secondary_label} href={data.secondary_href} ctx={ctx} className={navy ? LIGHT_BUTTON : OUTLINE_BUTTON} />
            )}
          </div>
        </div>
        {image ? (
          <img src={image} alt={asText(data.image_alt)} className="max-h-72 w-full rounded-2xl object-cover lg:w-[380px]" />
        ) : (
          asText(data.photo_note) && (
            <div
              role="img"
              aria-label={asText(data.photo_note)}
              className={cn(
                "flex aspect-[16/10] w-full items-end rounded-2xl border border-dashed p-4 lg:w-[380px]",
                navy ? "border-white/40 bg-white/5" : "border-slate-400 bg-white/60",
              )}
            >
              <span className={cn("text-xs leading-5", navy ? "text-white/70" : "text-slate-600")}>{asText(data.photo_note)}</span>
            </div>
          )
        )}
      </div>
    </section>
  );
}

// ── directory ──

const directoryRows = (data) =>
  items(data.items)
    .map((item) => ({
      title: asText(item.title),
      tag: asText(item.tag),
      topic: asText(item.topic),
      meta: asText(item.meta),
      extra: asText(item.extra),
      pill: asText(item.pill),
      href: asText(item.href),
    }))
    .filter((item) => item.title);

export const directoryEmpty = (data) =>
  directoryRows(data).length === 0 && !asText(data.heading) && items(data.groups).length === 0;

export function DirectoryBlock({ section, ctx }) {
  const data = section.data;
  const rows = directoryRows(data);
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  const count = asText(data.count_template)
    .replace("{shown}", String(rows.length))
    .replace("{total}", String(rows.length));
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} intro={asText(data.intro)} />
      {asText(data.search_label) && (
        <div className="mt-5 flex max-w-xl gap-2">
          <input readOnly tabIndex={-1} aria-label={asText(data.search_label)} placeholder={asText(data.search_placeholder)} className="h-12 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm" />
          {asText(data.search_button) && <span className={LINK_BUTTON}>{asText(data.search_button)}</span>}
        </div>
      )}
      {items(data.groups).map((group, index) => (
        <ul key={index} className="m-0 mt-4 flex list-none flex-wrap items-center gap-2 p-0">
          {asText(group.label) && <li className="text-sm font-semibold text-slate-600">{asText(group.label)}</li>}
          {[asText(data.all_label), ...texts(group.chips)].filter(Boolean).map((chip) => (
            <li key={chip} className={CHIP}>
              {chip}
            </li>
          ))}
        </ul>
      ))}
      {count && rows.length > 0 && <p className="!m-0 !mt-4 !text-sm !text-slate-600">{count}</p>}
      {rows.length > 0 && (
        <ul className="m-0 mt-4 grid list-none gap-3 p-0 md:grid-cols-2">
          {rows.map((row, index) => (
            <li key={index} className={cn(CARD, "flex items-start justify-between gap-3")}>
              <div className="min-w-0">
                <p className="!m-0 !text-base !font-semibold !text-[#09263e]">
                  {row.href ? (
                    <SmartLink href={row.href} locale={ctx.locale} className="underline">
                      {row.title}
                    </SmartLink>
                  ) : (
                    row.title
                  )}
                </p>
                {(row.tag || row.topic) && (
                  <p className="!m-0 !mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    {row.tag && <span className={PILL}>{row.tag}</span>}
                    {row.topic}
                  </p>
                )}
                {row.meta && <p className="!m-0 !mt-1 !text-xs !text-slate-500">{row.meta}</p>}
                {row.extra && <p className="!m-0 !mt-1 !text-xs !text-slate-500">{row.extra}</p>}
              </div>
              {row.pill && <span className={PILL}>{row.pill}</span>}
            </li>
          ))}
        </ul>
      )}
      {asText(data.cta_label) && (
        <div className="mt-6">
          <Cta label={data.cta_label} href={data.cta_href} ctx={ctx} />
        </div>
      )}
    </BlockShell>
  );
}

// ── tabs_panel ──

const tabList = (data) => items(data.tabs).filter((tab) => asText(tab.label));

export const tabsPanelEmpty = (data) => tabList(data).length === 0 && !asText(data.heading);

export function TabsPanelBlock({ section, ctx }) {
  const data = section.data;
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  const tabs = tabList(data);
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} intro={asText(data.intro)} />
      <div className="mt-6 grid gap-5">
        {tabs.map((tab, index) => {
          const cards = items(tab.cards).filter((card) => asText(card.title));
          const chips = texts(tab.chips);
          const hasBody = asText(tab.title) || asText(tab.text) || cards.length || chips.length || asText(tab.note_text) || asText(tab.callout);
          return (
            <article key={index} className={cn(CARD, "grid gap-3")}>
              <h3 className="!m-0 !text-base !font-semibold !text-[#09263e]">{asText(tab.label)}</h3>
              {hasBody && (
                <div className="grid gap-3 border-t border-slate-200 pt-3">
                  {asText(tab.title) && <p className="!m-0 !text-lg !font-semibold !text-[#09263e]">{asText(tab.title)}</p>}
                  {asText(tab.text) && <Plain>{asText(tab.text)}</Plain>}
                  {chips.length > 0 && (
                    <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                      {chips.map((chip) => (
                        <li key={chip} className={CHIP}>
                          {chip}
                        </li>
                      ))}
                    </ul>
                  )}
                  {asText(tab.note_text) && (
                    <div className="border-l-4 border-[#09263e] pl-3">
                      {asText(tab.note_label) && <p className="!m-0 !text-sm !font-semibold !text-[#09263e]">{asText(tab.note_label)}</p>}
                      <Plain className="!text-sm">{asText(tab.note_text)}</Plain>
                    </div>
                  )}
                  {asText(tab.callout) && <p className="!m-0 rounded-full bg-rose-50 px-4 py-2 !text-sm !text-rose-900">{asText(tab.callout)}</p>}
                  {cards.length > 0 && (
                    <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
                      {cards.map((card, cardIndex) => (
                        <li key={cardIndex} className="rounded-xl bg-[#e9eff4] p-4">
                          <p className="!m-0 !text-sm !font-semibold !text-[#09263e]">{asText(card.title)}</p>
                          {asText(card.text) && <p className="!m-0 !text-xs !text-slate-600">{asText(card.text)}</p>}
                          {asText(card.hint) && <p className="!m-0 !text-xs !text-slate-600">{asText(card.hint)}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div>
                    <Cta label={tab.cta_label} href={tab.cta_href} ctx={ctx} />
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
      {asText(data.footer_text) && <p className="!m-0 !mt-6 !text-base !font-semibold !text-[#09263e]">{asText(data.footer_text)}</p>}
      {asText(data.footer_cta_label) && (
        <div className="mt-3">
          <Cta label={data.footer_cta_label} href={data.footer_cta_href} ctx={ctx} />
        </div>
      )}
    </BlockShell>
  );
}

// ── info_panel ──

const infoLines = (data) =>
  items(data.lines)
    .map((line) => ({ label: asText(line.label), text: asText(line.text), href: asText(line.href) }))
    .filter((line) => line.text);

export const infoPanelEmpty = (data) => !asText(data.heading) && infoLines(data).length === 0 && !asText(data.panel_title);

export function InfoPanelBlock({ section, ctx }) {
  const data = section.data;
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  const image = imageUrl(data.image);
  const panel = asText(data.panel_label) || asText(data.panel_title) || asText(data.panel_note);
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <div className="grid items-center gap-8 lg:grid-cols-2">
        <div className="min-w-0">
          <BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} />
          <dl className="m-0 mt-5 grid gap-2 text-sm">
            {infoLines(data).map((line, index) => (
              <div key={index} className="grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)]">
                <dt className="font-semibold text-[#09263e]">{line.label}</dt>
                <dd className="m-0 text-slate-700">
                  {line.href ? (
                    <SmartLink href={line.href} locale={ctx.locale} className="underline">
                      {line.text}
                    </SmartLink>
                  ) : (
                    line.text
                  )}
                </dd>
              </div>
            ))}
          </dl>
          {asText(data.cta_label) && (
            <div className="mt-6">
              <Cta label={data.cta_label} href={data.cta_href} ctx={ctx} className={OUTLINE_BUTTON} />
            </div>
          )}
        </div>
        {image ? (
          <img src={image} alt={asText(data.image_alt)} className="aspect-[4/3] w-full rounded-2xl object-cover" />
        ) : (
          (panel || asText(data.map_url)) && <OfficeMap src={asText(data.map_url)} title={asText(data.panel_title) || undefined} />
        )}
      </div>
    </BlockShell>
  );
}
