import { Search } from "lucide-react";

import { asArray, asText } from "@/lib/content/site-page-adapters";
import { filterKey } from "@/lib/url-filters";
import { BandHead } from "./band";
import { BlockShell, SmartLink } from "./shared";

// "Know the scheme's name? Search for it." A search box and shortcut chips that
// hand over to the scheme directory (/schemes), using the directory's own
// address contract (components/pages/scheme-directory.jsx, schemes/page.js):
//
//   /schemes?q=<words>       search words
//   /schemes?topic=<key>     one of the directory's topics (filterKey of the topic name)
//   /schemes?industry=<id>   (not used here)
//
// The search is a plain GET form, so it works without JavaScript. A chip's link
// is, in order: its own link (a section of this page or another page), its search
// words, its directory topic, or the whole directory. The block makes no claim
// about what the search finds: the directory shows the result and each scheme's
// status.

const chipsOf = (data) =>
  asArray(data.chips)
    .map((chip) => ({
      label: asText(chip?.label),
      term: asText(chip?.term),
      topic: asText(chip?.topic),
      href: asText(chip?.href),
    }))
    .filter((chip) => chip.label);

export const chipHref = (chip) => {
  if (chip.href) return chip.href;
  if (chip.term) return `/schemes?q=${encodeURIComponent(chip.term)}`;
  if (chip.topic) return `/schemes?topic=${encodeURIComponent(filterKey(chip.topic))}`;
  return "/schemes";
};

export const schemeSearchEmpty = () => false;

export function SchemeSearchBlock({ section, ctx }) {
  const { data } = section;
  const { tx, locale } = ctx;
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  const inputId = `${section.anchor}-q`;
  const label = asText(data.search_label) || tx("schemeSearchLabel", "Search by subsidy, scheme or expense");
  const placeholder = asText(data.placeholder);
  const button = asText(data.button_label) || tx("schemeSearchButton", "Search");
  const chips = chipsOf(data);

  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label || label}>
      <BandHead id={titleId} eyebrow={asText(data.eyebrow)} heading={heading} intro={asText(data.intro)} />

      <form action={`/${locale}/schemes`} method="get" role="search" className="mt-6 max-w-3xl">
        <label htmlFor={inputId} className="mb-2 block text-sm font-semibold text-[#09263e]">
          {label}
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id={inputId}
            name="q"
            type="search"
            autoComplete="off"
            maxLength={80}
            placeholder={placeholder || undefined}
            className="block h-12 min-w-0 flex-1 rounded-full border border-slate-300 bg-white px-5 text-[15px] text-[#09263e] placeholder:text-slate-500 focus-visible:border-[#1f5d57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57]/25"
          />
          <button
            type="submit"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#eaff6b] px-7 py-2.5 text-sm font-semibold text-[#09263e] transition-colors hover:bg-[#dcf24f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
          >
            <Search className="size-4" aria-hidden="true" />
            {button}
          </button>
        </div>
      </form>

      {chips.length > 0 && (
        <ul aria-label={tx("schemeSearchChips", "Shortcuts")} className="m-0 mt-5 flex list-none flex-wrap gap-2 p-0">
          {chips.map((chip, index) => (
            <li key={`${chip.label}-${index}`}>
              <SmartLink
                href={chipHref(chip)}
                locale={locale}
                className="inline-flex min-h-10 items-center rounded-full border border-[#09263e]/25 bg-white px-4 text-sm font-semibold !text-[#09263e] no-underline transition-colors hover:border-[#09263e] hover:bg-[#f4f7f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2"
              >
                {chip.label}
              </SmartLink>
            </li>
          ))}
        </ul>
      )}
    </BlockShell>
  );
}
