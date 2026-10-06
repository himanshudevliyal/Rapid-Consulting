// Icon names that exist on the website (public/assets/icons/<name>.svg).
export const serviceIcons = [
  "bank",
  "certificate",
  "chart-line-up",
  "chat-circle-dots",
  "clipboard-text",
  "factory",
  "file-text",
  "gear",
  "hand-coins",
  "headset",
  "leaf",
  "list-checks",
  "magnifying-glass",
  "megaphone",
  "paper-plane-tilt",
  "recycle",
  "shield-check",
  "stamp",
  "target",
  "users-three",
  "warehouse",
  "buildings",
];

// Service sections: the role decides which block renders the section on the website.
export const sectionRoles = [
  { value: "content", label: "Rich text", help: "Normal text: overview, eligibility, documents, costs…", items: false },
  { value: "features", label: "Features list", help: "Intro + a list of features.", items: true },
  { value: "benefits", label: "Benefit cards", help: "Intro + benefit cards.", items: true },
  { value: "process", label: "Process steps", help: "Intro + numbered steps.", items: true },
  { value: "faq", label: "FAQ", help: "Questions and answers.", items: true },
  { value: "service_cards", label: "Service cards", help: "Links to services inside the text show as cards (for family pages).", items: false },
  { value: "hero_benefit", label: "Hero benefit", help: "Shown in the top banner instead of the intro.", items: false },
  { value: "cta", label: "Call to action", help: "Closing section with the contact button.", items: false },
];
