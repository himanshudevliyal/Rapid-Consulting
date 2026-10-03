import { explanationLayouts } from "@/lib/pages/explanation-layouts";
import { Html, Icon } from "./content-primitives";
export function serviceExplanationRole(page, section) {
  return explanationLayouts[`${page.locale}/${page.id}`]?.[section.id];
}
/** Layout only: source headings, paragraphs and links remain authoritative. */
export function ServiceExplanation({ section, role }) {
  const blocks = section.html.split(/(?=<h3\b)/);
  const headed = blocks.filter((b) => b.startsWith("<h3"));
  const icons = ["certificate", "gear", "leaf", "chart-line-up"];
  return (
    <div
      className={`service-explanation service-explanation-${role}`}
      data-component="ServiceExplanation"
    >
      {blocks
        .filter((b) => !b.startsWith("<h3"))
        .map((b, i) => (
          <Html html={b} key={`intro-${i}`} />
        ))}
      <div
        className={
          role === "benefits" ? "service-benefit-grid" : "service-process-steps"
        }
      >
        {headed.map((block, i) => (
          <article key={i}>
            {role === "benefits" && <Icon name={icons[i] || "target"} />}
            <Html html={block} />
          </article>
        ))}
      </div>
    </div>
  );
}
