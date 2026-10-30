import { Html } from "@/components/common/html";
import { asText, hasHtml } from "@/lib/content/site-page-adapters";
import { BlockHead, BlockShell } from "./shared";

export function RichTextBlock({ section, ctx }) {
  const data = section.data;
  const heading = asText(data.heading);
  const titleId = heading ? `${section.anchor}-title` : undefined;
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} ariaLabel={section.label}>
      <BlockHead id={titleId} heading={heading} />
      <Html html={data.html} className="max-w-[72ch] !text-base !leading-8 text-slate-700" />
    </BlockShell>
  );
}

export const richTextEmpty = (data) => !asText(data.heading) && !hasHtml(data.html);
