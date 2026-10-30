"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, Play, X } from "lucide-react";
import { useTranslations } from "next-intl";

import { useTx } from "@/lib/use-tx";

const STORAGE_KEY = "rapid-announcements-closed";

const readClosed = () => {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};
const writeClosed = () => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* private mode: closing still works for this page view */
  }
};

// The navy top strip above the header: the announcements as a marquee on the
// left (an orange megaphone button that pauses / restarts it, then every
// announcement after a bullet, moving left without end) and the contact links
// on the right. The strip stops while someone points at or focuses in it, when
// the visitor has paused it, and for reduced motion (then it can be scrolled
// sideways instead). Closing is remembered for the session.
//
//   items: [{ text, href, local }]
//   children: right-hand content (phone / email / CRM Login) of the top strip
export function AnnouncementBar({ items = [], children }) {
  const t = useTranslations();
  const tx = useTx();
  const [closed, setClosed] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [engaged, setEngaged] = useState(false); // hover or focus inside
  const [reduced, setReduced] = useState(false);

  const count = items.length;

  useEffect(() => {
    // Session storage is only readable in the browser: read it after the first paint.
    const frame = window.requestAnimationFrame(() => setClosed(readClosed()));
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => {
      window.cancelAnimationFrame(frame);
      query.removeEventListener("change", update);
    };
  }, []);

  const running = !userPaused && !engaged && !reduced && !closed;

  const close = () => {
    writeClosed();
    setClosed(true);
    // The focused button disappears: hand focus to the header's first link.
    window.requestAnimationFrame(() => document.querySelector("[data-site-header]:not([inert]) a")?.focus({ preventScroll: true }));
  };

  const iconButton =
    "inline-flex size-7 shrink-0 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eaff6b]";

  // Slower with more announcements, so each one stays readable.
  const duration = `${Math.max(20, count * 9)}s`;

  return (
    <div
      className={`bg-[#051c30] text-[13px] text-white! ${closed || count === 0 ? "hidden lg:block" : ""}`}
      data-announcement-bar
    >
      <div className="mx-auto flex w-full max-w-[1440px] items-center gap-3 px-3 py-2 sm:px-6 xl:px-6 2xl:px-8">
        {!closed && count > 0 && (
          <section
            aria-label={t("header.tickerTag")}
            className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3"
            onMouseEnter={() => setEngaged(true)}
            onMouseLeave={() => setEngaged(false)}
            onFocus={() => setEngaged(true)}
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setEngaged(false);
            }}
          >
            {/* Orange megaphone button: pauses and restarts the moving strip */}
            <button
              type="button"
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-[#c2410c] text-white transition-colors hover:bg-[#d4541c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#eaff6b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#051c30] disabled:cursor-default disabled:hover:bg-[#c2410c]"
              onClick={() => setUserPaused((value) => !value)}
              disabled={reduced}
              aria-pressed={userPaused}
              aria-label={userPaused ? tx("header.playAnnouncements", "Play announcements") : tx("header.pauseAnnouncements", "Pause announcements")}
            >
              {userPaused ? <Play className="size-3.5 fill-current" aria-hidden="true" /> : <Megaphone className="size-4" aria-hidden="true" />}
            </button>

            {/* Marquee. The list is written twice so the loop has no gap; the copy is hidden
                from screen readers and from the Tab order. The edges fade out. */}
            <div
              className={`min-w-0 flex-1 [mask-image:linear-gradient(90deg,transparent,#000_24px,#000_calc(100%-24px),transparent)] ${reduced ? "overflow-x-auto" : "overflow-hidden"}`}
            >
              <div
                className={`flex w-max ${reduced ? "" : "animate-[rapid-marquee_var(--marquee-duration)_linear_infinite]"} ${running ? "" : "[animation-play-state:paused]"}`}
                style={{ "--marquee-duration": duration }}
              >
                {[0, 1].map((copy) =>
                  copy === 1 && reduced ? null : (
                    <ul key={copy} aria-hidden={copy === 1 ? "true" : undefined} className="m-0 flex shrink-0 list-none items-center p-0">
                      {items.map((item, position) => {
                        const Tag = item.local ? Link : "a";
                        return (
                          <li key={position} className="m-0 flex items-center whitespace-nowrap">
                            <span aria-hidden="true" className="mx-4 text-white/70">
                              &bull;
                            </span>
                            <Tag
                              href={item.href}
                              tabIndex={copy === 1 ? -1 : undefined}
                              className="font-medium text-white! no-underline hover:underline"
                            >
                              {item.text}
                            </Tag>
                          </li>
                        );
                      })}
                    </ul>
                  ),
                )}
              </div>
            </div>

            <button type="button" className={iconButton} onClick={close} aria-label={t("header.closeAnnouncements")}>
              <X className="size-4" aria-hidden="true" />
            </button>
          </section>
        )}

        {(closed || count === 0) && <span className="flex-1" aria-hidden="true" />}

        {children}
      </div>
    </div>
  );
}
