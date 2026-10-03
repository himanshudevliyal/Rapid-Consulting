import { ContentCard } from "@/components/pages/content-card";
import { Html } from "@/components/pages/content-primitives";
import { cardCopy, linkedContentIds } from "@/lib/pages/card-copy";

export const INDUSTRY_IDS = ["I01", "I02", "I03", "I04"];

export const paragraphs = (html) =>
  [...html.matchAll(/<p(?:\s[^>]*)?>[\s\S]*?<\/p>/g)].map((m) => m[0]);

// html paragraph -> ContentCard (agar record mile), warna plain Html
export function renderCard({ html, records, page, t, has }) {
  const id = linkedContentIds(html)[0];
  const item = records.find((p) => p.id === id);
  return item ? (
    <ContentCard
      key={id}
      page={item}
      locale={page.locale}
      t={t}
      has={has}
      copy={cardCopy(html, item.href)}
    />
  ) : (
    <Html key={html} html={html} />
  );
}
