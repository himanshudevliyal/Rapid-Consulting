import { JsonLd } from "@/components/common/json-ld";
import { SectionHeading } from "@/components/home/section-heading";
import { WRAP } from "@/components/home/styles";
import { stripTags } from "@/lib/content/adapters";
import { rewriteContentLinks } from "@/lib/page-routes";
import { parseFaqContent } from "@/lib/pages/faq";
import { BTN_LIME } from "@/components/home/styles";
import { hasHtml } from "@/lib/content/site-page-adapters";
import { localHref, rows, text as str } from "@/lib/content/managed-text";
import { HomeFaqList } from "./home-faq-list";

const ITEM_IDS = ["subsidies", "both", "when", "name"];

const escapeHtml = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * Home FAQ: heading on the left, accordion on the right (first question open).
 * English shows the Figma questions (lib/pages/home-copy.js). Hindi keeps the
 * approved Hindi FAQ of the home page content (`faqSection`), because the new
 * questions have no approved Hindi yet. The FAQPage structured data is built
 * from exactly the questions shown here.
 */
export function HomeFaq({ text, faqSection, locale, data }) {
  let items;
  let cta = null;
  let heading = { eyebrow: text("homeA.faq.eyebrow"), title: text("homeA.faq.title"), intro: text("homeA.faq.intro") };
  // The managed page's questions (a question without an answer is listed closed).
  const managedItems = rows(data?.items).filter((item) => str(item.question));
  if (managedItems.length) {
    items = managedItems.map((item, index) => ({
      id: `q-${index}`,
      question: str(item.question),
      answerHtml: hasHtml(item.answer_html) ? rewriteContentLinks(str(item.answer_html)) : "",
    }));
    if (str(data.cta_label)) cta = { label: str(data.cta_label), href: localHref(data.cta_href, locale) };
  } else if (locale === "hi" && faqSection?.html) {
    items = parseFaqContent(faqSection.html)
      .blocks.filter((block) => block.kind === "question")
      .map((block, index) => ({
        id: block.id || `q-${index}`,
        question: stripTags(block.questionHtml),
        answerHtml: rewriteContentLinks(block.answerHtml),
      }));
    if (items.length) heading = { eyebrow: text("homePage.labels.faq"), title: faqSection.title, intro: undefined };
  }
  if (!items?.length) {
    items = ITEM_IDS.map((id) => ({
      id,
      question: text(`homeA.faq.items.${id}.q`),
      answerHtml: `<p>${escapeHtml(text(`homeA.faq.items.${id}.a`))}</p>`,
    }));
  }

  return (
    <section id="faq" aria-labelledby="home-faq-title" className="scroll-mt-24 bg-[#f1f5f2] py-12 sm:py-16 lg:py-20">
      {items.some((item) => item.answerHtml) && (
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: items.filter((item) => item.answerHtml).map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: stripTags(item.answerHtml) },
          })),
        }}
      />
      )}
      <div className={`${WRAP} grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14`}>
        <div>
          <SectionHeading
            id="home-faq-title"
            eyebrow={heading.eyebrow}
            title={heading.title}
            intro={heading.intro}
          />
          {cta?.href && (
            <div className="mt-6">
              <a href={cta.href} className={BTN_LIME}>
                {cta.label}
              </a>
            </div>
          )}
        </div>
        <HomeFaqList items={items} />
      </div>
    </section>
  );
}
