import { ChevronRight } from "lucide-react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { SectionHeading } from "@/components/home/section-heading";
import { BTN_LIME, BTN_WHITE } from "@/components/home/styles";
import { Band, CARD, HeroBand, PROSE_CARD, StepTimeline, WhatsAppOutline } from "@/components/pages/b2e-ui";
import { Html } from "@/components/pages/content-primitives";
import { FaqContent } from "@/components/pages/faq-content";
import { b2eText } from "@/lib/pages/b2e-copy";
import { WHATSAPP_LABEL, WHATSAPP_NUMBER } from "@/lib/site";

// "1. Tell us what..." -> "Tell us what..."
const bare = (title = "") => title.replace(/^\s*\d+\s*[.)]\s*/, "");

// How we work (A02): the five stages as timeline cards, then working with the
// owner's existing advisers, the questions asked before engaging, and the next step.
// Everything comes from the page's manuscript; the hero card links to the stages.
export function HowWeWorkView({ page, t }) {
  const locale = page.locale;
  const text = b2eText(t);

  const steps = page.sections.filter((section) => /^\s*\d+\s*[.)]/.test(section.title));
  const rest = page.sections.filter((section) => !steps.includes(section));
  const faq = rest.find((section) => /<h3\b/.test(section.html));
  const others = rest.filter((section) => section !== faq);
  const cta = others.length > 1 ? others.at(-1) : null;
  const advisers = others.find((section) => section !== cta);

  const crumbs = [
    { label: t("common.home"), href: `/${locale}` },
    { label: page.title, href: page.href },
  ];

  const card = steps.length > 0 && (
    <nav aria-labelledby="hww-card-title" className={CARD}>
      <h2 id="hww-card-title" className="m-0! text-xl! font-semibold! leading-snug! tracking-tight! text-[#09263e]!">
        {text("howWeWork.stepsEyebrow")}
      </h2>
      <ol className="m-0 mt-5 grid list-none gap-3 p-0">
        {steps.map((step, index) => (
          <li key={step.id}>
            <a
              href={`#${step.id}`}
              className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-[#09263e]! no-underline transition-colors hover:border-[#09263e] hover:bg-[#f4f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
            >
              <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#09263e] text-sm font-semibold text-white">
                {index + 1}
              </span>
              <span className="min-w-0 flex-1 text-base font-semibold leading-snug">{bare(step.title)}</span>
              <ChevronRight className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );

  return (
    <>
      <Breadcrumbs items={crumbs} t={t} />
      <main id="main">
        <HeroBand
          id="hww-title"
          eyebrow={text("howWeWork.eyebrow")}
          title={page.h1}
          intro={<Html html={page.introHtml} />}
          actions={
            <>
              <EnquiryTrigger className={BTN_LIME} source="how-we-work-hero" pageTitle={page.h1}>
                {text("common.discuss")}
                <span aria-hidden="true">→</span>
              </EnquiryTrigger>
              <WhatsAppOutline label={text("common.whatsapp", { number: WHATSAPP_LABEL })} />
            </>
          }
          aside={card || undefined}
        />

        {steps.length > 0 && (
          <Band id="stages" labelledBy="hww-steps-title">
            <SectionHeading id="hww-steps-title" eyebrow={text("howWeWork.stepsEyebrow")} title={text("howWeWork.stepsTitle")} />
            <div className="mt-10 max-w-4xl">
              <StepTimeline
                steps={steps.map((step, index) => ({
                  id: step.id,
                  label: text("common.step", { n: index + 1 }),
                  title: bare(step.title),
                  body: <Html html={step.html} className={PROSE_CARD} />,
                }))}
              />
            </div>
          </Band>
        )}

        {advisers && (
          <Band id={advisers.id} tone="sage" labelledBy={`${advisers.id}-title`}>
            <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
              <SectionHeading id={`${advisers.id}-title`} eyebrow={text("howWeWork.advisersEyebrow")} title={advisers.title} />
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <Html html={advisers.html} className={PROSE_CARD} />
              </div>
            </div>
          </Band>
        )}

        {faq && (
          <Band id={faq.id} tone="white" labelledBy={`${faq.id}-title`}>
            <div className="grid items-start gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
              <SectionHeading id={`${faq.id}-title`} eyebrow={text("howWeWork.faqEyebrow")} title={faq.title} />
              <FaqContent html={faq.html} />
            </div>
          </Band>
        )}

        {cta && (
          <section id={cta.id} aria-labelledby={`${cta.id}-title`} className="bg-white pb-12 sm:pb-16 lg:pb-20">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="grid items-center gap-8 rounded-3xl bg-[#09263e] p-8 text-white sm:p-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-14">
                <div>
                  <p className="mb-3! mt-0! text-xs font-bold uppercase tracking-[0.16em] text-[#eaff6b]">{text("howWeWork.ctaEyebrow")}</p>
                  <h2 id={`${cta.id}-title`} className="m-0! max-w-none! text-[1.75rem]! font-semibold! leading-[1.15]! tracking-tight! text-white! sm:text-4xl!">
                    {cta.title}
                  </h2>
                  <Html html={cta.html} className="mt-4 max-w-xl text-base leading-7 text-white/85 [&_a]:text-[#eaff6b] [&_p]:m-0" />
                </div>
                <div className="flex flex-wrap items-center gap-3 lg:justify-end">
                  <EnquiryTrigger className={BTN_LIME} source="how-we-work-cta" pageTitle={page.h1}>
                    {text("common.discuss")}
                    <span aria-hidden="true">→</span>
                  </EnquiryTrigger>
                  <a
                    href={`https://wa.me/${WHATSAPP_NUMBER}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={BTN_WHITE}
                  >
                    {text("common.whatsapp", { number: WHATSAPP_LABEL })}
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
