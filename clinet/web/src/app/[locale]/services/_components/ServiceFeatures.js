import { Html } from "@/components/common/html";
import { heading } from "./escape";

// Intro text followed by a checklist of features.
export function ServiceFeatures({ section }) {
  return (
    <div className="service-explanation service-explanation-features" data-component="ServiceFeatures">
      <Html html={section.intro_html} />
      <ul className="service-feature-list">
        {section.items.map((item, index) => (
          <li key={item.key || index}>
            <span aria-hidden="true">✓</span>
            <Html html={heading(3, item.title, item.key) + item.html} />
          </li>
        ))}
      </ul>
      <Html html={section.outro_html} />
    </div>
  );
}
