"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Search } from "lucide-react";

import { BTN_LIME } from "@/components/home/styles";
import { HeroCard } from "@/components/pages/b2d-parts";

const TARGET = "#scheme-directory";

/**
 * The "Find a scheme." card of the scheme directory hero (Figma R02): a search
 * box, the lime Search button and "Popular:" chips. It does not filter by
 * itself - it sends the words to the directory below through the address
 * (?q=), which is the directory's one source of truth, so Back/Forward, the
 * count and the removable "Applied" chip all behave as for the directory's own
 * search. Without JavaScript the form is a plain GET to the same address.
 *
 *   action   the directory's path, e.g. "/en/schemes"
 *   popular  [{ label, term }] that match at least one scheme (chosen on the server);
 *            label is shown, term is searched
 */
export function SchemeFindCard({ action, popular = [], initial = "", labels }) {
  const router = useRouter();
  const id = useId();
  const [text, setText] = useState(initial);

  const go = (event) => {
    event.preventDefault();
    const q = text.trim();
    router.push(`${action}${q ? `?q=${encodeURIComponent(q)}` : ""}${TARGET}`);
  };

  return (
    <HeroCard id={`${id}-title`} title={labels.title} as="section">
      <form action={action} method="get" onSubmit={go} role="search" className="mt-5">
        <label htmlFor={`${id}-q`} className="mb-2 block text-[13px] font-semibold text-[#09263e]">
          {labels.label}
        </label>
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
              autoComplete="off"
              className="block h-12 w-full rounded-xl border border-slate-300 bg-white pl-12 pr-4 text-[15px] text-[#09263e] placeholder:text-slate-500 focus-visible:border-[#1f5d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57]/25"
            />
          </div>
          <button type="submit" className={BTN_LIME}>
            {labels.submit}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </button>
        </div>
      </form>

      {popular.length > 0 && (
        <div className="mt-5">
          <p className="m-0! mb-2! text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">{labels.popular}</p>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {popular.map(({ label, term }) => (
              <li key={`${label}|${term}`} className="m-0">
                <Link
                  href={`${action}?q=${encodeURIComponent(term)}${TARGET}`}
                  className="inline-flex min-h-10 items-center rounded-full border border-slate-300 bg-white px-4 text-sm font-medium text-[#09263e]! no-underline transition-colors hover:border-[#09263e] hover:bg-[#eef3f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </HeroCard>
  );
}
