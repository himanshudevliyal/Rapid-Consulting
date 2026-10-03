import config from "@/config";

// Absolute URL for a file saved by the API ("public/images/x.png",
// "public\\images\\x.png" or an absolute URL). Returns null when there is no
// usable path, so callers can fall back to a default image.
export const getFileUrl = (path) => {
  if (!path || typeof path !== "string") return null;
  const cleaned = path.trim().replaceAll("\\", "/");
  if (!cleaned) return null;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  if (!config.file_base) return `/${cleaned.replace(/^\/+/, "")}`;
  return `${config.file_base}/${cleaned.replace(/^\/+/, "")}`;
};
