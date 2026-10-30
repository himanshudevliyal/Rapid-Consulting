import Link from "next/link";
import { ArrowUpRight, FileText } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";

import { copy } from "@/lib/pages/w4-copy";

export const SVR_PATH = "/subsidy-viability-report";
const CONTEXTS = ["schemes", "scheme", "industry", "resources", "home"];

// Compact promotion of the Subsidy Viability Report. The copy describes what the
// report is; it makes no promise about outcome, fee or turnaround.
//   <SvrTeaser context="schemes" />   // "schemes" | "scheme" | "industry" | "resources" | "home"
// The public name lives in one place: message key `svr.name` (default in lib/pages/w4-copy.js).
export async function SvrTeaser({ context = "schemes", locale: localeProp, className = "" }) {
  const locale = localeProp ?? (await getLocale());
  const t = await getTranslations({ locale });
  const name = copy(t, "svr.name");
  const key = CONTEXTS.includes(context) ? context : "schemes";

  return (
    <aside
      aria-label={name}
      className={`flex flex-col gap-4 rounded-2xl border border-[#d6e6d1] bg-[#f1f5ee] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6 ${className}`}
    >
      <div className="flex items-start gap-4">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#09263e] text-white"
          aria-hidden="true"
        >
          <FileText className="size-5" strokeWidth={1.7} />
        </span>
        <div className="min-w-0">
          <p className="m-0 mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]">
            {copy(t, "svr.teaser.eyebrow")}
          </p>
          <p className="m-0 text-lg font-semibold leading-snug text-[#09263e]">
            {copy(t, `svr.teaser.heading.${key}`)}
          </p>
          <p className="m-0 mt-1 text-sm text-slate-700">{copy(t, "svr.teaser.body", { name })}</p>
        </div>
      </div>
      <Link
        href={`/${locale}${SVR_PATH}`}
        className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-[#eaff6b] px-5 py-2 text-sm font-semibold text-[#09263e] transition-colors hover:bg-[#dcf24f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#09263e] sm:self-center"
      >
        {copy(t, "svr.teaser.cta")}
        <ArrowUpRight className="size-4" aria-hidden="true" />
      </Link>
    </aside>
  );
}

export default SvrTeaser;
