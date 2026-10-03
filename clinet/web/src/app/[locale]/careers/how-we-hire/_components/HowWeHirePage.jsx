/**
 * HowWeHirePage — dedicated UI for the "How We Hire" page (U03).
 *
 * Layout (top → bottom):
 *   1. Hero       — eyebrow + h1 + intro paragraph, full-width
 *   2. Steps      — 4 numbered process cards from page.sections
 *   3. CTA banner — WhatsApp contact link + link to /careers
 *
 * Isolated from all other pages. Tailwind CSS utility classes only —
 * NO new CSS added to globals.css.
 */

import Link from "next/link";
import { MessageCircle, ArrowRight } from "lucide-react";

import { Html } from "@/components/pages/content-primitives";
import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";

/** Number labels for the 4 steps — used as decorative badges. */
const STEP_NUMBERS = ["01", "02", "03", "04"];

/**
 * Accent colors cycling through the step cards.
 * Only brand colors used; no CSS vars — Tailwind classes only.
 */
const STEP_ACCENTS = [
  { badge: "bg-[#eaff6b] text-[#09263e]", border: "border-l-[#eaff6b]" },
  { badge: "bg-[#09263e] text-[#eaff6b]", border: "border-l-[#09263e]" },
  { badge: "bg-[#1f5d57] text-white",      border: "border-l-[#1f5d57]" },
  { badge: "bg-[#eaff6b] text-[#09263e]", border: "border-l-[#eaff6b]" },
];

/** WhatsApp number extracted from CMS "share-your-cv" section. */
const WA_HREF   = "https://wa.me/919254049513";
const WA_LABEL  = "+91 92540 49513";

export function HowWeHirePage({ page, t, has }) {
  const steps = page.sections ?? [];

  return (
    <main id="main">

  
      {/* ── 2. Process steps ─────────────────────────────────────────────── */}
      {steps.length > 0 && (
        <Section   >

         <Heading
            className="mx-auto  text-center mb-10"
            eyebrow="Recruitment"
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
            heading= {page.h1}
            headingClassName="text-3xl font-semibold leading-tight tracking-tight text-[#071f33] md:text-4xl"
            subheading={page.introHtml}
          />

          <ol className="grid gap-6 md:grid-cols-2">
            {steps.map((step, idx) => {
              const accent = STEP_ACCENTS[idx % STEP_ACCENTS.length];
              const num    = STEP_NUMBERS[idx] ?? String(idx + 1).padStart(2, "0");

              return (
                <li
                  key={step.id}
                  id={step.id}
                  className={[
                    "relative flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white",
                    "border-l-4 p-7 shadow-sm transition-shadow hover:shadow-md",
                    accent.border,
                  ].join(" ")}
                >
                  {/* Step number badge */}
                  <span
                    className={[
                      "inline-flex size-11 shrink-0 items-center justify-center rounded-full",
                      "text-sm font-black tracking-tight",
                      accent.badge,
                    ].join(" ")}
                    aria-hidden="true"
                  >
                    {num}
                  </span>

                  {/* Step title */}
                  <h2 className="text-lg font-bold text-[#09263e]">
                    {step.title}
                  </h2>

                  {/* Step body */}
                  <div className="text-[0.925rem] leading-7 text-slate-600 [&_a]:font-medium [&_a]:text-[#1f5d57] [&_a:hover]:underline [&_p]:m-0 [&_p+p]:mt-3">
                    <Html html={step.html} />
                  </div>
                </li>
              );
            })}
          </ol>
        </Section>
      )}



    </main>
  );
}
