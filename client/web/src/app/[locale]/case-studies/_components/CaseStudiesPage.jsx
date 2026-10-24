/**
 * CaseStudiesPage — collection view for the Case Studies index page (W00).
 *
 * Isolated from all other collection pages. Change this file freely
 * without touching Services, Schemes, Articles, or Industries.
 *
 * Genuinely shared utilities (Directory, ContentCard, ContactExperience …)
 * are imported from src/components/.
 */

import Image from "next/image";

import { linksApiContent } from "@/lib/pages/card-copy";
import { ClientTicker } from "@/components/common/client-ticker";
import { ContactExperience } from "@/components/form/contact-experience";
import { CaseStudiesDirectory } from "./CaseStudiesDirectory";
import { Html } from "@/components/pages/content-primitives";
import Heading from "@/components/layout/heading";
import Section from "@/components/layout/section";

/**
 * Case studies come from the API (CaseStudiesDirectory); `initialData` is the
 * list the server already fetched.
 */
export function CaseStudiesPage({
  page,
  t,
  has,
  image = "/assets/case-studies.png",
  initialData,
}) {
  // ── Data ────────────────────────────────────────────────────────────────────
  // Sections of the index copy that only list individual case studies are
  // replaced by the live directory; the rest is guidance.
  const guidanceSections = page.sections.filter((s) => !linksApiContent(s.html));

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="container collection-page">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Section>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <Heading
              eyebrow={t("site.collection.findNextStep")}
              heading={page.h1}
              className="text-left"
              subheading={page.introHtml}
              eyebrowClassName="mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]"
              headingClassName="text-[2.6rem] leading-[1.1] font-bold tracking-tight text-[#111] mt-0 text-wrap-balance lg:text-[3rem]"
            />
          </div>

          <div className="flex justify-end">
            <Image
              width={500}
              height={500}
              src={page.image || image}
              alt={page.h1}
              className="h-auto w-full max-w-xl rounded-2xl object-cover"
            />
          </div>
        </div>
      </Section>

      {/* ── Searchable directory ───────────────────────────────────────────── */}
      <CaseStudiesDirectory initialData={initialData} />

      {/* ── Guidance accordion ────────────────────────────────────────────── */}
      <Section className="collection-guidance">
        {guidanceSections.map((s) => (
          <details
            key={s.id}
            id={s.id}
            className="mb-4 bg-gray-50 shadow-md"
          >
            <summary>
              {s.title}
              <span>+</span>
            </summary>
            <Html html={s.html} />
          </details>
        ))}
      </Section>

      {/* ── Client ticker ─────────────────────────────────────────────────── */}
      <ClientTicker />

      {/* ── Contact CTA ───────────────────────────────────────────────────── */}
      <ContactExperience
        pageTitle={page.h1}
        pageId={page.id}
        variant="section"
      />
    </div>
  );
}
