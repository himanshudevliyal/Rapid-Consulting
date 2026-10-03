import { Html } from "@/components/common/html";
import { Icon } from "@/components/common/icon";
import { heading } from "./escape";

const ICONS = ["certificate", "gear", "leaf", "chart-line-up"];

// Intro text followed by one card per benefit.
export function ServiceBenefits({ section }) {
  return (
    <div className="service-explanation service-explanation-benefits" data-component="ServiceBenefits">
      <Html html={section.intro_html} />
      <div className="service-benefit-grid">
        {section.items.map((item, index) => (
          <article key={item.key || index}>
            <Icon name={ICONS[index] || "target"} />
            <Html html={heading(3, item.title, item.key) + item.html} />
          </article>
        ))}
      </div>
      <Html html={section.outro_html} />
    </div>
  );
}
