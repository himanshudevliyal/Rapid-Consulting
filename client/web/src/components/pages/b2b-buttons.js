// Button looks shared by the service page, the industry page and the industries
// index: lime action button, outlined navy secondary, and the same two on navy.
const BASE =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold no-underline transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

export const LIME_BUTTON = `${BASE} bg-[#eaff6b] text-[#09263e] hover:bg-[#dcf24f] focus-visible:ring-[#09263e]`;
export const OUTLINE_BUTTON = `${BASE} border border-[#09263e]/40 bg-transparent text-[#09263e] hover:bg-white focus-visible:ring-[#09263e]`;
export const LIME_ON_NAVY = `${BASE} bg-[#eaff6b] text-[#09263e] hover:bg-[#dcf24f] focus-visible:ring-[#eaff6b] focus-visible:ring-offset-[#09263e]`;
export const OUTLINE_ON_NAVY = `${BASE} border border-white/60 bg-transparent text-white hover:bg-white/10 focus-visible:ring-[#eaff6b] focus-visible:ring-offset-[#09263e]`;
