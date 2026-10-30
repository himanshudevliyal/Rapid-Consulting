import { endpoints } from "@/utils/endpoints";
import http from "@/utils/http";
import { cachedFor } from "@/utils/api-helpers";

// The central navigation setting (header destinations and footer columns),
// edited in the admin panel. Cache tag refreshed by POST /api/revalidate when
// the setting is saved.
export const NAVIGATION_TAG = "navigation";

// The public endpoint returns the saved value, or {} when nothing is saved.
// Tolerates a wrapped body ({ data } / { value }).
const unwrap = (body) => {
  if (!body || typeof body !== "object") return null;
  if (Array.isArray(body.primary) || Array.isArray(body.footer)) return body;
  if (body.data && typeof body.data === "object") return unwrap(body.data);
  if (body.value && typeof body.value === "object") return unwrap(body.value);
  return null;
};

// The saved navigation value, or null when there is none or the API cannot be
// reached (the website then uses its built-in default navigation).
export const fetchNavigationSettings = async () => {
  try {
    return unwrap(await http().get(endpoints.siteSettings.navigation, cachedFor(NAVIGATION_TAG)));
  } catch {
    return null;
  }
};
