// Plain text (e.g. an item title from the API) placed inside trusted HTML.
export const escapeHtml = (value = "") =>
  String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const heading = (level, title, id) =>
  `<h${level}${id ? ` id="${escapeHtml(id)}"` : ""}>${escapeHtml(title)}</h${level}>`;
