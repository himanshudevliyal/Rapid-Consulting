import { cn } from "@/lib/utils";
import { H2, Plain } from "./shared";

// Small building blocks shared by the batch-2 blocks (server-safe, no hooks).

// Eyebrow (rust small caps) + H2 + intro. `center` for centred bands, `navy` on dark bands.
export function BandHead({ id, eyebrow, heading, intro, center = false, navy = false, className }) {
  if (!eyebrow && !heading && !intro) return null;
  return (
    <header className={cn("max-w-[68ch]", center && "mx-auto text-center", className)}>
      {eyebrow && <p className={cn("wc2-eyebrow !m-0", navy && "wc2-eyebrow--on-navy")}>{eyebrow}</p>}
      {heading && (
        <H2
          id={id}
          className={cn(
            "!text-[clamp(26px,2.9vw,38px)] !leading-[1.15] !tracking-[-0.03em]",
            eyebrow && "!mt-3",
            navy && "!text-white",
          )}
        >
          {heading}
        </H2>
      )}
      {intro && <Plain className={cn("!text-base", heading && "mt-4", navy && "!text-white/85")}>{intro}</Plain>}
    </header>
  );
}

// The lime action button class for links (the same look as the enquiry buttons).
export const LINK_BUTTON =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#eaff6b] px-6 py-2.5 text-sm font-semibold !text-[#09263e] no-underline transition-colors hover:bg-[#dcf24f] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2";

// Item widths for a carousel: two per view inside the rail column, three full width.
export const columnItems = (inColumn) =>
  inColumn ? "lg:basis-[calc((100%-1.25rem)/2)]" : undefined;
