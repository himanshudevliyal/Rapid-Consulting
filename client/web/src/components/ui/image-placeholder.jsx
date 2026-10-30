import { isValidElement } from "react";
import { ImageIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export const IMAGE_PLACEHOLDER_LABEL = "Placeholder image - final photography to be supplied by Rapid";

// A clearly labelled stand-in for photography that Rapid still has to supply
// (PDF: "Replace the repeated adviser portrait with suitable, clearly labelled
// placeholders"). Neutral, on the navy / white palette, no portrait, no
// repeated stock image. Server- and client-safe (no hooks).
//
//   <ImagePlaceholder ratio="16/9" label="Placeholder - fabrication unit photo" />
//   <ImagePlaceholder className="absolute inset-0" />      // fills a positioned parent
//   <ImagePlaceholder icon={Factory} />                    // icon: component or element
//
// Without `ratio` it fills its parent (h-full w-full). `children` render
// below the label (for example a caption).
export function ImagePlaceholder({ label = IMAGE_PLACEHOLDER_LABEL, ratio, icon, className, children, style, ...props }) {
  const Icon = icon ?? ImageIcon;
  const iconNode = isValidElement(Icon) ? Icon : <Icon className="size-7" aria-hidden="true" />;

  return (
    <div
      role="img"
      aria-label={label}
      data-slot="image-placeholder"
      {...props}
      style={{ ...(ratio ? { aspectRatio: String(ratio).replace(/\s/g, "") } : null), ...style }}
      className={cn(
        "relative isolate flex w-full flex-col items-center justify-center gap-3 overflow-hidden border border-dashed border-[#09263e]/25 bg-[#e8efec] p-4 text-center text-[#09263e]",
        !ratio && "h-full min-h-[8rem]",
        className,
      )}
    >
      {/* quiet diagonal hatch so it reads as "to be replaced", not as a broken image */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-60"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(9,38,62,0.05) 0, rgba(9,38,62,0.05) 1px, transparent 1px, transparent 14px)",
        }}
      />
      <span className="flex size-12 items-center justify-center rounded-full bg-white/80 text-[#1f5d57] shadow-sm" aria-hidden="true">
        {iconNode}
      </span>
      <span aria-hidden="true" className="max-w-[28ch] text-xs font-semibold leading-snug tracking-wide text-[#09263e]/75">
        {label}
      </span>
      {children}
    </div>
  );
}

export default ImagePlaceholder;
