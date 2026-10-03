/**
 * CareersPage — dedicated UI for the Careers page (U02).
 *
 * Layout (top → bottom):
 *   1. Hero split  — LEFT: image   RIGHT: eyebrow + h1 + introHtml
 *   2. Body        — page.sections rendered as styled accordion details
 *
 * Tailwind CSS utility classes only — NO new CSS in globals.css.
 */

import Image from "next/image";

import { Html } from "@/components/pages/content-primitives";
import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";


export function CareersPage({ page, t, has, image = DEFAULT_IMAGE }) {
  const bodySections = page.sections ?? [];

  return (
    <main id="main">

      {/* ── 1. Hero: Left image + Right content ──────────────────────────── */}
      <Section className="py-12 lg:py-20">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

          {/* Left — image */}
          <div className="flex justify-center lg:justify-start">
            <Image
              src="/assets/careers.jpg"
              alt={page.h1}
              width={600}
              height={600}
              className="h-auto w-full max-w-xl rounded-3xl object-cover shadow-md"
              priority
            />
          </div>

          {/* Right — eyebrow, heading, intro */}
    
         
         
         
            
                   <Heading
                     className="mx-auto max-w-3xl text-start"
                     eyebrow=" Careers"
                           eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
                     heading={page.h1}
                     headingClassName="text-3xl font-semibold leading-tight tracking-tight text-[#071f33] md:text-4xl"
                     subheading={page.introHtml}
                   />
         
         
         
         
         </div>
         
         
      </Section>

      {/* ── 2. Body sections — accordions ────────────────────────────────── */}
      {bodySections.length > 0 && (
        <Section className="pt-0 pb-16 lg:pb-24">
          <div className="grid gap-6">
            {bodySections.map((section) => (
              <details
                key={section.id}
                id={section.id}
                className="group rounded-2xl border border-slate-100 bg-white shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 text-base font-semibold text-[#09263e] transition-colors hover:text-[#1f5d57] [&::-webkit-details-marker]:hidden">
                  {section.title}
                  <span
                    aria-hidden="true"
                    className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-full bg-[#f0fdf4] text-[#1f5d57] text-lg font-bold transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 pt-2 text-slate-600 leading-relaxed [&_a]:font-medium [&_a]:text-[#1f5d57] [&_a:hover]:underline [&_p]:m-0 [&_p+p]:mt-3">
                  <Html html={section.html} />
                </div>
              </details>
            ))}
          </div>
        </Section>
      )}

    </main>
  );
}
