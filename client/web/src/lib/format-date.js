// "2026-10-03" or an ISO timestamp -> "3 October 2026" (calendar date, no time
// zone drift). Returns "" for anything that is not a date.
export function formatDate(value, locale = "en") {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return new Intl.DateTimeFormat(locale === "hi" ? "hi-IN" : "en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return "";
  }
}
