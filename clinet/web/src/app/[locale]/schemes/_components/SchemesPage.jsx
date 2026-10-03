/**
 * SchemesPage — collection view for the Schemes index page (R02).
 *
 * Isolated from other collection pages so that UI changes here
 * have NO effect on Services, Articles, Case Studies or Industries.
 *
 * Shared utilities (Directory, ContentCard, ContactExperience, etc.) are
 * imported from src/components/ — those are genuinely reusable.
 * Any Schemes-specific presentational tweak lives in THIS file only.
 */

import Image from "next/image";

import {
  getSummaries,
  pageHref,
} from "@/lib/pages/content";
import { linkedContentIds } from "@/lib/pages/card-copy";
import { ClientTicker } from "@/components/common/client-ticker";
import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { ContactExperience } from "@/components/form/contact-experience";
import { Directory } from "@/components/pages/directory";
import { Html } from "@/components/pages/content-primitives";
import Heading from "@/components/layout/heading";
import Section from "@/components/layout/section";

/** Schemes are the only type served by this collection page. */
const SCHEME_TYPES = ["scheme"];

export function SchemesPage({ page, t, has, image = "/assets/scheme.jpg" }) {
  // ── Data ────────────────────────────────────────────────────────────────────
  const items = getSummaries(page.locale).filter((p) =>
    SCHEME_TYPES.includes(p.type),
  );

  // Guidance sections — all page sections that are not linked to specific content
  const guidanceSections = page.sections.filter(
    (section) =>
      !linkedContentIds(section.html).some((id) =>
        items.some((item) => item.id === id),
      ),
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="container collection-page">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <Section>
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left: heading + intro */}
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

          {/* Right: image */}
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
      <Directory items={items} kind="schemes" copyById={{}} industry="" />

      {/* ── Guidance / FAQ accordion ───────────────────────────────────────── */}
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
