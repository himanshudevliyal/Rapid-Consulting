/**
 * IndustriesPage — collection view for the Industries index page (I00).
 *
 * Isolated from all other collection pages. Industries has a special
 * "other industries" accordion section that no other collection needs —
 * it lives here, not in the shared CollectionView.
 *
 * Genuinely shared utilities come from src/components/.
 */

import Image from "next/image";

import { getSummaries } from "@/lib/pages/content";
import { linkedContentIds } from "@/lib/pages/card-copy";
import { ClientTicker } from "@/components/common/client-ticker";
import { Directory } from "@/components/pages/directory";
import { Html } from "@/components/pages/content-primitives";
import Heading from "@/components/layout/heading";
import Section from "@/components/layout/section";

const INDUSTRY_TYPES = ["industry"];

export function IndustriesPage({
  page,
  t,
  has,
  industry = "",
  image = "/assets/hero-section.jpg",
}) {
  // ── Data ────────────────────────────────────────────────────────────────────
  const items = getSummaries(page.locale).filter((p) =>
    INDUSTRY_TYPES.includes(p.type),
  );

  // Sections that link to a specific industry item → shown in the "other
  // industries" expandable details below the directory.
  const industrySections = page.sections.filter((section) =>
    linkedContentIds(section.html).some((id) =>
      items.some((item) => item.type === "industry" && item.id === id),
    ),
  );

  // Remaining sections go into the generic guidance accordion
  const guidanceSections = page.sections.filter(
    (s) => !industrySections.includes(s),
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

      {/* ── Searchable directory ───────────────────────────────────────────── */}
      <Directory
        items={items}
        kind="industries"
        copyById={{}}
        industry={industry}
      />

      {/* ── Other industries accordion (Industries-specific) ──────────────── */}
      {industrySections.length > 0 && (
        <Section
          className="collection-guidance industry-directory-details"
          aria-labelledby="industry-details-heading"
        >
          <Heading
            heading={t("site.collection.otherIndustries")}
            headingClassName="text-2xl sm:text-3xl mb-6 text-left"
            className="text-left mb-0"
          />
          {industrySections.map((s) => (
            <details key={s.id} id={s.id}>
              <summary>
                {s.title}
                <span aria-hidden="true">+</span>
              </summary>
              <Html html={s.html} />
            </details>
          ))}
        </Section>
      )}

      {/* ── Generic guidance accordion ────────────────────────────────────── */}
      {guidanceSections.length > 0 && (
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
      )}

      {/* ── Client ticker ─────────────────────────────────────────────────── */}
      <ClientTicker />

      {/* Industries index intentionally omits the ContactExperience CTA
          (matching original CollectionView: page.id !== "I00" guard). */}
    </div>
  );
}
