// Site navigation (header + footer), kept in site_settings under the key
// "navigation". Hrefs are locale-less paths; the website adds the language.

// The fixed primary destinations, in their default order. Editors can rename,
// reorder, hide and add children to them but not remove them; extra link items
// use a key that starts with "custom-".
export const NAV_PRIMARY_KEYS = [
  "approvals",
  "subsidies",
  "your-project",
  "industries",
  "work",
  "resources",
  "about",
];

export const NAV_SETTING_KEYS = ["navigation"];

export const defaultNavigation = () => ({
  primary: [
    { key: "approvals", label: "Approvals", href: "/approvals", visible: true },
    { key: "subsidies", label: "Subsidies", href: "/subsidies", visible: true },
    { key: "your-project", label: "Your project", href: "/your-project", visible: true },
    { key: "industries", label: "Industries", href: "/industries", visible: true },
    { key: "work", label: "Work", href: "/case-studies", visible: true },
    { key: "resources", label: "Resources", href: "/resources", visible: true },
    { key: "about", label: "About", href: "/about", visible: true },
  ],
  // Empty = the website uses its built-in footer.
  footer: [],
});
