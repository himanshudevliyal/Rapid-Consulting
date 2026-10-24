import Link from "next/link";
import { ArrowRight, Briefcase, Clock, MapPin } from "lucide-react";

import Heading from "@/components/layout/heading";
import Section from "@/components/layout/section";

const formatDate = (value) =>
  new Date(`${value}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// Small "facts" line of a role: location, type, experience.
export function JobFacts({ job, className = "" }) {
  const facts = [
    job.location && { icon: MapPin, text: job.location },
    job.jobType && { icon: Briefcase, text: job.jobType },
    job.experience && { icon: Clock, text: job.experience },
  ].filter(Boolean);
  if (!facts.length) return null;
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600 ${className}`}>
      {facts.map(({ icon: FactIcon, text }) => (
        <li key={text} className="inline-flex items-center gap-1.5">
          <FactIcon className="size-4 text-[#1f5d57]" aria-hidden="true" />
          {text}
        </li>
      ))}
    </ul>
  );
}

// The open roles of the Careers page, straight from the API.
export function JobOpenings({ jobs, locale, t }) {
  return (
    <Section id="current-openings" className="pt-0 pb-12 lg:pb-16">
      <Heading
        eyebrow={t("site.careers.eyebrow")}
        heading={t("site.careers.openings")}
        className="mb-8 text-start"
        headingClassName="text-2xl font-semibold tracking-tight text-[#071f33] md:text-3xl"
      />
      {jobs.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-8 text-slate-600 shadow-sm">
          <h3 className="m-0 text-lg font-semibold text-[#09263e]">{t("site.careers.noOpeningsTitle")}</h3>
          <p className="mt-2 mb-0">{t("site.careers.noOpeningsText")}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <article
              key={job.slug}
              className="flex flex-col rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="m-0 text-lg font-semibold text-[#09263e]">{job.title}</h3>
              <JobFacts job={job} className="mt-3" />
              {job.description && <p className="mt-4 mb-0 text-sm leading-relaxed text-slate-600">{job.description}</p>}
              {job.closingDate && (
                <p className="mt-3 mb-0 text-xs font-medium text-slate-500">
                  {t("site.careers.closes")} {formatDate(job.closingDate)}
                </p>
              )}
              <Link
                href={`/${locale}/careers/${job.slug}`}
                className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-[#1f5d57] transition-colors hover:text-[#09263e]"
              >
                {t("site.careers.viewRole")}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      )}
    </Section>
  );
}
