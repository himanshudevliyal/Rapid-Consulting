import { ArrowUpRight, Check } from "lucide-react";

import { Html } from "@/components/common/html";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { FaqContent } from "@/components/pages/faq-content";
import { hasFaqContent } from "@/lib/pages/faq";
import { rewriteContentLinks, toSlugHref } from "@/lib/page-routes";
import { LIME_BUTTON, H2 } from "./text";
import { splitButtons } from "./html-utils";

// Building blocks of the editorial pages (server-safe).

/** Editor HTML with the b2c styling (navy table headers, callouts, numbered lists). */
export function Rich({ html, className = "", tone }) {
  if (!html || !String(html).trim()) return null;
  return (
    <Html
      html={rewriteContentLinks(html)}
      className={`b2c-prose ${tone === "navy" ? "b2c-prose--navy" : ""} ${className}`}
    />
  );
}

/**
 * Editor HTML in which a paragraph made of one link with class "button"
 * (<p><a class="button" href="#enquire">Label →</a></p>) is a lime button:
 * "#enquire" opens the enquiry form, any other address is a link. The rest is prose.
 */
export function RichActions({ html, source, pageTitle, serviceName, tone, className = "" }) {
  return splitButtons(html).map((part, index) => {
    if (part.type === "html") return <Rich key={index} html={part.html} tone={tone} className={className} />;
    if (part.href === "#enquire" || !part.href) {
      return (
        <div key={index} className="mt-5">
          <LimeAction source={source} pageTitle={pageTitle} serviceName={serviceName} arrow={part.arrow}>
            {part.label}
          </LimeAction>
        </div>
      );
    }
    return (
      <div key={index} className="mt-5">
        <a className={LIME_BUTTON} href={toSlugHref(part.href)}>
          {part.label}
          {part.arrow && <span aria-hidden="true">{part.arrow}</span>}
        </a>
      </div>
    );
  });
}

/** Question / answer markup becomes the FAQ accordion; anything else is prose. */
export function RichOrFaq({ html, className = "" }) {
  if (hasFaqContent(html)) return <FaqContent html={html} />;
  return <Rich html={html} className={className} />;
}

/** The lime call to action that opens the enquiry drawer. */
export function LimeAction({ children, source, pageTitle, serviceName, arrow = "→" }) {
  return (
    <EnquiryTrigger className={LIME_BUTTON} source={source} pageTitle={pageTitle} serviceName={serviceName}>
      {children}
      <span aria-hidden="true">{arrow}</span>
    </EnquiryTrigger>
  );
}

/** Navy panel: rust-on-navy (lime) eyebrow, heading, content, optional lime button. */
export function NavyPanel({ id, eyebrow, title, children, action, className = "" }) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      className={`b2c-anchor mt-12 rounded-3xl bg-[#09263e] p-6 text-white sm:p-9 ${className}`}
    >
      {eyebrow && <p className="wc2-eyebrow wc2-eyebrow--on-navy !m-0">{eyebrow}</p>}
      {title && (
        <h2 id={id ? `${id}-title` : undefined} className={`${H2} !mt-2 !mb-5 !text-white`}>
          {title}
        </h2>
      )}
      {children}
      {action && <div className="mt-6">{action}</div>}
    </section>
  );
}

/** Grey card holding numbered rows ("How it's claimed"). */
export function GreyCard({ id, eyebrow, title, children, action, className = "" }) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
      className={`b2c-anchor mt-12 rounded-3xl bg-[#f3f5f6] p-5 sm:p-8 ${className}`}
    >
      {eyebrow && <p className="wc2-eyebrow !m-0">{eyebrow}</p>}
      {title && (
        <h2 id={id ? `${id}-title` : undefined} className={`${H2} !mt-2 !mb-5`}>
          {title}
        </h2>
      )}
      {children}
      {action && <div className="mt-6">{action}</div>}
    </section>
  );
}

/** Checklist rows with a tick. items: string[] */
export function Checklist({ items }) {
  return (
    <ul className="m-0 grid list-none gap-3 p-0">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] leading-6 text-[#09263e]">
          <span aria-hidden="true" className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#09263e] text-[#eaff6b]">
            <Check className="size-3.5" strokeWidth={3} />
          </span>
          <span className="min-w-0">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** "View all" style link with an arrow. */
export function TextLink({ href, children, className = "" }) {
  return (
    <a
      href={href}
      className={`inline-flex items-center gap-1.5 text-sm font-semibold text-[#09263e] underline decoration-[#09263e]/35 underline-offset-4 hover:decoration-[#09263e] ${className}`}
    >
      {children}
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </a>
  );
}

