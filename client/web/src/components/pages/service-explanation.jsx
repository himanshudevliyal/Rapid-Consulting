import { explanationLayouts } from "@/lib/pages/explanation-layouts";
import { Html, Icon } from "./content-primitives";
export function serviceExplanationRole(page, section) {
  return explanationLayouts[`${page.locale}/${page.id}`]?.[section.id];
}

// A leading "1. " in a step's heading is the old way of numbering; the
// numbered row (styles/b2b.css) draws its own number.
const withoutNumber = (block) => block.replace(/(<h3\b[^>]*>)\s*\d+[.)]\s*/, "$1");

/** Layout only: source headings, paragraphs and links remain authoritative. */
export function ServiceExplanation({ section, role }) {
  const blocks = section.html.split(/(?=<h3\b)/);
  const headed = blocks.filter((b) => b.startsWith("<h3"));
  const icons = ["certificate", "gear", "leaf", "chart-line-up"];
  const steps = role !== "benefits";
  const items = headed.map((block, i) => (
    <article key={i}>
      {role === "benefits" && <Icon name={icons[i] || "target"} />}
      <Html html={steps ? withoutNumber(block) : block} className="b2b-prose" />
    </article>
  ));
  return (
    <div
      className={`service-explanation service-explanation-${role}`}
      data-component="ServiceExplanation"
    >
      {blocks
        .filter((b) => !b.startsWith("<h3"))
        .map((b, i) => (
          <Html html={b} key={`intro-${i}`} className="b2b-prose" />
        ))}
      {steps ? (
        <ol className="service-process-steps">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ol>
      ) : (
        <div className="service-benefit-grid">{items}</div>
      )}
    </div>
  );
}
