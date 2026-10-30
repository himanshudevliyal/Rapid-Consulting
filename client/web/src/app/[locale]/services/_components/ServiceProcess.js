import { Html } from "@/components/common/html";
import { heading } from "./escape";

// A leading "1. " in the title is the old way of numbering the steps; the
// numbered row draws its own number.
const withoutNumber = (title = "") => String(title).replace(/^\s*\d+[.)]\s*/, "");

// Intro text followed by the ordered working steps, as numbered rows.
export function ServiceProcess({ section }) {
  return (
    <div className="service-explanation service-explanation-process" data-component="ServiceProcess">
      <Html html={section.intro_html} className="b2b-prose" />
      <ol className="service-process-steps">
        {section.items.map((item, index) => (
          <li key={item.key || index}>
            <article>
              <Html html={heading(3, withoutNumber(item.title), item.key) + item.html} className="b2b-prose" />
            </article>
          </li>
        ))}
      </ol>
      <Html html={section.outro_html} className="b2b-prose" />
    </div>
  );
}
