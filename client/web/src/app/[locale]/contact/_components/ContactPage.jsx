/**
 * ContactPage — dedicated page view for the Contact page.
 *
 * Layout (top → bottom):
 *   1. Hero split  — left: heading + intro + contact info cards
 *                    right: page image
 *   2. Form        — full-width ContactExperience (variant="section")
 *   3. Body        — remaining page.sections rendered as accordion / rich content
 *
 * Isolated from all other pages. Tailwind CSS utility classes only —
 * NO new CSS added to globals.css.
 */

import Image from "next/image";
import { Mail, Phone, Clock, MapPin } from "lucide-react";

import { Html } from "@/components/pages/content-primitives";
import { ContactExperience } from "@/components/form/contact-experience";
import Section from "@/components/layout/section";
import { EMAIL, PHONE_LABEL, PHONE_HREF } from "@/lib/site";
import Heading from "@/components/layout/heading";

/** Default contact image if the CMS page has none. */
const DEFAULT_IMAGE = "/assets/hero-section.jpg";

/**
 * Static contact-info items shown in the hero left column.
 * Icon, label and value are hardcoded; the site-level EMAIL / PHONE_LABEL
 * constants keep them in sync with the rest of the project.
 */
const CONTACT_INFO = [
  {
    icon: Mail,
    label: "Email Us",
    value: EMAIL,
    href: `mailto:${EMAIL}`,
  },
  {
    icon: Phone,
    label: "Call Us",
    value: PHONE_LABEL,
    href: PHONE_HREF,
  },
  {
    icon: Clock,
    label: "Working Hours",
    value: "Mon – Sat, 09 am – 07 pm",
    href: null,
  },
  {
    icon: MapPin,
    label: "Location",
    value: "India (Pan-India Services)",
    href: null,
  },
];

export function ContactPage({
  page,
  t,
  has,
  image = DEFAULT_IMAGE,
}) {
  // All CMS sections on the contact page —
  // rendered as rich body content below the form.
  const bodySections = page.sections ?? [];

  return (
    <main id="main">
      {/* ── 1. Hero: Left content + Right image ─────────────────────────── */}
      <Section className="py-12 lg:py-20  bg-gray-50">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

             <Heading
             subheading={
         <> <p>
            Bring us the investment, approval or business requirement you want to move forward. An expert consultant from Rapid will call you to understand the project and explain how we can help with the work.
          </p>
          <p>
            You can start with a short description. A complete document file or the exact service name is not required.
          </p>
          </>
        }
        className="mx-auto max-w-3xl text-start"
        eyebrow="Get in Touch"
                  eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
        heading="Discuss your project"
        headingClassName="text-3xl font-semibold leading-tight tracking-tight text-[#071f33] md:text-4xl"
      />

          {/* Right — image */}
          <div className="flex justify-center lg:justify-end">
            <Image
              src={page.image || image}
              alt={page.h1}
              width={600}
              height={600}
              className="h-auto w-full max-w-xl rounded-3xl object-cover shadow-md"
              priority
            />
          </div>
        </div>
      </Section>

      {/* ── 2. Contact form (full-width) ─────────────────────────────────── */}
      <Section className="py-4 pb-14 lg:pb-20">
        <ContactExperience
          pageTitle={page.h1}
          pageId={page.id}
          variant="section"
        />
      </Section>

      {/* ── 3. Body sections (remaining CMS content) ─────────────────────── */}
      {bodySections.length > 0 && (
        <Section className="py-12 lg:py-16  bg-gray-50">
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
                <div className="px-6 pb-6 pt-2 text-slate-600 leading-relaxed [&_a]:text-[#1f5d57] [&_a:hover]:underline">
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
