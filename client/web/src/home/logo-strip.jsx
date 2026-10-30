"use client";

import { Marquee } from "@/components/ui/marquee";
import { WRAP } from "@/components/home/styles";

// The clients Rapid works with (the logos in public/assets/logo). Velmoc's logo has white
// lettering, so it sits on a navy tile.
const CLIENT_LOGOS = [
  { id: "velmoc", name: "Velmoc", src: "/assets/logo/velmoc.png", dark: true },
  { id: "darcl", name: "Darcl", src: "/assets/logo/darcl.png" },
  { id: "novice", name: "Novice", src: "/assets/logo/novice.png" },
  { id: "shyam-g", name: "Shyam-G", src: "/assets/logo/logo-3.png" },
  { id: "anida", name: "Anida", src: "/assets/logo/anida.png" },
];

/**
 * Client logo strip: a horizontally scrolling row of the client logos, with no
 * text under them. It stops while pointed at, and completely under
 * prefers-reduced-motion (see Marquee).
 */
export function LogoStrip({ title, eyebrow }) {
  return (
    <section aria-label={title} className="bg-white py-8 sm:py-10">
      <div className={WRAP}>
        {eyebrow && <p className="m-0! mb-2! block text-center text-xs font-bold uppercase tracking-[0.16em] text-[#922e0c]">{eyebrow}</p>}
        <p className="m-0! text-center text-sm font-semibold text-slate-800">{title}</p>

        <div role="group" aria-label={title} className="relative mt-5 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-white to-transparent motion-reduce:hidden sm:w-24" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-white to-transparent motion-reduce:hidden sm:w-24" />
          <Marquee pauseOnHover className="[--duration:45s] [--gap:1.25rem]">
            {CLIENT_LOGOS.map((logo) => (
              <div
                key={logo.id}
                className={`flex h-[72px] w-44 shrink-0 items-center justify-center overflow-hidden rounded-xl sm:h-[88px] sm:w-[200px] ${logo.dark ? "bg-[#09263e]" : "bg-white"}`}
              >
                <img src={logo.src} alt={logo.name} width="500" height="220" loading="lazy" className="size-full object-contain" />
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}
