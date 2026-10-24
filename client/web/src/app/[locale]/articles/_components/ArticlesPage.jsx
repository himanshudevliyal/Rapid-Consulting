/**
 * ArticlesPage — collection view for the Articles / Guides index (R01).
 *
 * Isolated from all other collection pages. Changing this layout,
 * cards, or filters has ZERO effect on Schemes, Services, Case Studies
 * or Industries.
 *
 * Genuinely shared utilities come from src/components/.
 */

import Image from "next/image";

import { linksApiContent } from "@/lib/pages/card-copy";
import { ClientTicker } from "@/components/common/client-ticker";
import { ContactExperience } from "@/components/form/contact-experience";
import { ArticlesDirectory } from "./ArticlesDirectory";
import { Html } from "@/components/pages/content-primitives";
import Heading from "@/components/layout/heading";
import Section from "@/components/layout/section";

/**
 * Articles and guides come from the API (ArticlesDirectory); `initialData` is
 * the list the server already fetched.
 */
export function ArticlesPage({ page, t, has, image = "/assets/articles.jpg", initialData }) {
  // ── Data ────────────────────────────────────────────────────────────────────
  // Sections of the index copy that only list individual guides / articles are
  // replaced by the live directory below; the rest is guidance.
  const guidanceSections = page.sections.filter((section) => !linksApiContent(section.html));

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
      <ArticlesDirectory initialData={initialData} />

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
