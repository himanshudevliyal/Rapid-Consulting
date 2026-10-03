import { Html } from "@/components/common/html";
import { heading } from "./escape";

// Intro text followed by the ordered working steps.
export function ServiceProcess({ section }) {
  return (
    <div className="service-explanation service-explanation-process" data-component="ServiceProcess">
      <Html html={section.intro_html} />
      <div className="service-process-steps">
        {section.items.map((item, index) => (
          <article key={item.key || index}>
            <Html html={heading(3, item.title, item.key) + item.html} />
          </article>
        ))}
      </div>
      <Html html={section.outro_html} />
    </div>
  );
}
