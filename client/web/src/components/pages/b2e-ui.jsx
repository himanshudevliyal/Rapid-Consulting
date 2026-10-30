import { MessageCircle } from "lucide-react";

import { BTN_OUTLINE, EYEBROW, WRAP } from "@/components/home/styles";
import { WHATSAPP_LABEL, WHATSAPP_NUMBER } from "@/lib/site";
import { cn } from "@/lib/utils";

// Shared look of the About, How we work, Contact, Expert profile, Advisers,
// Careers and Subsidy Viability Report pages (Figma batch 2, agent b2e).
// Server-safe: no hooks. Headings and paragraphs carry "!" modifiers because the
// global h1-h4 / p rules would otherwise win (see components/home/styles.js).

export const H1_CLASS =
  "m-0! max-w-[24ch]! text-[clamp(30px,3.6vw,46px)]! font-bold! leading-[1.12]! tracking-[-0.03em]! text-[#09263e]!";

// Eyebrow without its own margin (for use inside flex rows).
export const EYEBROW_FLAT = "m-0! block text-xs font-bold uppercase tracking-[0.16em] text-[#922e0c]";

export const H3_CLASS = "m-0! text-lg! font-semibold! leading-snug! tracking-tight! text-[#09263e]!";

// White rounded card with a soft shadow (the hero cards and rails).
export const CARD =
  "min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(9,38,62,0.55)] sm:p-7";

// Quieter card for body content.
export const PANEL = "rounded-2xl border border-slate-200 bg-white p-5 sm:p-6";

// Text link (rust arrows are for sub-menus only; inline links use the teal ink).
export const TEXT_LINK =
  "inline-flex items-center gap-1.5 text-sm font-semibold text-[#1f5d57]! underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2";

// Styles the manuscript HTML (<p>, <ul>, <a>) inside cards.
export const PROSE_CARD =
  "text-[15px] leading-7 text-slate-700 [&_a]:font-semibold [&_a]:text-[#1f5d57] [&_a:hover]:underline [&_h3]:mb-1 [&_h3]:mt-5 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-[#09263e] [&_li]:mt-1.5 [&_ol]:mt-3 [&_ol]:pl-5 [&_p]:m-0 [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5";

/** Light sage hero: left column (eyebrow, h1, intro, extra, actions) and an optional right card. */
export function HeroBand({ id, eyebrow, title, intro, extra, actions, aside, className }) {
  return (
    <section aria-labelledby={id} data-component="B2eHero" className={cn("bg-[#eef3f0] py-10 md:py-14", className)}>
      <div className={WRAP}>
        <div
          className={cn(
            "grid items-start gap-10",
            aside && "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14",
          )}
        >
          <div className="min-w-0">
            {eyebrow && <p className={EYEBROW}>{eyebrow}</p>}
            <h1 id={id} className={H1_CLASS}>
              {title}
            </h1>
            {intro && (
              <div className="mt-5 max-w-[58ch] text-[17px] leading-8 text-slate-700 [&_a]:font-semibold [&_a]:text-[#1f5d57] [&_p]:m-0 [&_p+p]:mt-3">
                {intro}
              </div>
            )}
            {extra}
            {actions && <div className="mt-8 flex flex-wrap items-center gap-3">{actions}</div>}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}

/** A full-width band with the site container. tone: white | sage | grey | navy. */
export function Band({ id, tone = "white", label, labelledBy, className, children }) {
  const tones = {
    white: "bg-white",
    sage: "bg-[#eef3f0]",
    grey: "bg-[#f6f8f6]",
    navy: "bg-[#09263e] text-white",
  };
  return (
    <section
      id={id}
      aria-label={label}
      aria-labelledby={labelledBy}
      className={cn("scroll-mt-24 py-12 sm:py-16 lg:py-20", tones[tone], className)}
    >
      <div className={WRAP}>{children}</div>
    </section>
  );
}

/** Outline WhatsApp button with the number ("WhatsApp +91 94672 48028"). */
export function WhatsAppOutline({ label, className }) {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(BTN_OUTLINE, className)}
    >
      <MessageCircle className="size-4" aria-hidden="true" />
      {label || `WhatsApp ${WHATSAPP_LABEL}`}
    </a>
  );
}

/** A clearly labelled placeholder marker ("Placeholder - Rapid to confirm"). */
export function PlaceholderChip({ children, className }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border border-dashed border-[#922e0c]/50 bg-[#fff6f1] px-2.5 py-0.5 text-[11px] font-semibold leading-5 text-[#922e0c]",
        className,
      )}
    >
      {children}
    </span>
  );
}

const pad = (n) => String(n).padStart(2, "0");

/**
 * Horizontal timeline of short steps (01 / 02 / 03), each a white card joined
 * by a thin line on wide screens.
 *   steps: [{ title, text }]
 */
export function StepCards({ steps, className }) {
  return (
    <ol className={cn("m-0 grid list-none gap-5 p-0 md:grid-cols-3", className)}>
      {steps.map((step, index) => (
        <li key={step.title} className="relative m-0 rounded-2xl border border-slate-200 bg-white p-6">
          <span
            aria-hidden="true"
            className="flex size-11 items-center justify-center rounded-full bg-[#09263e] text-sm font-bold text-[#eaff6b]"
          >
            {pad(index + 1)}
          </span>
          <h3 className={cn(H3_CLASS, "mt-5!")}>{step.title}</h3>
          <p className="mb-0! mt-2! text-[15px] leading-7 text-slate-700">{step.text}</p>
          {index < steps.length - 1 && (
            <span
              aria-hidden="true"
              className="absolute -right-5 top-11 hidden h-px w-5 bg-[#09263e]/25 md:block"
            />
          )}
        </li>
      ))}
    </ol>
  );
}

/**
 * Vertical timeline of step cards with a rich body.
 *   steps: [{ id, title, body (node), label }]   `label` is the small "STEP 1" tag
 */
export function StepTimeline({ steps, className }) {
  return (
    <ol className={cn("m-0 grid list-none gap-0 p-0", className)}>
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <li key={step.id} id={step.id} className="m-0 grid scroll-mt-28 grid-cols-[auto_minmax(0,1fr)] gap-4 sm:gap-6">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#09263e] text-sm font-bold text-[#eaff6b]"
              >
                {pad(index + 1)}
              </span>
              {!last && <span aria-hidden="true" className="my-2 w-px flex-1 bg-[#09263e]/25" />}
            </div>
            <div className={cn("min-w-0", !last && "pb-6")}>
              <div className={cn(PANEL, "sm:p-7")}>
                {step.label && (
                  <p className="m-0! text-xs font-bold uppercase tracking-[0.14em] text-[#922e0c]">{step.label}</p>
                )}
                <h3 className={cn(H3_CLASS, "text-xl!", step.label && "mt-1.5!")}>{step.title}</h3>
                <div className="mt-3">{step.body}</div>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
