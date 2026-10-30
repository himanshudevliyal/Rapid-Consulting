import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Html } from "@/components/pages/content-primitives";
import { JobFacts } from "@/components/pages/job-openings";
import { ContactExperience } from "@/components/form/contact-experience";
import { BTN_LIME, BTN_OUTLINE } from "@/components/home/styles";
import { b2eText } from "@/lib/pages/b2e-copy";
import { Band, HeroBand, PROSE_CARD } from "./b2e-ui";

// One role: hero with its facts and closing date, the opening text, the work and
// skills sections and a short enquiry form for applying.
export function JobView({ page, t }) {
  const text = b2eText(t);
  const closes =
    page.closingDate &&
    new Date(`${page.closingDate}T00:00:00`).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <main id="main">
      <HeroBand
        id="job-title"
        eyebrow={t("site.careers.eyebrow")}
        title={page.h1}
        intro={<Html html={page.introHtml} />}
        extra={
          <div className="mt-6">
            <JobFacts job={page} />
            {closes && (
              <p className="mb-0! mt-3! text-sm font-medium text-slate-700">
                {t("site.careers.closes")} {closes}
              </p>
            )}
          </div>
        }
        actions={
          <>
            <a href="#apply" className={BTN_LIME}>
              {t("site.careers.applyHeading")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </a>
            <Link href={`/${page.locale || "en"}/careers`} className={BTN_OUTLINE}>
              {text("careers.applyBack")}
            </Link>
          </>
        }
      />

      {page.sections.length > 0 && (
        <Band>
          <div className="mx-auto grid max-w-3xl gap-5">
            {page.sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
                <h2 className="m-0! text-xl! font-semibold! tracking-tight! text-[#09263e]!">{section.title}</h2>
                <Html html={section.html} className={`mt-3 ${PROSE_CARD}`} />
              </section>
            ))}
          </div>
        </Band>
      )}

      <Band id="apply" tone="sage">
        <ContactExperience
          pageTitle={page.h1}
          pageId={page.id}
          variant="section"
          heading={t("site.careers.applyHeading")}
          eyebrow={t("site.careers.applyEyebrow")}
          requirementHint={t("site.careers.applyHint")}
        />
      </Band>
    </main>
  );
}
