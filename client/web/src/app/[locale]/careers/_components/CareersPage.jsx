/**
 * CareersPage - the Careers page (U02), in the batch-2 look.
 *
 *   1. Hero: eyebrow, h1, introduction, buttons | "Work at Rapid" card with the open-role count
 *   2. Open roles (from the API), as cards
 *   3. The page's remaining sections as accordion cards
 */
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";

import { Html } from "@/components/pages/content-primitives";
import { BTN_LIME, BTN_OUTLINE } from "@/components/home/styles";
import { Band, CARD, HeroBand, PROSE_CARD } from "@/components/pages/b2e-ui";
import { JobOpenings } from "@/components/pages/job-openings";
import { b2eText } from "@/lib/pages/b2e-copy";

export function CareersPage({ page, t, jobs = [], locale = "en" }) {
  const text = b2eText(t);
  // The roles come from the API (JobOpenings), so the written list of roles is left out.
  const bodySections = (page.sections ?? []).filter((section) => section.id !== "explore-the-roles");
  const countLabel = jobs.length === 0 ? text("careers.noRoles") : jobs.length === 1 ? text("careers.openRole") : text("careers.openRoles", { count: jobs.length });

  const card = (
    <aside aria-labelledby="careers-card-title" className={CARD}>
      <h2 id="careers-card-title" className="m-0! text-xl! font-semibold! leading-snug! tracking-tight! text-[#09263e]!">
        {text("careers.cardTitle")}
      </h2>
      <p className="mb-0! mt-3! text-[15px] leading-7 text-slate-700">{text("careers.cardText")}</p>
      <a
        href="#current-openings"
        className="group mt-5 flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-[#09263e]! no-underline transition-colors hover:border-[#09263e] hover:bg-[#f4f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
      >
        <span className="min-w-0 flex-1 text-base font-semibold leading-snug">{countLabel}</span>
        <ChevronRight className="size-5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </a>
    </aside>
  );

  return (
    <main id="main">
      <HeroBand
        id="careers-title"
        eyebrow={text("careers.eyebrow")}
        title={page.h1}
        intro={<Html html={page.introHtml} />}
        actions={
          <>
            <a href="#current-openings" className={BTN_LIME}>
              {text("careers.seeRoles")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <Link href={`/${locale}/careers/how-we-hire`} className={BTN_OUTLINE}>
              {text("careers.howWeHire")}
            </Link>
          </>
        }
        aside={card}
      />

      <JobOpenings jobs={jobs} locale={locale} t={t} />

      {bodySections.length > 0 && (
        <Band tone="grey" className="py-12 sm:py-14">
          <div className="grid gap-4">
            {bodySections.map((section) => (
              <details key={section.id} id={section.id} className="b2e-anchor group rounded-2xl border border-slate-200 bg-white">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-6 py-5 text-lg font-semibold text-[#09263e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] [&::-webkit-details-marker]:hidden">
                  {section.title}
                  <span
                    aria-hidden="true"
                    className="ml-auto flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eaff6b] text-xl font-bold leading-none text-[#09263e] transition-transform group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 pt-1">
                  <Html html={section.html} className={PROSE_CARD} />
                </div>
              </details>
            ))}
          </div>
        </Band>
      )}
    </main>
  );
}
