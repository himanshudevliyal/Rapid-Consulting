import { notFound, permanentRedirect } from "next/navigation";

import { isLocale } from "@/i18n/routing";
import { pathFor } from "@/lib/page-routes";

// Old identity URLs (/en/p/D060) move permanently to their slug URLs
// (/en/services/change-in-land-use-clu).
export default async function IdentityRedirect({ params, searchParams }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const target = pathFor(id === "D064" ? "D065" : id, locale);
  if (!target) notFound();
  const query = new URLSearchParams(await searchParams).toString();
  permanentRedirect(query ? `${target}?${query}` : target);
}
