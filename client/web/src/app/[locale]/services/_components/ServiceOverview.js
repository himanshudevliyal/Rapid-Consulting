import { Html } from "@/components/common/html";

// Rich-text section: overview, eligibility, costs, documents, sources…
export function ServiceOverview({ section }) {
  return <Html html={section.html} />;
}
