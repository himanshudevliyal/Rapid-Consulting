import { cache } from "react";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { isLocale } from "@/i18n/routing";
import { loadSitePagePreview, previewMetadata } from "@/lib/content/site-page-data";
import { SitePageView } from "@/components/site-pages/site-page-view";

// Draft preview of a site page for the editor in the admin panel
// (/{locale}/preview/{id}?token=...). The token is the short-lived link the API
// signs; a bad or expired token and an unknown page are both a 404. Nothing
// here is cached or indexed: dynamic rendering, no-store fetches and a
// noindex/nofollow robots tag (the admin panel shows it in an iframe).
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

const tokenOf = (query) => (typeof query?.token === "string" ? query.token : "");

// One lookup per request, shared by generateMetadata and the page.
const resolvePreview = cache((id, token) => loadSitePagePreview(id, token));

export async function generateMetadata({ params, searchParams }) {
  const { id } = await params;
  const found = await resolvePreview(id, tokenOf(await searchParams)).catch(() => ({ kind: "missing" }));
  return previewMetadata(found.kind === "page" ? found.page : null);
}

export default async function SitePagePreviewRoute({ params, searchParams }) {
  const { locale, id } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const found = await resolvePreview(id, tokenOf(query));
  if (found.kind !== "page") notFound();

  setRequestLocale(locale);
  return (
    <SitePageView
      page={found.page}
      locale={locale}
      topic={typeof query?.topic === "string" ? query.topic : ""}
      preview
    />
  );
}
