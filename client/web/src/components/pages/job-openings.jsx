import Link from "next/link";
import { ArrowRight, Briefcase, Clock, MapPin } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { Band } from "./b2e-ui";

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
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-700 ${className}`}>
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
    <Band id="current-openings" labelledBy="current-openings-title">
      <SectionHeading id="current-openings-title" eyebrow={t("site.careers.eyebrow")} title={t("site.careers.openings")} />
      {jobs.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-200 bg-[#f6f8f6] p-8 text-slate-700">
          <h3 className="m-0! text-lg! font-semibold! text-[#09263e]!">{t("site.careers.noOpeningsTitle")}</h3>
          <p className="mb-0! mt-2!">{t("site.careers.noOpeningsText")}</p>
        </div>
      ) : (
        <ul className="m-0 mt-8 grid list-none gap-6 p-0 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <li key={job.slug} className="m-0 flex">
              <article className="flex w-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#09263e]/30 hover:shadow-md">
                <h3 className="m-0! text-lg! font-semibold! leading-snug! text-[#09263e]!">{job.title}</h3>
                <JobFacts job={job} className="mt-3" />
                {job.description && <p className="mb-0! mt-4! text-[15px] leading-7 text-slate-700">{job.description}</p>}
                {job.closingDate && (
                  <p className="mb-0! mt-3! text-xs font-medium text-slate-600">
                    {t("site.careers.closes")} {formatDate(job.closingDate)}
                  </p>
                )}
                <Link
                  href={`/${locale}/careers/${job.slug}`}
                  className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 text-sm font-semibold text-[#1f5d57]! no-underline transition-colors hover:text-[#09263e]! focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
                >
                  {t("site.careers.viewRole")}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </article>
            </li>
          ))}
        </ul>
      )}
    </Band>
  );
}
