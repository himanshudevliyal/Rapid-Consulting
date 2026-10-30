import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Html } from "@/components/common/html";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { LIME_BUTTON } from "@/components/pages/b2b-buttons";

// Editor HTML in which a paragraph made of one link only ("<p><a href=...>Label</a></p>")
// is a button: "#enquire" opens the enquiry drawer for this service, any other
// address is a link button. A trailing arrow in the label ("->" or "↗") is drawn as an
// icon. Everything else is shown as ordinary text. The words stay in the record.
const ACTION = /<p>\s*<a\b[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>\s*<\/p>/gi;

export function splitActions(html = "") {
  const source = String(html ?? "");
  const parts = [];
  let last = 0;
  for (const match of source.matchAll(ACTION)) {
    if (match.index > last) parts.push({ type: "html", html: source.slice(last, match.index) });
    const label = match[2].replace(/<[^>]+>/g, "").trim();
    const arrow = /[↗]\s*$/.test(label) ? "up" : /[→]\s*$/.test(label) ? "right" : "";
    parts.push({ type: "action", href: match[1], label: label.replace(/\s*[→↗]\s*$/, ""), arrow });
    last = match.index + match[0].length;
  }
  if (last < source.length) parts.push({ type: "html", html: source.slice(last) });
  return parts;
}

// `arrow` is the icon of a label that does not end in → or ↗ ("right" by default).
export function ActionHtml({ html, service, source = "service-section", className = "b2b-prose", buttonClass = LIME_BUTTON, arrow = "right" }) {
  const parts = splitActions(html);
  const name = service?.h1 || service?.title;
  return parts.map((part, index) => {
    if (part.type === "html") return <Html key={index} html={part.html} className={className} />;
    const Icon = (part.arrow || arrow) === "up" ? ArrowUpRight : ArrowRight;
    const content = (
      <>
        {part.label}
        <Icon className="size-4" aria-hidden="true" />
      </>
    );
    return (
      <div key={index} className="mt-5">
        {part.href === "#enquire" || !part.href ? (
          <EnquiryTrigger className={buttonClass} source={source} serviceName={name}>
            {content}
          </EnquiryTrigger>
        ) : (
          <a className={buttonClass} href={part.href}>
            {content}
          </a>
        )}
      </div>
    );
  });
}
