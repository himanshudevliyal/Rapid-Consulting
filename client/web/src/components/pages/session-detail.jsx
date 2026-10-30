import Link from "next/link";
import Image from "next/image";
import { PlayCircle } from "lucide-react";

import Section from "@/components/layout/section";
import { Html } from "@/components/pages/content-primitives";
import { EnquiryTrigger } from "@/components/form/enquiry-drawer";
import { copy } from "@/lib/pages/w4-copy";
import { effectiveState, isWebUrl } from "@/lib/pages/session-format";
import { SessionFacts, SessionStateBadge, sessionLabels } from "./session-card";
import { SessionRegistration } from "./session-registration";

const ACTION =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#eaff6b] px-5 py-2 text-sm font-semibold text-[#09263e] transition-colors hover:bg-[#dcf24f]";

// Full page body of one session. `session` comes from loadSessionDetail().
// States: upcoming (registration), closed (registration closed, no join link),
// recording (watch link, related resources and a related-question prompt).
export function SessionDetail({ session, locale = "en", t }) {
  const state = effectiveState(session);
  const related = (session.related ?? []).filter((item) => item.title);

  return (
    <main id="main">
      <Section className="py-12 lg:py-16" containerClassName="px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
          <div className="min-w-0">
            <SessionStateBadge state={state} t={t} />
            {session.topic && (
              <p className="m-0 mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]">
                {session.topic}
              </p>
            )}
            {session.image && (
              <div className="relative mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-[#e8efec]">
                <Image
                  src={session.image}
                  alt=""
                  fill
                  unoptimized
                  priority
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className="object-cover"
                />
              </div>
            )}
            {session.introHtml && (
              <div className="mt-8">
                <h2 className="mb-3 text-xl font-semibold text-[#09263e]">{copy(t, "sessions.about")}</h2>
                <Html html={session.introHtml} />
              </div>
            )}

            {state === "recording" && related.length > 0 && (
              <section className="mt-10" aria-labelledby="session-related">
                <h2 id="session-related" className="mb-3 text-xl font-semibold text-[#09263e]">
                  {copy(t, "sessions.related")}
                </h2>
                <ul className="m-0 grid list-none gap-2 p-0">
                  {related.map((item) => (
                    <li key={`${item.title}-${item.href}`}>
                      {item.href ? (
                        <a
                          href={item.href}
                          {...(isWebUrl(item.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                          className="font-medium text-[#1f5d57] underline underline-offset-2 hover:text-[#09263e]"
                        >
                          {item.title}
                        </a>
                      ) : (
                        <span className="text-slate-700">{item.title}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-[#e8ede6] bg-[#fafaf7] p-5 sm:p-6" aria-label={copy(t, "sessions.schedule")}>
            <h2 className="mb-4 text-lg font-semibold text-[#09263e]">{copy(t, "sessions.schedule")}</h2>
            <SessionFacts session={session} locale={locale} t={t} />

            <div className="mt-6 flex flex-col items-start gap-3 border-t border-[#e8ede6] pt-5">
              {state === "upcoming" && (
                <SessionRegistration
                  startsAt={session.startsAt}
                  registrationUrl={session.registrationUrl}
                  labels={sessionLabels(t)}
                />
              )}
              {state === "closed" && (
                <p className="m-0 text-sm font-medium text-slate-600">{copy(t, "sessions.closedNote")}</p>
              )}
              {state === "recording" && isWebUrl(session.recordingUrl) && (
                <a href={session.recordingUrl} target="_blank" rel="noopener noreferrer" className={ACTION}>
                  <PlayCircle className="size-4" aria-hidden="true" />
                  {copy(t, "sessions.watch")}
                </a>
              )}
              {state !== "upcoming" && (
                <EnquiryTrigger
                  className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#09263e]/25 bg-white px-5 py-2 text-sm font-semibold text-[#09263e] transition-colors hover:bg-slate-50"
                  source="session"
                  kind="session"
                  serviceName={session.title}
                >
                  {copy(t, "sessions.askQuestion")}
                </EnquiryTrigger>
              )}
              <Link href={`/${locale}/sessions`} className="text-sm font-medium text-[#1f5d57] underline underline-offset-2">
                {copy(t, "sessions.allSessions")}
              </Link>
            </div>
          </aside>
        </div>
      </Section>
    </main>
  );
}
