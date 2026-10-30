import { asText, faqItems } from "@/lib/content/site-page-adapters";
import { SiteFaqList } from "./faq-list";
import { BlockHead, BlockShell } from "./shared";

export function FaqBlock({ section, ctx }) {
  const data = section.data;
  const items = faqItems(data.items);
  const heading = asText(data.heading) || ctx.tx("faqHeading", "Frequently asked questions");
  const titleId = `${section.anchor}-title`;
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId}>
      <BlockHead id={titleId} heading={heading} />
      <SiteFaqList items={items} idPrefix={section.anchor} />
    </BlockShell>
  );
}

export const faqEmpty = (data) => faqItems(data.items).length === 0;

// Questions for the page's FAQPage structured data.
export const faqEntries = (data) => faqItems(data.items);
