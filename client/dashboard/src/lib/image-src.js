import config from "@/config";

// Address to show for a saved image value: files uploaded through the API are
// saved as a path (public/images/...) served from the file base; a full URL,
// a /path or a data: URL is used as is.
export const imageSrc = (value) => {
  if (!value) return "";
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("/")) return value;
  return `${config.file_base}/${value}`;
};
