// Form <-> API conversion for sessions (webinars).

export const emptySession = {
  title: "",
  slug: "",
  topic: "",
  audience: "",
  summary: "",
  speaker_name: "",
  speaker_title: "",
  starts_at: "",
  duration_minutes: "",
  registration_url: "",
  registration_open: true,
  recording_url: "",
  related_resources: "",
  cover_image: "",
  is_active: true,
  sort_order: 0,
};

const pad = (n) => String(n).padStart(2, "0");

// ISO timestamp -> value for <input type="datetime-local"> (local time).
const toLocalInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export const toFormValues = (item) => {
  if (!item) return emptySession;
  return {
    title: item.title ?? "",
    slug: item.slug ?? "",
    topic: item.topic ?? "",
    audience: item.audience ?? "",
    summary: item.summary ?? "",
    speaker_name: item.speaker_name ?? "",
    speaker_title: item.speaker_title ?? "",
    starts_at: toLocalInput(item.starts_at),
    duration_minutes: item.duration_minutes ? String(item.duration_minutes) : "",
    registration_url: item.registration_url ?? "",
    registration_open: item.registration_open ?? true,
    recording_url: item.recording_url ?? "",
    related_resources: item.related_resources ?? "",
    cover_image: item.cover_image ?? "",
    is_active: item.is_active ?? true,
    sort_order: item.sort_order ?? 0,
  };
};

// Form values -> request body. An empty slug is left out: on create the
// server makes one from the title, on edit the current slug stays. Empty
// date / minutes are sent as null so the server clears them.
export const buildPayload = (values) => {
  const payload = {
    title: values.title.trim(),
    topic: values.topic.trim(),
    audience: values.audience.trim(),
    summary: values.summary,
    speaker_name: values.speaker_name.trim(),
    speaker_title: values.speaker_title.trim(),
    starts_at: values.starts_at ? new Date(values.starts_at).toISOString() : null,
    duration_minutes: values.duration_minutes.trim() ? Number(values.duration_minutes) : null,
    registration_url: values.registration_url.trim(),
    registration_open: values.registration_open,
    recording_url: values.recording_url.trim(),
    related_resources: values.related_resources
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n"),
    cover_image: values.cover_image.trim(),
    is_active: values.is_active,
    sort_order: Number(values.sort_order) || 0,
  };
  const slug = values.slug.trim();
  if (slug) payload.slug = slug;
  return payload;
};
