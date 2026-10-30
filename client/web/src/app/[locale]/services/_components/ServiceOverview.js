import { Html } from "@/components/common/html";

// Rich-text section: overview, eligibility, costs, documents, sources…
// Tables get a navy header row, blockquotes and `.callout` boxes become
// callouts and ordered lists become numbered rows (all in styles/b2b.css).
export function ServiceOverview({ section }) {
  return <Html html={section.html} className="b2b-prose" />;
}
