// Dates for live sessions: always shown in Indian Standard Time.
const ZONE = "Asia/Kolkata";
const TAGS = { en: "en-IN", hi: "hi-IN" };
const DEFAULT_MINUTES = 60;

const parse = (value) => {
  const date = value ? new Date(value) : null;
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

export function formatSessionDate(startsAt, locale = "en") {
  const date = parse(startsAt);
  if (!date) return "";
  return new Intl.DateTimeFormat(TAGS[locale] ?? TAGS.en, {
    timeZone: ZONE,
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatSessionTime(startsAt, locale = "en") {
  const date = parse(startsAt);
  if (!date) return "";
  const time = new Intl.DateTimeFormat(TAGS[locale] ?? TAGS.en, {
    timeZone: ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
  return `${time} IST`;
}

// When the session ends (start + duration; an hour when no duration is given).
export function sessionEndsAt(startsAt, durationMinutes) {
  const date = parse(startsAt);
  if (!date) return null;
  return new Date(date.getTime() + (Number(durationMinutes) > 0 ? Number(durationMinutes) : DEFAULT_MINUTES) * 60000);
}

// A session the API still calls "upcoming" may have started since the page was
// cached; the call to join is retired as soon as it has begun.
export function hasStarted(startsAt, now = Date.now()) {
  const date = parse(startsAt);
  return !!date && date.getTime() <= now;
}

// Only web links are ever put on a button.
export const isWebUrl = (value) => /^https?:\/\//i.test(String(value ?? "").trim());

// The state to show now: "upcoming" turns into "closed" once the start time has passed.
export const effectiveState = (session, now = Date.now()) =>
  session.state === "upcoming" && hasStarted(session.startsAt, now) ? "closed" : session.state;
