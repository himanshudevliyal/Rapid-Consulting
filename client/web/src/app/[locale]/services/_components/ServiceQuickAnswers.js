import { Html } from "@/components/common/html";

// "Quick answers": the grey card that opens the body. One row per question
// (the question in bold on the left, the answer on the right); a link inside an
// answer that points at a section of this page becomes a small jump link.
// Records without items but with a table in `html` get the same card.
export function ServiceQuickAnswers({ section, titleId, eyebrow }) {
  const items = (section.items ?? []).filter((item) => item.title);
  return (
    <div className="b2b-qa" data-component="ServiceQuickAnswers">
      <div className="b2b-sec__head">
        {eyebrow && <p className="b2b-eyebrow">{eyebrow}</p>}
        <h2 id={titleId} className="b2b-h2">
          {section.title}
        </h2>
      </div>
      <Html html={section.intro_html} className="b2b-prose" />
      {items.length > 0 ? (
        <dl className="b2b-qa__table">
          {items.map((item, index) => (
            <div className="b2b-qa__row" key={item.key || index}>
              <dt>{item.title}</dt>
              <dd>
                <Html html={item.html} className="b2b-prose" />
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <Html html={section.html} className="b2b-prose b2b-qa__html" />
      )}
      <Html html={section.outro_html} className="b2b-prose b2b-qa__note" />
    </div>
  );
}
