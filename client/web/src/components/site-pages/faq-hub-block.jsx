import { asArray, asText, faqTopics } from "@/lib/content/site-page-adapters";
import { FaqHub } from "./faq-hub";
import { BlockShell } from "./shared";

// The block "FAQ hub": topics with their questions. The look is in faq-hub.jsx.
// A topic may also carry (optional, not yet in the block registry):
//   tagline    one line under the topic title
//   cta_label, cta_href    the button at the end of the topic
// They are read when present and ignored otherwise.
const extrasOf = (data, topics) => {
  const raw = asArray(data.topics);
  return Object.fromEntries(
    topics.map((topic) => {
      const entry = raw.find((candidate) => asText(candidate?.title) === topic.title) ?? {};
      return [topic.key, { tagline: asText(entry.tagline), ctaLabel: asText(entry.cta_label), ctaHref: asText(entry.cta_href) }];
    }),
  );
};

export function FaqHubBlock({ section, ctx }) {
  const data = section.data;
  const topics = faqTopics(data.topics);
  const heading = asText(data.heading) || ctx.tx("faqHeading", "Frequently asked questions");
  const titleId = `${section.anchor}-title`;
  // The page's own sticky menu (masthead nav_label) wins over the hub's "Jump to:" bar.
  const masthead = ctx.page.sections?.find((s) => s.type === "masthead" && s.visible);
  const pageNav = Boolean(asText(masthead?.data?.nav_label));
  return (
    <BlockShell section={section} ctx={ctx} labelledBy={titleId} bare>
      <h2 id={titleId} className="sr-only">
        {heading}
      </h2>
      <FaqHub
        topics={topics}
        initialTopic={ctx.topic}
        idPrefix={section.anchor}
        extras={extrasOf(data, topics)}
        showNav={!pageNav}
        pageId={ctx.page.pageKey || undefined}
        pageTitle={ctx.page.h1}
      />
    </BlockShell>
  );
}

export const faqHubEmpty = (data) => faqTopics(data.topics).length === 0;

// Questions of every topic for the page's FAQPage structured data.
export const faqHubEntries = (data) => faqTopics(data.topics).flatMap((topic) => topic.items);
