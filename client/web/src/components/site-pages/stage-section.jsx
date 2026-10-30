import { ArrowRight, ArrowUpRight, Info } from "lucide-react";

import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { WHATSAPP_NUMBER } from "@/lib/site";
import { cn } from "@/lib/utils";
import { asArray, asText, localizeHref, safeHref, sourceSlug } from "@/lib/content/site-page-adapters";
import { CTA_BUTTON } from "./masthead";
import { StageCarousel } from "./stage-carousel";
import { BlockShell, Plain, SmartLink } from "./shared";

// One stage or step of a journey (Your Project hub: stages; Approvals hub: steps).
//
//   left   small label, heading, text
//   right  white side card: "Common mistakes" rows (information icon) or
//          "You'll need these if" rows (a condition and a bold "-> Service" link)
//   below  "Services we provide" + previous / next + a row of service cards,
//          then the main and the second button
//   light or navy band; the cards and the side card stay white on navy.
//
// A service card or side-card row with no link (its page does not exist yet)
// renders without one. A second button with no link shows as "not available
// yet" and does nothing: it never leads to a page that is not built.

const SECONDARY_LIGHT =
  "border border-[#09263e]/30 !text-[#09263e] hover:border-[#09263e] focus-visible:ring-[#09263e]";
const SECONDARY_NAVY = "border border-white/60 !text-white hover:bg-white/10 focus-visible:ring-[#eaff6b]";
const BUTTON_BASE =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const ACTIONS = ["enquiry", "scroll_form", "link", "whatsapp"];

// Cleaned view of the block's data (editor input is never trusted to be complete).
export function stageSectionModel(data) {
  const action = asText(data.primary_cta_action);
  return {
    eyebrow: asText(data.eyebrow),
    title: asText(data.title),
    body: asText(data.body),
    navy: data.tone === "navy",
    sideKind: data.side_kind === "needs" ? "needs" : "mistakes",
    sideTitle: asText(data.side_title),
    sideItems: asArray(data.side_items)
      .map((item) => ({
        text: asText(item?.text),
        linkLabel: asText(item?.link_label),
        linkHref: safeHref(item?.link_href),
      }))
      .filter((item) => item.text),
    servicesLabel: asText(data.services_label),
    cards: asArray(data.services)
      .map((card) => ({ title: asText(card?.title), hint: asText(card?.hint), href: safeHref(card?.href) }))
      .filter((card) => card.title),
    primary: {
      label: asText(data.primary_cta_label),
      action: ACTIONS.includes(action) ? action : "enquiry",
      preset: asText(data.primary_cta_preset),
      href: safeHref(data.primary_cta_href),
    },
    secondary: { label: asText(data.secondary_cta_label), href: safeHref(data.secondary_cta_href) },
  };
}

export const stageSectionEmpty = (data) => {
  const model = stageSectionModel(data);
  return !model.title && !model.body && model.cards.length === 0 && model.sideItems.length === 0;
};

function SideCard({ model, id, ctx }) {
  const { tx, locale } = ctx;
  const needs = model.sideKind === "needs";
  const title = model.sideTitle || (needs ? tx("stageNeeds", "You'll need these if") : tx("stageMistakes", "Common mistakes"));
  return (
    <aside
      aria-labelledby={id}
      className="self-start rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_40px_-34px_rgba(9,38,62,0.5)] md:p-7"
    >
      <h3 id={id} className="wc2-side-title !m-0">
        {title}
      </h3>
      <ul className="m-0 mt-4 grid list-none gap-0 p-0">
        {model.sideItems.map((item, index) => (
          <li
            key={index}
            className={cn(
              "py-3 text-[15px] leading-6 text-[#09263e]",
              index > 0 && "border-t border-slate-200",
              needs ? "grid gap-x-4 gap-y-1 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-baseline" : "flex items-start gap-3",
            )}
          >
            {!needs && <Info className="mt-0.5 size-[18px] shrink-0 text-[#b3472d]" aria-hidden="true" />}
            <span className="min-w-0">{item.text}</span>
            {needs && item.linkLabel && (
              <span className="font-semibold">
                {item.linkHref ? (
                  <SmartLink
                    href={item.linkHref}
                    locale={locale}
                    className="inline-flex items-baseline gap-1 !text-[#09263e] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e]"
                  >
                    <span aria-hidden="true">→</span> {item.linkLabel}
                  </SmartLink>
                ) : (
                  <span>
                    <span aria-hidden="true">→</span> {item.linkLabel}
                  </span>
                )}
              </span>
            )}
          </li>
        ))}
      </ul>
    </aside>
  );
}

function PrimaryButton({ model, section, ctx }) {
  const { primary } = model;
  if (!primary.label) return null;
  const content = (
    <>
      {primary.label}
      <ArrowRight className="size-4" aria-hidden="true" />
    </>
  );
  const className = CTA_BUTTON;

  if (primary.action === "scroll_form") {
    return (
      <a href={primary.href && primary.href.startsWith("#") ? primary.href : "#enquiry-form"} className={className}>
        {content}
      </a>
    );
  }
  if (primary.action === "link") {
    return primary.href ? (
      <SmartLink href={primary.href} locale={ctx.locale} className={`${className} no-underline`}>
        {content}
      </SmartLink>
    ) : null;
  }
  if (primary.action === "whatsapp") {
    return (
      <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }
  // Enquiry form (drawer) with the stage as its preset, the same way the stage
  // chooser does it: source stage-<key>, service name = the stage's name.
  return (
    <EnquiryTrigger
      className={className}
      kind="enquiry"
      source={sourceSlug(`stage-${primary.preset || section.anchor}`)}
      serviceName={section.label || model.title}
      pageTitle={ctx.page.h1}
    >
      {content}
    </EnquiryTrigger>
  );
}

function SecondaryButton({ model, ctx }) {
  const { secondary, navy } = model;
  if (!secondary.label) return null;
  const tone = navy ? SECONDARY_NAVY : SECONDARY_LIGHT;
  if (!secondary.href) {
    return (
      <span
        aria-disabled="true"
        title={ctx.tx("stageSoon", "Not available yet")}
        className={cn(
          BUTTON_BASE,
          "cursor-not-allowed opacity-60",
          navy ? "border border-white/40 text-white" : "border border-[#09263e]/25 text-[#09263e]",
        )}
      >
        {secondary.label}
        <ArrowUpRight className="size-4" aria-hidden="true" />
        <span className="sr-only"> ({ctx.tx("stageSoon", "Not available yet")})</span>
      </span>
    );
  }
  return (
    <SmartLink href={secondary.href} locale={ctx.locale} className={cn(BUTTON_BASE, tone)}>
      {secondary.label}
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </SmartLink>
  );
}

export function StageSectionBlock({ section, ctx }) {
  const model = stageSectionModel(section.data);
  const { tx, locale } = ctx;
  const { navy } = model;
  const titleId = model.title ? `${section.anchor}-title` : undefined;
  const sideId = `${section.anchor}-side`;
  const hasSide = model.sideItems.length > 0;
  const cards = model.cards.map((card) => ({ ...card, href: card.href ? localizeHref(card.href, locale) : "" }));

  return (
    <BlockShell
      section={section}
      ctx={ctx}
      labelledBy={titleId}
      ariaLabel={section.label}
      className={navy ? "bg-[#09263e] text-white" : undefined}
    >
      <div className={cn("grid gap-8 lg:gap-12", hasSide && "lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]")}>
        <div className="min-w-0">
          {model.eyebrow && <p className={cn("wc2-eyebrow !m-0", navy && "wc2-eyebrow--on-navy")}>{model.eyebrow}</p>}
          {model.title && (
            <h2
              id={titleId}
              className={cn(
                "!m-0 max-w-[24ch] !text-[clamp(27px,3vw,40px)] !font-semibold !leading-[1.15] !tracking-[-0.03em]",
                model.eyebrow && "!mt-3",
                navy ? "!text-white" : "!text-[#09263e]",
              )}
            >
              {model.title}
            </h2>
          )}
          <Plain className={cn("mt-5 max-w-[56ch] !text-base !leading-7", navy ? "!text-white/85" : "!text-slate-600")}>
            {model.body}
          </Plain>
        </div>
        {hasSide && <SideCard model={model} id={sideId} ctx={ctx} />}
      </div>

      {cards.length > 0 && (
        <div className="mt-10 md:mt-12">
          <StageCarousel
            cards={cards}
            navy={navy}
            heading={model.servicesLabel || tx("stageServices", "Services we provide")}
            labels={{
              region: tx("stageCardsRegion", "Service cards"),
              prev: tx("stageCardsPrev", "Previous services"),
              next: tx("stageCardsNext", "Next services"),
            }}
          />
        </div>
      )}

      {(model.primary.label || model.secondary.label) && (
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <PrimaryButton model={model} section={section} ctx={ctx} />
          <SecondaryButton model={model} ctx={ctx} />
        </div>
      )}
    </BlockShell>
  );
}
