import { Check } from "lucide-react";

import { asArray, asText } from "@/lib/content/site-page-adapters";
import { BlockHead, BlockShell, Plain } from "./shared";

const checklistItems = (data) =>
  asArray(data.items)
    .map((item) => ({ title: asText(item?.title), text: asText(item?.text) }))
    .filter((item) => item.title || item.text);

export function DocumentsChecklistBlock({ section, ctx }) {
  const data = section.data;
  const items = checklistItems(data);
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <BlockHead id={titleId} heading={heading} />
      <ul className="m-0 grid list-none gap-3 p-0">
        {items.map((item, index) => (
          <li key={index} className="flex gap-3.5 rounded-xl border border-slate-200 bg-white p-4">
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-[#e8efec] text-[#1f5d57]"
            >
              <Check className="size-3.5" />
            </span>
            <div className="min-w-0">
              {item.title && <p className="!m-0 !text-[15px] !font-semibold !leading-snug text-[#09263e]">{item.title}</p>}
              <Plain className={item.title ? "mt-1 !text-sm" : "!text-sm"}>{item.text}</Plain>
            </div>
          </li>
        ))}
      </ul>
    </BlockShell>
  );
}

export const documentsChecklistEmpty = (data) => checklistItems(data).length === 0;
