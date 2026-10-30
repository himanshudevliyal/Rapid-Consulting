import Link from "next/link";

import { cn } from "@/lib/utils";
import { isExternalHref, isPlainAnchor, localizeHref, safeHref } from "@/lib/content/site-page-adapters";

// Shared building blocks of the page-builder blocks (server-safe, no hooks).
// The global stylesheet styles bare h1-h3 and p with unlayered rules, so the
// text utilities here carry `!` to win over them.

// Anchored sections stop below the site header AND the sticky section bar.
export const NAV_OFFSET =
  "scroll-mt-[calc(var(--site-header-h,var(--header-height,80px))+var(--section-nav-h,0px)+16px)]!";

export const EYEBROW = "mb-2 inline-block text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]";

export const H1_CLASS =
  "!m-0 !max-w-[22ch] !text-[clamp(34px,3.7vw,48px)] !font-semibold !leading-[1.16] !tracking-[-0.04em] !text-[#09263e]";

export function H2({ id, className, children }) {
  return (
    <h2
      id={id}
      className={cn(
        "!m-0 !text-[clamp(24px,2.4vw,30px)] !font-semibold !leading-[1.25] !tracking-[-0.02em] !text-[#09263e]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function H3({ id, className, children }) {
  return (
    <h3
      id={id}
      className={cn("!m-0 !text-lg !font-semibold !leading-snug !tracking-tight !text-[#09263e]", className)}
    >
      {children}
    </h3>
  );
}

// Plain-text paragraph(s) from a text field (line breaks kept).
export function Plain({ children, className }) {
  if (!children) return null;
  return (
    <p className={cn("!m-0 whitespace-pre-line !text-[15px] !leading-7 !text-slate-600", className)}>{children}</p>
  );
}

// Heading + optional intro of a block.
export function BlockHead({ id, heading, intro, className }) {
  if (!heading && !intro) return null;
  return (
    <header className={cn("mb-6 max-w-[68ch]", className)}>
      {heading && <H2 id={id}>{heading}</H2>}
      {intro && <Plain className={cn("!text-base", heading && "mt-3")}>{intro}</Plain>}
    </header>
  );
}

// A link to a site path, another site or an anchor; renders plain children
// (no link) for an empty or unsafe address.
export function SmartLink({ href, locale, className, children, ...props }) {
  const safe = safeHref(href);
  if (!safe) return <span className={className}>{children}</span>;
  const to = localizeHref(safe, locale);
  if (isExternalHref(to)) {
    return (
      <a href={to} className={className} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
  if (isPlainAnchor(to)) {
    return (
      <a href={to} className={className} {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={to} className={className} {...props}>
      {children}
    </Link>
  );
}

// The wrapper of every block: the section element (anchor id, labelled by its
// heading) plus the page container for blocks outside the rail column.
//   ctx.inColumn - sits in the content column next to the rail
//   ctx.tone     - "plain" | "wash" band for full-width blocks
export function BlockShell({ section, ctx, labelledBy, ariaLabel, bare = false, className, children }) {
  const column = ctx.inColumn;
  const inner = column || bare ? children : <div className="container mx-auto max-w-7xl px-4">{children}</div>;
  return (
    <section
      id={section.anchor}
      aria-labelledby={labelledBy || undefined}
      aria-label={labelledBy ? undefined : ariaLabel || undefined}
      data-block={section.type}
      data-variant={section.variant || undefined}
      className={cn(
        NAV_OFFSET,
        column
          ? "border-t border-slate-200 py-9 first:border-t-0 first:pt-0"
          : bare
            ? ""
            : cn("py-12 md:py-14", ctx.tone === "wash" ? "bg-[#f4f7f5]" : "bg-white"),
        className,
      )}
    >
      {inner}
    </section>
  );
}

// Responsive card grid; the number of columns is capped in the rail column.
export function cardGridClass(columns, inColumn) {
  const wide = Math.min(Math.max(Number(columns) || 3, 1), 4);
  if (inColumn) return wide === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2";
  if (wide === 1) return "grid-cols-1";
  if (wide === 2) return "grid-cols-1 md:grid-cols-2";
  if (wide === 3) return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-1 md:grid-cols-2 xl:grid-cols-4";
}
