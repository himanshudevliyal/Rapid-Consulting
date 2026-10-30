import { cn } from "@/lib/utils";

// Opening block of an index page (schemes, guides & articles, industries,
// services): quiet eyebrow, the page's one H1 and its intro. The breadcrumb
// above is plain, so this is the only title on the page. `children` is the
// optional picture / placeholder on the right.
export function CollectionHero({ eyebrow, title, introHtml, children, className }) {
  const hasHtml = /<[^>]+>/.test(introHtml || "");
  return (
    <div className={cn("grid items-center gap-8 lg:gap-12", children && "lg:grid-cols-2", className)}>
      <div>
        {eyebrow && (
          <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]">{eyebrow}</span>
        )}
        <h1 className="font-display text-[2.6rem] font-bold leading-[1.1] tracking-tight text-[#111] text-wrap-balance lg:text-[3rem]">
          {title}
        </h1>
        {introHtml && (
          <div className="font-body leading-relaxed text-muted-foreground">
            {hasHtml ? <div dangerouslySetInnerHTML={{ __html: introHtml }} /> : <p>{introHtml}</p>}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
