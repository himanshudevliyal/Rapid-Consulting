import { ALLOW_INDEXING, absoluteUrl } from "@/lib/site";

// Preview/review deployments stay closed to search engines. Indexing opens
// only when NEXT_PUBLIC_ALLOW_INDEXING=true on the approved production site.
export default function robots() {
  if (!ALLOW_INDEXING) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
