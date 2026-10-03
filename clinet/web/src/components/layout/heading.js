import { cn } from "@/lib/utils";

export default function Heading({
  eyebrow,
  heading,
  subheading,
  className,
  eyebrowClassName,
  headingClassName,
  subheadingClassName,
}) {
  const hasHtml = /<[^>]+>/.test(subheading || "");

  return (
    <div className={cn("text-center", className)}>
      {eyebrow && (
        <span
          className={cn(
            "mb-2 inline-block rounded-full bg-[#eaff6b] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#09263e]",
            eyebrowClassName
          )}
        >
          {eyebrow}
        </span>
      )}

      <h2
        className={cn(
          "font-display font-bold text-foreground",
          headingClassName
        )}
      >
        {heading}
      </h2>

      {subheading && (
        <div
          className={cn(
            "font-body leading-relaxed text-muted-foreground",
            subheadingClassName
          )}
        >
          {hasHtml ? (
            <div dangerouslySetInnerHTML={{ __html: subheading }} />
          ) : (
            <p>{subheading}</p>
          )}
        </div>
      )}
    </div>
  );
}