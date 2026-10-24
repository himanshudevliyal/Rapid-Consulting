import { Html } from "@/components/pages/content-primitives";
import { JobFacts } from "@/components/pages/job-openings";
import { ContactExperience } from "@/components/form/contact-experience";
import Heading from "@/components/layout/heading";
import Section from "@/components/layout/section";

// One role: its facts, the opening text, the work and skills sections and a
// short enquiry form for applying.
export function JobView({ page, t }) {
  return (
    <main id="main">
      <Section className="py-12 lg:py-16">
        <div className="mx-auto max-w-3xl">
          <Heading
            className="text-start"
            eyebrow={t("site.careers.eyebrow")}
            heading={page.h1}
            headingClassName="text-3xl font-semibold leading-tight tracking-tight text-[#071f33] md:text-4xl"
          />
          <JobFacts job={page} className="mt-5" />
          {page.closingDate && (
            <p className="mt-3 mb-0 text-sm font-medium text-slate-500">
              {t("site.careers.closes")}{" "}
              {new Date(`${page.closingDate}T00:00:00`).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          )}
          <Html
            html={page.introHtml}
            className="mt-8 leading-relaxed text-slate-600 [&_p]:m-0 [&_p+p]:mt-3"
          />
          {page.sections.map((section) => (
            <section key={section.id} id={section.id} className="mt-10">
              <h2 className="m-0 text-xl font-semibold text-[#09263e]">{section.title}</h2>
              <Html
                html={section.html}
                className="mt-3 leading-relaxed text-slate-600 [&_p]:m-0 [&_p+p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5"
              />
            </section>
          ))}
        </div>
      </Section>

      <Section id="apply" className="bg-[#f6f8f4] py-12 lg:py-16">
        <ContactExperience
          pageTitle={page.h1}
          pageId={page.id}
          variant="section"
          heading={t("site.careers.applyHeading")}
          eyebrow={t("site.careers.applyEyebrow")}
          requirementHint={t("site.careers.applyHint")}
        />
      </Section>
    </main>
  );
}
