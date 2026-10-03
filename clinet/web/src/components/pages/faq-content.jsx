import { rewriteContentLinks } from "@/lib/page-routes";
import { parseFaqContent } from "@/lib/pages/faq";
import { Html } from "./content-primitives";
import { FaqAccordion } from "./faq-accordion";

/** One FAQ markup owner across every content template: prose stays prose,
 * consecutive question/answer pairs become a shadcn accordion. */
export function FaqContent({ html }) {
  const { blocks } = parseFaqContent(html);
  const groups = [];
  for (const block of blocks) {
    const last = groups.at(-1);
    if (block.kind === "question" && last?.kind === "questions") last.items.push(block);
    else groups.push(block.kind === "question" ? { kind: "questions", items: [block] } : block);
  }
  return (
    <div className="faq-list">
      {groups.map((group, index) =>
        group.kind === "html" ? (
          group.html.trim() && <Html key={index} html={group.html} />
        ) : (
          <FaqAccordion
            key={index}
            items={group.items.map((item, i) => ({
              id: item.id ?? null,
              value: item.id || `q-${index}-${i}`,
              questionHtml: item.questionHtml,
              answerHtml: rewriteContentLinks(item.answerHtml),
            }))}
          />
        ),
      )}
    </div>
  );
}
