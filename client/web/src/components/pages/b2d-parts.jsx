import { WhatsAppButton, WhatsAppMark } from "@/components/contact/whatsapp";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { BTN_LIME, EYEBROW, H2, LEAD, WRAP } from "@/components/home/styles";
import { SmartLink } from "@/components/site-pages/shared";
import { WHATSAPP_NUMBER } from "@/lib/site";
import { cn } from "@/lib/utils";
import { Html } from "./content-primitives";

// Small building blocks shared by the batch-2 "b2d" pages (scheme directory,
// case archive, Resources hub, articles index). Server-safe: no hooks.

const HAS_TAGS = /<[^>]+>/;

/** Small rust label above a heading. */
export function Eyebrow({ children, className }) {
  if (!children) return null;
  return <p className={cn(EYEBROW, className)}>{children}</p>;
}

/** Section heading: eyebrow + H2 + optional intro. `tone="dark"` is for navy bands. */
export function BandHeading({ id, eyebrow, title, intro, tone = "light", className }) {
  const dark = tone === "dark";
  return (
    <div className={className}>
      {eyebrow && <p className={cn(EYEBROW, dark && "text-[#eaff6b]!")}>{eyebrow}</p>}
      <h2 id={id} className={cn(H2, dark && "text-white!")}>
        {title}
      </h2>
      {intro && <p className={cn(LEAD, dark && "text-white/85!")}>{intro}</p>}
    </div>
  );
}

/**
 * "Discuss your project ->" (opens the enquiry drawer, or follows `href` when
 * the page gives one) + the WhatsApp button (`whatsappLabel` replaces its text).
 */
export function HeroActions({ label, source, pageTitle, href, whatsappLabel, locale }) {
  return (
    <div className="mt-7 flex flex-wrap items-center gap-3">
      {href ? (
        <SmartLink href={href} locale={locale} className={BTN_LIME}>
          {label}
          <span aria-hidden="true">→</span>
        </SmartLink>
      ) : (
        <EnquiryTrigger className={BTN_LIME} source={source} pageTitle={pageTitle}>
          {label}
          <span aria-hidden="true">→</span>
        </EnquiryTrigger>
      )}
      {whatsappLabel ? (
        <a
          className="whatsapp-button"
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={whatsappLabel}
        >
          <WhatsAppMark />
          <span>{whatsappLabel}</span>
        </a>
      ) : (
        <WhatsAppButton />
      )}
    </div>
  );
}

/** White card that sits on the right of a hero. */
export function HeroCard({ id, title, seal, children, className, as: Component = "div", ...props }) {
  return (
    <Component
      aria-labelledby={title ? id : undefined}
      className={cn(
        "min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_60px_-40px_rgba(9,38,62,0.55)] sm:p-7",
        className,
      )}
      {...props}
    >
      {(title || seal) && (
        <div className="flex items-start justify-between gap-4">
          {title ? (
            <h2 id={id} className="m-0! text-xl! font-semibold! leading-snug! tracking-tight! text-[#09263e]!">
              {title}
            </h2>
          ) : (
            <span />
          )}
          {seal}
        </div>
      )}
      {children}
    </Component>
  );
}

/**
 * The sage hero band of the b2d pages: eyebrow, the page's one <h1>, the
 * introduction (page copy, text or HTML), the actions and an optional footnote
 * on the left; an optional card on the right.
 */
export function HeroBand({ titleId, eyebrow, title, introHtml, actions, footnote, card, children }) {
  const rich = HAS_TAGS.test(introHtml || "");
  return (
    <section aria-labelledby={titleId} className="bg-[#eef3f0] py-10 md:py-14">
      <div
        className={cn(
          WRAP,
          "grid items-start gap-10",
          card && "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14",
        )}
      >
        <div className="min-w-0">
          {eyebrow && <p className={cn(EYEBROW, "mb-3!")}>{eyebrow}</p>}
          <h1
            id={titleId}
            className="m-0! max-w-[24ch]! text-[clamp(32px,3.6vw,46px)]! font-semibold! leading-[1.14]! tracking-[-0.03em]! text-[#09263e]!"
          >
            {title}
          </h1>
          {introHtml &&
            (rich ? (
              <Html html={introHtml} className="mt-5 max-w-[58ch] text-[17px]! leading-8! text-slate-700 [&_p]:m-0 [&_p+p]:mt-3" />
            ) : (
              <p className="mb-0! mt-5! max-w-[58ch] text-[17px] leading-8 text-slate-700">{introHtml}</p>
            ))}
          {children}
          {actions}
          {footnote && <p className="m-0! mt-5! max-w-[58ch] text-xs leading-5 text-slate-600">{footnote}</p>}
        </div>
        {card}
      </div>
    </section>
  );
}

/** Wide inner container for a full-width band. */
export function Band({ id, labelledBy, tone = "white", className, children, ...props }) {
  const tones = {
    white: "bg-white",
    sage: "bg-[#f1f5f2]",
    grey: "bg-[#f4f7f5]",
    navy: "bg-[#09263e] text-white",
  };
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn("scroll-mt-24 py-12 sm:py-16", tones[tone] ?? tones.white, className)}
      {...props}
    >
      <div className={WRAP}>{children}</div>
    </section>
  );
}

/** Guidance sections of the page copy as quiet accordions (page copy, kept). */
export function GuidanceSections({ sections }) {
  if (!sections?.length) return null;
  return (
    <section aria-label="Guidance" className="collection-guidance bg-white py-12 sm:py-14">
      <div className={WRAP}>
        {sections.map((s) => (
          <details key={s.id} id={s.id} className="mb-3 rounded-2xl border border-slate-200 bg-[#f8faf9]">
            <summary>
              {s.title}
              <span>+</span>
            </summary>
            <Html html={s.html} />
          </details>
        ))}
      </div>
    </section>
  );
}
