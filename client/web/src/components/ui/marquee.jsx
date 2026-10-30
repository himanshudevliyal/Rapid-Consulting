import { cn } from "@/lib/utils"

// Scrolling strip (MagicUI marquee). Backwards compatible: existing callers
// keep working with { className, reverse, pauseOnHover, vertical, repeat }.
//
// Added for the revision (PDF: "Client-logo motion: pause and reduced-motion support"):
//   paused        controlled pause (a Pause / Play button sets it)
//   pauseOnFocus  also pause while anything inside has keyboard focus
//                 (defaults to the value of pauseOnHover)
//   prefers-reduced-motion: no motion at all - the first copy of the items is
//   shown still, wrapped into rows, and the repeated copies are hidden.
// The repeated copies are decorative: they are aria-hidden so screen readers
// and keyboard users meet each item once.
export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  pauseOnFocus = pauseOnHover,
  paused = false,
  children,
  vertical = false,
  repeat = 4,
  ...props
}) {
  return (
    <div
      {...props}
      data-paused={paused ? "true" : undefined}
      className={cn(
        "group flex gap-(--gap) overflow-hidden p-2 [--duration:40s] [--gap:1rem]",
        {
          "flex-row motion-reduce:flex-wrap motion-reduce:justify-center": !vertical,
          "flex-col": vertical,
        },
        className
      )}>
      {Array(repeat)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            aria-hidden={i > 0 ? "true" : undefined}
            {...(i > 0 ? { inert: true } : {})}
            className={cn("flex shrink-0 justify-around gap-(--gap)", {
              "animate-marquee flex-row motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:justify-center": !vertical,
              "animate-marquee-vertical flex-col motion-reduce:animate-none": vertical,
              "group-hover:[animation-play-state:paused]": pauseOnHover,
              "group-focus-within:[animation-play-state:paused]": pauseOnFocus,
              "[animation-play-state:paused]": paused,
              "[animation-direction:reverse]": reverse,
              // reduced motion: one still copy only
              "motion-reduce:hidden": i > 0,
            })}>
            {children}
          </div>
        ))}
    </div>
  );
}
