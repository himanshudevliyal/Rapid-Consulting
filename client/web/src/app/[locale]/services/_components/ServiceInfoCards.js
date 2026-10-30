import { ArrowUpRight } from "lucide-react";

import { Html } from "@/components/common/html";
import { ActionHtml } from "./ActionHtml";

// "cards" role: an optional intro, then one card per item (title + text) in a
// two-column grid, then the closing text. When an item's text holds a link, the
// whole card goes there ("What it unlocks"); otherwise it is a plain card
// ("Who'll handle your file", client quotes, related reading).
const hasLink = (html = "") => /<a\b[^>]*href=/i.test(html);

export function ServiceInfoCards({ section, service }) {
  const items = (section.items ?? []).filter((item) => item.title);
  return (
    <div data-component="ServiceInfoCards">
      <Html html={section.intro_html} className="b2b-prose" />
      {items.length > 0 && (
        <ul className="m-0 mt-6 grid list-none gap-4 p-0 sm:grid-cols-2">
          {items.map((item, index) => {
            const linked = hasLink(item.html);
            return (
              <li
                key={item.key || index}
                className={`relative rounded-2xl bg-[#f1f3f2] p-5 sm:p-6 ${linked ? "transition-colors focus-within:ring-2 focus-within:ring-[#09263e] hover:bg-[#e7ecea]" : ""}`}
              >
                <h3 className={`!m-0 !text-[17px] !font-semibold !leading-snug !text-[#09263e] ${linked ? "pr-8" : ""}`}>{item.title}</h3>
                <Html
                  html={item.html}
                  className={`b2b-prose mt-2 !text-[15px] ${linked ? "[&_a]:text-inherit [&_a]:!no-underline [&_a]:after:absolute [&_a]:after:inset-0 [&_a]:after:content-['']" : ""}`}
                />
                {linked && <ArrowUpRight className="absolute right-5 top-5 size-5 text-[#09263e]" aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
      <ActionHtml html={section.outro_html} service={service} source={`service-${section.key}`} />
    </div>
  );
}
