import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import config from "@/config";
import { SERVICES_TAG } from "@/services/service-service";
import { ARTICLES_TAG, articleTag } from "@/services/article-service";
import { CASE_STUDIES_TAG, caseStudyTag } from "@/services/case-study-service";
import { SCHEMES_TAG, schemeTag } from "@/services/scheme-service";

// What each `tag` the API can send refreshes: the list tag, one tag per saved
// slug and the route(s) that show them.
const TARGETS = {
  services: { tag: SERVICES_TAG, one: (slug) => `service:${slug}`, path: "/[locale]/services" },
  articles: { tag: ARTICLES_TAG, one: articleTag, path: "/[locale]/articles" },
  "case-studies": { tag: CASE_STUDIES_TAG, one: caseStudyTag, path: "/[locale]/case-studies" },
  schemes: { tag: SCHEMES_TAG, one: schemeTag, path: "/[locale]/schemes" },
};

// Called by the API after a service, article, case study or scheme is created,
// updated or deleted (WEBSITE_REVALIDATE_URL on the server) so the change
// appears immediately. Body: { tag: "services" | "articles" | "case-studies" |
// "schemes", slugs: [...] }; without a tag it refreshes services (as before).
export async function POST(request) {
  const secret = config.revalidate_secret;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ status: false, message: "Invalid secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const target = TARGETS[body.tag ?? "services"];
  if (!target) {
    return NextResponse.json({ status: false, message: "Unknown tag" }, { status: 400 });
  }

  revalidateTag(target.tag, "max");
  for (const slug of body.slugs ?? []) revalidateTag(target.one(slug), "max");
  revalidatePath(target.path, "layout");

  return NextResponse.json({ status: true, revalidated: true });
}
