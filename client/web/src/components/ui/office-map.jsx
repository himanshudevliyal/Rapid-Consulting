import { OFFICE_MAP_EMBED } from "@/lib/site";

// The Google map of the Rapid office. `src` can be a different embed address
// (for example one saved in the dashboard); with none given the office map is used.
export function OfficeMap({ src, title = "Rapid Consulting office on Google Maps", className = "aspect-[4/3]" }) {
  const address = typeof src === "string" && /^https:\/\/www\.google\.[a-z.]+\/maps\/embed/i.test(src.trim()) ? src.trim() : OFFICE_MAP_EMBED;
  return (
    <div className={`w-full overflow-hidden rounded-2xl bg-[#e9eff4] ${className}`}>
      <iframe
        src={address}
        title={title}
        className="block size-full border-0"
        loading="lazy"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
