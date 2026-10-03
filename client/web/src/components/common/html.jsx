import { cn } from "@/lib/utils";

// Renders trusted HTML from the service API (compiled from the reviewed
// manuscripts / written in the admin panel) with the shared prose styles.
export function Html({ html, className = "", as: Component = "div" }) {
  if (!html) return null;
  return <Component className={cn("prose", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
