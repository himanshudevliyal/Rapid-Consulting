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
  { value: "faq", label: "FAQ", help: "Questions and answers. Intro text = the short paragraph under the heading (left column), different for every service.", items: true },
  { value: "service_cards", label: "Service cards", help: "Links to services inside the text show as cards (for family pages).", items: false },
  { value: "hero_benefit", label: "Hero benefit", help: "Shown in the top banner instead of the intro.", items: false },
  { value: "cta", label: "Call to action", help: "Closing section with the contact button.", items: false },
  // Roles of the Figma service page. `parts` lists the fields the editor shows:
  // intro, html (content), items, outro. A paragraph that is only a link, e.g.
  // <p><a href="#enquire">Label</a></p>, becomes a button ("#enquire" opens the enquiry form).
  { value: "quick_answers", label: "Quick answers", help: "Grey card: one row per question (title) and answer. Closing text = the footnote.", items: true },
  { value: "eligibility", label: "Eligibility (three factors)", help: "Numbered factors (title + text) under a picture you upload for this page (for example a plan or diagram). Closing text = the callout and link.", items: true },
  { value: "stuck_file", label: "Stuck file panel", help: "Navy panel. Content = the text, Intro = lead-in of the list, items = the list, closing text = what happens next + the button (a link-only paragraph).", items: true, parts: ["html", "intro", "items", "outro"] },
  { value: "hero_points", label: "Hero icon rows", help: "The three icon rows in the hero (title + text). Not shown as a body section.", items: true },
  { value: "video", label: "Hero video card", help: "Title = video title, Content = description, Intro = thumbnail caption (e.g. 3:00 · Captions on). Not shown as a body section.", items: false, parts: ["html", "intro"] },
  { value: "cases", label: "Our work (case studies)", help: "Heading, lead-in (Intro) and closing link for the case studies that belong to this service. Hidden when there are none.", items: false, parts: ["intro", "outro"] },
  { value: "panel_navy", label: "Dark panel", help: "Rich text on a dark navy panel. A link-only paragraph becomes a button.", items: false },
  { value: "panel_grey", label: "Grey panel", help: "Rich text on a light grey panel. A link-only paragraph becomes a button.", items: false },
  { value: "cards", label: "Cards", help: "Intro, cards (title + text; a link in the text makes the whole card a link), closing text.", items: true },
  { value: "reviews", label: "Client reviews", help: "Rating box (rating, number of reviews, source) and review cards for this service. Intro = the line under the heading; closing text = a link-only paragraph for “View all reviews”.", items: true, parts: ["intro", "items", "outro"] },
];

// Scheme page sections: the roles a scheme page knows (same section shape as a service).
// The role decides the block: tiles, navy "watch out" panel, numbered claim steps, FAQs ...
export const schemeSectionRoles = [
  { value: "content", label: "Rich text", help: "Normal text with a heading: for example Who can apply, What you get, with tables and lists.", items: false },
  { value: "quick_answers", label: "Quick answers", help: "Grey card: one row per question (title) and answer. Closing text = the footnote.", items: true },
  { value: "cards", label: "Cards (Does it fit?)", help: "A grid of cards, each with a title and a short text. Closing text can hold a \"Not covered\" note.", items: true },
  { value: "benefits", label: "Benefit cards", help: "Intro + benefit cards.", items: true },
  { value: "panel_navy", label: "Dark panel (Watch out)", help: "Rich text on a dark navy panel. A link-only paragraph becomes a button.", items: false },
  { value: "panel_grey", label: "Grey panel", help: "Rich text on a light grey panel. A link-only paragraph becomes a button.", items: false },
  { value: "process", label: "Steps (How it's claimed)", help: "Intro + numbered steps; each step has a title and text.", items: true },
  { value: "faq", label: "FAQ", help: "Questions and answers.", items: true },
  { value: "cta", label: "Call to action", help: "Closing section with the contact button.", items: false },
];
