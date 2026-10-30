"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search } from "lucide-react";

import { BTN_LIME } from "@/components/home/styles";
import { HeroCard } from "./b2d-parts";

/**
 * The search card of the Resources hero (Figma R00): a search box, the lime
 * Search button and a list of popular questions. It sends the words to the
 * articles index (?q=), which already searches guides and articles; without
 * JavaScript the form is a plain GET to the same address.
 *
 *   action   the articles index path, e.g. "/en/articles"
 *   popular  [{ label, href }] - rows; an empty href searches the label
 */
export function ResourceSearchCard({ action, popular = [], labels }) {
  const router = useRouter();
  const id = useId();
  const [text, setText] = useState("");

  const go = (event) => {
    event.preventDefault();
    const q = text.trim();
    router.push(`${action}${q ? `?q=${encodeURIComponent(q)}` : ""}`);
  };

  return (
    <HeroCard id={`${id}-title`} title={labels.title} as="section">
      <form action={action} method="get" onSubmit={go} role="search" className="mt-5">
        {labels.label && (
          <label htmlFor={`${id}-q`} className="mb-2 block text-[13px] font-semibold text-[#09263e]">
            {labels.label}
          </label>
        )}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#1f5d57]" aria-hidden="true" />
            <input
              id={`${id}-q`}
              name="q"
              type="search"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={labels.placeholder}
              aria-label={labels.label ? undefined : labels.placeholder || labels.submit}
              autoComplete="off"
              className="block h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-[15px] text-[#09263e] placeholder:text-slate-500 focus-visible:border-[#1f5d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57]/25"
            />
          </div>
          {labels.submit && (
            <button type="submit" className={BTN_LIME}>
              {labels.submit}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>
      </form>

      {popular.length > 0 && (
        <div className="mt-5">
          {labels.popular && <p className="m-0! mb-2! text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">{labels.popular}</p>}
          <ul className="m-0 grid list-none gap-2 p-0">
            {popular.map((row) => (
              <li key={row.label} className="m-0">
                <Link
                  href={row.href || `${action}?q=${encodeURIComponent(row.label)}`}
                  className="flex min-h-11 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-[#09263e]! no-underline transition-colors hover:border-[#09263e] hover:bg-[#eef3f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
                >
                  {row.label}
                  <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </HeroCard>
  );
}
