import {
  BadgeCheck,
  Banknote,
  ChevronRight,
  ClipboardCheck,
  Factory,
  FileText,
  Hammer,
  Handshake,
  Landmark,
  MapPin,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";

import { WhatsAppButton } from "@/components/contact/whatsapp";
import { Html } from "@/components/common/html";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { ProofSeal } from "@/components/home/proof-seal";
import { cn } from "@/lib/utils";
import { asArray, asText, hasHtml, safeHref, slugify } from "@/lib/content/site-page-adapters";
import { BlockShell, H1_CLASS, SmartLink } from "./shared";

// The "hero" variant of the masthead, for hub pages (Your Project, Approvals).
//   left   small label, the page's one <h1>, introduction, up to three icon
//          rows, the main button and WhatsApp, a footnote
//   right  a white card "Choose where your project is": a round seal (a figure
//          and its label, both editable) and numbered rows; each row scrolls to
//          the section of this page named in its `target`
// Everything comes from the masthead block's fields, so it is all editable in
// the dashboard. Rows with no target are shown but are not links.
//
// The card has two looks (field card_style): "numbered" (a navy number badge)
// and "icons" (a drawing from CARD_ICON, chosen per row or by position).
// A row opens another page when it has a link (href), else it scrolls to the
// section named in its target.

const ICONS = [Users, UserCheck, BadgeCheck, Handshake];

// Drawings a card row can show (the keys are the registry's `icon` options).
export const CARD_ICON = {
  land: MapPin,
  build: Hammer,
  running: RefreshCw,
  investment: Landmark,
  loan: Banknote,
  sector: Factory,
  finance: Wallet,
  insurance: ShieldCheck,
  document: FileText,
  claim: ClipboardCheck,
};
const AUTO_ICONS = [Landmark, Banknote, RefreshCw, Factory, Wallet, ShieldCheck];

export function highlightsOf(data) {
  return asArray(data.highlights)
    .map((item) => ({ title: asText(item?.title), text: asText(item?.text) }))
    .filter((item) => item.title)
    .slice(0, 4);
}

export function cardRowsOf(data) {
  return asArray(data.card_items)
    .map((item) => ({
      title: asText(item?.title),
      text: asText(item?.text),
      target: slugify(asText(item?.target).replace(/^#/, "")),
      href: safeHref(item?.href),
      icon: asText(item?.icon),
    }))
    .filter((item) => item.title);
}

// The gold "95% success rate" seal (the Figma artwork); the figure and label are its text alternative.
export function Seal({ value, label }) {
  if (!value) return null;
  return <ProofSeal value={value} label={label?.replace(/\*+$/, "").trim()} />;
}

// Up to three icon rows (bold line + grey line), shared with the content hero.
export function HeroHighlights({ items }) {
  if (!items.length) return null;
  return (
    <ul className="m-0 mt-7 grid list-none gap-4 p-0">
      {items.map((item, index) => {
        const Icon = ICONS[index % ICONS.length];
        return (
          <li key={index} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-4">
            <span
              aria-hidden="true"
              className="flex size-11 items-center justify-center rounded-full bg-white text-[#09263e] shadow-[0_0_0_1px_rgba(9,38,62,0.12)]"
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="!m-0 !text-base !font-semibold !leading-snug !text-[#09263e]">{item.title}</p>
              {item.text && <p className="!m-0 !mt-0.5 !text-sm !leading-6 !text-slate-600">{item.text}</p>}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function HubHero({ section, ctx, heading, ctaClass }) {
  const data = section.data;
  const { page } = ctx;
  const titleId = `${section.anchor}-title`;
  const cardId = `${section.anchor}-card`;
  const eyebrow = asText(data.eyebrow);
  const cta = asText(data.primary_cta_label);
  const showWhatsapp = data.show_whatsapp === true || data.show_whatsapp === "true";
  const highlights = highlightsOf(data);
  const rows = cardRowsOf(data);
  const cardTitle = asText(data.card_title);
  const footnote = asText(data.footnote);
  const hasCard = rows.length > 0;
  const icons = data.card_style === "icons";

  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} className="bg-[#eef3f0] !pb-10 !pt-8 md:!pb-14 md:!pt-12">
      <div className={cn("grid items-start gap-10", hasCard && "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14")}>
        <div className="min-w-0">
          {eyebrow && <p className="wc2-eyebrow !m-0">{eyebrow}</p>}
          <h1
            id={titleId}
            className={cn(
              H1_CLASS,
              "!max-w-[24ch] !text-[clamp(32px,3.6vw,46px)]",
              eyebrow && "!mt-3",
            )}
          >
            {heading}
          </h1>
          {hasHtml(data.intro_html) && (
            <Html html={data.intro_html} className="mt-5 max-w-[56ch] !text-[17px] !leading-8 text-slate-700" />
          )}

          <HeroHighlights items={highlights} />

          {(cta || showWhatsapp) && (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              {cta && (
                <EnquiryTrigger className={ctaClass} source="page-hero" pageTitle={page.h1}>
                  {cta}
                  <span aria-hidden="true">→</span>
                </EnquiryTrigger>
              )}
              {showWhatsapp && <WhatsAppButton variant="outline" short />}
            </div>
          )}
          {footnote && <p className="!m-0 !mt-5 max-w-[56ch] !text-xs !leading-5 !text-slate-600">{footnote}</p>}
        </div>

        {hasCard && (
          <nav
            aria-labelledby={cardTitle ? cardId : undefined}
            aria-label={cardTitle ? undefined : section.label || undefined}
            className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(9,38,62,0.55)] sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              {cardTitle ? (
                <h2 id={cardId} className="!m-0 !text-xl !font-semibold !leading-snug !tracking-[-0.01em] !text-[#09263e]">
                  {cardTitle}
                </h2>
              ) : (
                <span />
              )}
              <Seal value={asText(data.seal_value)} label={asText(data.seal_label)} />
            </div>

            <ol className={cn("m-0 mt-5 grid list-none p-0", icons ? "gap-0" : "gap-3")}>
              {rows.map((row, index) => {
                const linked = Boolean(row.href || row.target);
                const Drawing = CARD_ICON[row.icon] ?? AUTO_ICONS[index % AUTO_ICONS.length];
                const inner = (
                  <>
                    <span
                      aria-hidden="true"
                      className={cn(
                        "flex shrink-0 items-center justify-center rounded-full text-sm font-semibold",
                        icons ? "size-10 bg-[#0b2a43] text-white" : "size-9 bg-[#09263e] text-white",
                      )}
                    >
                      {icons ? <Drawing className="size-[18px]" /> : index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold leading-snug text-[#09263e]">{row.title}</span>
                      {row.text && <span className="mt-0.5 block text-sm leading-5 text-slate-600">{row.text}</span>}
                    </span>
                    {linked && (
                      <ChevronRight
                        className="size-5 shrink-0 text-[#09263e] transition-transform group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    )}
                  </>
                );
                const shell = icons
                  ? "flex items-center gap-4 bg-white px-1 py-4 no-underline"
                  : "flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 no-underline";
                const interactive =
                  "group transition-colors hover:bg-[#f4f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2" + (icons ? " hover:rounded-lg" : " hover:border-[#09263e]");
                return (
                  <li key={index} className={icons ? "border-b border-slate-200 last:border-b-0" : undefined}>
                    {row.href ? (
                      <SmartLink href={row.href} locale={ctx.locale} className={cn(shell, interactive)}>
                        {inner}
                      </SmartLink>
                    ) : row.target ? (
                      <a href={`#${row.target}`} className={cn(shell, interactive)}>
                        {inner}
                      </a>
                    ) : (
                      <div className={shell}>{inner}</div>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        )}
      </div>
    </BlockShell>
  );
}
