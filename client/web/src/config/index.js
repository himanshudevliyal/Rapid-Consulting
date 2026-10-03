const trimSlash = (value) => (value ?? "").replace(/\/+$/, "");

const config = {
  // Fastify API, including the /v1 prefix.
  api_base: trimSlash(process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/v1"),
  // Where files saved by the API (service pictures, og images) are served.
  file_base: trimSlash(process.env.NEXT_PUBLIC_FILE_BASE),
  // Public origin of this website (canonical URLs, hreflang, sitemap, Open Graph).
  next_public_url: trimSlash(process.env.NEXT_PUBLIC_URL || "http://localhost:3000"),
  // Search indexing stays off until the production URL map is approved.
  allow_indexing: process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true",
  // Seconds a service page is cached before it is refreshed from the API.
  services_revalidate_seconds: Number(process.env.SERVICES_REVALIDATE_SECONDS ?? 300),
  // Server only: shared secret for POST /api/revalidate.
  revalidate_secret: process.env.REVALIDATE_SECRET,
};

export default config;
