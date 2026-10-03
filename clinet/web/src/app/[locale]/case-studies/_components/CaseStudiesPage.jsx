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

import {
  getSummaries,
  pageHref,
} from "@/lib/pages/content";
import { cardCopy, linkedContentIds } from "@/lib/pages/card-copy";
import { ClientTicker } from "@/components/common/client-ticker";
import { ContactExperience } from "@/components/form/contact-experience";
import { Directory } from "./directory";
import { Html } from "@/components/pages/content-primitives";
import Heading from "@/components/layout/heading";
import Section from "@/components/layout/section";

const CASE_TYPES = ["case-study"];

export function CaseStudiesPage({
  page,
  t,
  has,
  image = "/assets/case-studies.png",
}) {
  // ── Data ────────────────────────────────────────────────────────────────────
  const items = getSummaries(page.locale).filter((p) =>
    CASE_TYPES.includes(p.type),
  );

  // Sections that embed a specific case-study link → used as rich card overrides
  const caseSections = page.sections.filter((s) =>
    linkedContentIds(s.html).some((id) => id.startsWith("RC-CS")),
  );

  // Build per-case-study card copy from those sections
  const copyById = Object.fromEntries(
    caseSections.map((s) => {
      const id = linkedContentIds(s.html).find((id) => id.startsWith("RC-CS"));
      return [
        id,
        {
          ...cardCopy(
            s.html.replace(/<p><strong>[^<]*₹[\s\S]*?<\/strong><\/p>/g, ""),
            pageHref(id, page.locale),
          ),
          sectionId: s.id,
        },
      ];
    }),
  );

  // Guidance/FAQ sections — everything that isn't a case-specific section
  const guidanceSections = page.sections.filter(
    (s) => !caseSections.includes(s),
  );

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

      {/* ── Searchable directory (rich card overrides from copyById) ──────── */}
      <Directory items={items} kind="cases" copyById={copyById} industry="" />

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
