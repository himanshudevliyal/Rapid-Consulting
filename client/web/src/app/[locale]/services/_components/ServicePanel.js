import { ActionHtml } from "./ActionHtml";
import { LIME_BUTTON } from "@/components/pages/b2b-buttons";

// A rich-text section on its own panel: dark navy ("panel_navy": cost and time,
// the closing "next step") or light grey ("panel_grey": what you send / what we
// do). It draws its own heading. Paragraphs that hold a single link become
// buttons (see ActionHtml); everything else is the section's own HTML.
export function ServicePanel({ section, service, titleId, eyebrow, tone = "navy" }) {
  const navy = tone === "navy";
  return (
    <div
      className={`rounded-3xl p-6 sm:p-9 ${navy ? "bg-[#09263e] text-white" : "bg-[#f1f3f2]"}`}
      data-component="ServicePanel"
      data-tone={tone}
    >
      {eyebrow && <p className={`b2b-eyebrow ${navy ? "b2b-eyebrow--on-navy" : ""}`}>{eyebrow}</p>}
      <h2 id={titleId} className={`b2b-h2 ${navy ? "b2b-h2--on-navy" : ""}`}>
        {section.title}
      </h2>
      <div className="mt-4">
        <ActionHtml
          html={[section.intro_html, section.html, section.outro_html].filter(Boolean).join("")}
          service={service}
          source={`service-${section.key}`}
          className={`b2b-prose ${navy ? "b2b-prose--on-navy" : ""}`}
          buttonClass={LIME_BUTTON}
        />
      </div>
    </div>
  );
}
