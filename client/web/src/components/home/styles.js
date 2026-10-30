// Shared class names of the Home page (Option A). Headings and paragraphs carry
// "!" modifiers because the global h1-h4 / p rules would otherwise win.

export const EYEBROW =
  "mb-3! mt-0! block text-xs font-bold uppercase tracking-[0.16em] text-[#922e0c]";

export const H2 =
  "m-0! max-w-none! text-[1.75rem]! font-semibold! leading-[1.15]! tracking-tight! text-[#09263e]! sm:text-4xl! lg:text-[2.5rem]!";

export const LEAD = "mb-0! mt-4! max-w-2xl text-base leading-7 text-slate-700 sm:text-[17px] sm:leading-8";

const FOCUS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2";

// Lime action (primary).
export const BTN_LIME = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#eaff6b] px-6 py-2 text-[15px] font-semibold text-[#09263e]! no-underline transition-colors hover:bg-[#dcf24f] ${FOCUS}`;

// Outlined navy (secondary).
export const BTN_OUTLINE = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#09263e] bg-transparent px-6 py-2 text-[15px] font-semibold text-[#09263e]! no-underline transition-colors hover:bg-[#09263e]/5 ${FOCUS}`;

// White button for navy panels.
export const BTN_WHITE = `inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-2 text-[15px] font-semibold text-[#09263e]! no-underline transition-colors hover:bg-[#eef3f1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#09263e]`;

// A section's inner width (matches the site container).
export const WRAP = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";
