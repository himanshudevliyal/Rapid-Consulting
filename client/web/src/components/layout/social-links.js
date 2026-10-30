// Footer social icons. Rapid's profile URLs are not in the codebase, so each
// one comes from its own environment variable and an icon is only drawn when
// its URL is set (no dead round buttons, no invented profiles). The
// expressions must stay literal so the build can inline them.
function safeHttps(value) {
  try {
    const url = new URL((value ?? "").trim());
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

export const SOCIAL_LINKS = [
  { id: "facebook", label: "Facebook", href: safeHttps(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK_URL) },
  { id: "instagram", label: "Instagram", href: safeHttps(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM_URL) },
  { id: "youtube", label: "YouTube", href: safeHttps(process.env.NEXT_PUBLIC_SOCIAL_YOUTUBE_URL) },
  { id: "linkedin", label: "LinkedIn", href: safeHttps(process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN_URL) },
].filter((item) => item.href);
