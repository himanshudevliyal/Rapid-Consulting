// Simple brand glyphs (the icon library no longer ships brand logos).
// Decorative: the link around them carries the accessible name.
const common = { viewBox: "0 0 24 24", width: 20, height: 20, "aria-hidden": "true", focusable: "false" };

const ICONS = {
  facebook: (
    <svg {...common} fill="currentColor">
      <path d="M13.6 21v-7.9h2.7l.4-3.1h-3.1V8.1c0-.9.3-1.5 1.6-1.5h1.7V3.8c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V10H7.8v3.1h2.7V21h3.1Z" />
    </svg>
  ),
  instagram: (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
    </svg>
  ),
  youtube: (
    <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10 9.2v5.6l4.8-2.8L10 9.2Z" fill="currentColor" />
    </svg>
  ),
  linkedin: (
    <svg {...common} fill="currentColor">
      <rect x="3.5" y="9" width="3.6" height="11.5" />
      <circle cx="5.3" cy="5.2" r="2" />
      <path d="M10 9h3.4v1.6c.5-1 1.8-1.9 3.6-1.9 3.5 0 4.1 2.3 4.1 5.3v6.5h-3.6v-5.8c0-1.4 0-3.1-1.9-3.1s-2.2 1.5-2.2 3v5.9H10V9Z" />
    </svg>
  ),
};

export function SocialIcon({ id }) {
  return ICONS[id] ?? null;
}
