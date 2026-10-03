import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import config from "@/config";
import { SERVICES_TAG } from "@/services/service-service";

// Called by the API after a service is created, updated or deleted
// (WEBSITE_REVALIDATE_URL on the server) so the change appears immediately.
export async function POST(request) {
  const secret = config.revalidate_secret;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ status: false, message: "Invalid secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  revalidateTag(SERVICES_TAG, "max");
  for (const slug of body.slugs ?? []) revalidateTag(`service:${slug}`, "max");
  revalidatePath("/[locale]/services", "layout");

  return NextResponse.json({ status: true, revalidated: true });
}
