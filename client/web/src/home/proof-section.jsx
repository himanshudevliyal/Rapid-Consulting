import { ArrowRight, ShieldCheck } from "lucide-react";

import Section from "@/components/layout/section";
import Heading from "@/components/layout/heading";
import { Html } from "@/components/pages/content-primitives";
import { linkedContentIds } from "@/lib/pages/card-copy";
import { pageRoutes } from "@/lib/page-routes";
import { loadCaseStudies } from "@/lib/content/site-data";
import { mainSiteHref } from "@/lib/site";
import { paragraphs } from "./utils";
import { CaseCard } from "@/components/case-card";

const linksCase = (html) =>
  linkedContentIds(html).some((id) => (pageRoutes[id] ?? "").startsWith("/case-studies/"));

// Project experience: every published case study from the API, newest as the
// API orders them. Add one in the admin panel and it shows up here.
export async function ProofSection({ section, page, t, eyebrow }) {
  const cases = await loadCaseStudies();
  // Notes of the home copy that are not a case card stay as the callout.
  const notes = paragraphs(section.html).filter((p) => !linksCase(p));

  return (
    <Section id={section.id} className="relative overflow-hidden bg-[#eef3f1] py-16 lg:py-24">
      {/* soft decorative blobs */}
      <span aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#eaff6b]/40 blur-3xl" />
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-[#1f5d57]/10 blur-3xl" />

      <div className="relative">
        {/* Heading row: left heading, right "view all" */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Heading
            className="max-w-3xl text-left"
            eyebrow={eyebrow}
            heading={section.title}
            headingClassName="text-3xl font-semibold leading-tight tracking-tight text-[#071f33] md:text-4xl lg:text-[2.75rem]"
          />
          <a
            href={mainSiteHref("W00", page.locale, false)}
            className="group inline-flex w-fit items-center gap-3 rounded-full bg-[#09263e] py-2 pl-6 pr-2 text-sm font-medium text-white! transition-colors hover:bg-[#1f5d57]"
          >
            {t("common.viewAll")}
            <span className="flex size-9 items-center justify-center rounded-full bg-[#eaff6b] text-[#09263e] transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="size-4" aria-hidden="true" />
            </span>
          </a>
        </div>

        {/* Case cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cases.map((item, index) => (
            <CaseCard
              key={item.id}
              item={item}
              html={item.description}
              index={index}
              label={page.locale === "hi" ? "केस स्टडी" : "Case Study"}
              amountLabel={page.locale === "hi" ? "लगभग" : "Approximately"}
              cta={page.locale === "hi" ? "केस देखें" : "Read the case"}
            />
          ))}
        </div>

        {/* Notes callout */}
        {notes.length > 0 && (
          <aside className="mt-10 flex gap-4 rounded-2xl border border-[#1f5d57]/15 bg-white/80 p-5 backdrop-blur sm:p-6">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#eaff6b] text-[#09263e]">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <div className="max-w-3xl space-y-2 text-[15px] leading-7 text-slate-600 [&_p]:m-0">
              {notes.map((p, i) => (
                <Html key={i} html={p} />
              ))}
            </div>
          </aside>
        )}
      </div>
    </Section>
  );
}