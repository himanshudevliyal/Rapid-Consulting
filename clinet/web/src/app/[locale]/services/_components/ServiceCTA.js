import { ContextActions } from "@/components/common/context-actions";
import { Html } from "@/components/common/html";

// "cta" role section: its text plus the same contact actions.
export function ServiceCTA({ section, t }) {
  return (
    <>
      <Html html={section.html} />
      <ContextActions t={t} />
    </>
  );
}
