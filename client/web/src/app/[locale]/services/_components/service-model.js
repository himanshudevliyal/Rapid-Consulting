import { excerpt, textOf } from "@/lib/pages/b2b-text";
import { getFileUrl } from "@/utils/file-url";

// Only a YouTube address is accepted as the video link.
const safeVideoUrl = (value) =>
  /^https?:\/\/(?:www\.|m\.|music\.)?(?:youtube\.com|youtube-nocookie\.com|youtu\.be)\//i.test(String(value ?? "").trim()) ? String(value).trim() : "";

// Small, pure helpers that read the service record for the Figma service page.
// Nothing here invents content: a helper returns nothing when the record has
// nothing to show, and the template then leaves that block out.

// Roles that are not body sections: "hero_benefit" replaces the introduction
// (Subsidies & Incentives) and "hero_points" feeds the three icon rows in the hero.
// "video" is the hero's "watch instead of reading" card.
export const NON_BODY_ROLES = ["hero_benefit", "hero_points", "video"];

export const bodySections = (service) => (service.sections ?? []).filter((section) => !NON_BODY_ROLES.includes(section.role));

const rowOf = (item) => ({
  title: textOf(item?.title).replace(/^\d+[.)]\s*/, ""),
  text: excerpt(textOf(item?.html), 130),
});

// The three icon rows under the hero introduction.
//   1. a "hero_points" section (items: title + html), if the record has one;
//   2. otherwise the first "benefits" section of the page.
// No such section: no rows.
export function heroPointsOf(service) {
  const sections = service.sections ?? [];
  const source = sections.find((section) => section.role === "hero_points") ?? sections.find((section) => section.role === "benefits");
  return (source?.items ?? [])
    .map(rowOf)
    .filter((row) => row.title)
    .slice(0, 3);
}

// "APPROVALS · LAND & SITE": the category and the family/topic page of the
// service. An editor-written eyebrow wins unless it is just the generic "Services".
const GENERIC_EYEBROW = /^services?$/i;
export function eyebrowOf(service) {
  const written = (service.eyebrow ?? "").trim();
  if (written && !GENERIC_EYEBROW.test(written)) return written;
  const parts = [service.category?.title, service.family && service.family.code !== service.code ? service.family.title : ""].filter(Boolean);
  return parts.length ? parts.join(" · ") : written;
}

// Case studies that belong to this service: a case lists the service's slug or
// code in its tags, or the service record lists the case's slug (`case_slugs`).
export function casesForService(service, cases = [], limit = 3) {
  const keys = new Set([service.slug, service.code].filter(Boolean).map((value) => String(value).toLowerCase()));
  const slugs = new Set((service.case_slugs ?? []).map((value) => String(value).toLowerCase()));
  const pick = (item) =>
    slugs.has(String(item.slug).toLowerCase()) || (item.tags ?? []).some((tag) => keys.has(String(tag).toLowerCase()));
  const listed = cases.filter(pick);
  // The editor's own order wins when the service lists its cases.
  if (slugs.size) {
    const order = [...slugs];
    listed.sort((a, b) => order.indexOf(String(a.slug).toLowerCase()) - order.indexOf(String(b.slug).toLowerCase()));
  }
  return listed.slice(0, limit);
}

// Optional video on the record: { url, title, description, duration, poster }
// (or a bare `video_url`). Without it the hero shows a labelled placeholder.
export function videoOf(service) {
  // The record's own "video" section: title, description (html) and the
  // thumbnail caption (intro_html, e.g. "3:00 · Captions on"); no address yet.
  const written = (service.sections ?? []).find((section) => section.role === "video");
  if (written) {
    return {
      // The YouTube address and the poster picture are written in the admin panel.
      url: safeVideoUrl(written.video_url),
      title: textOf(written.title),
      description: textOf(written.html),
      duration: textOf(written.intro_html),
      poster: getFileUrl(written.poster) ?? "",
    };
  }
  const video = service.video && typeof service.video === "object" ? service.video : null;
  const url = (video?.url || service.video_url || "").trim();
  if (!url && !video) return null;
  return {
    url,
    title: video?.title || "",
    description: video?.description || "",
    duration: video?.duration || "",
    poster: video?.poster || "",
  };
}
