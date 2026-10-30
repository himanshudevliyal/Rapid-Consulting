import Link from "next/link";
import Image from "next/image";
import { CalendarDays, Clock, PlayCircle, User, Users } from "lucide-react";

import { copy } from "@/lib/pages/w4-copy";
import { effectiveState, formatSessionDate, formatSessionTime, isWebUrl } from "@/lib/pages/session-format";
import { SessionRegistration } from "./session-registration";

const STATE_STYLE = {
  upcoming: "bg-[#eaf3ef] text-[#1f5d57]",
  closed: "bg-slate-100 text-slate-600",
  recording: "bg-[#e8eefb] text-[#09263e]",
};

export const sessionLabels = (t) => ({
  register: copy(t, "sessions.register"),
  soon: copy(t, "sessions.registrationSoon"),
  closed: copy(t, "sessions.closedNote"),
});

// "Upcoming" / "Registration closed" / "Recording available".
export function SessionStateBadge({ state, t }) {
  const key = STATE_STYLE[state] ? state : "closed";
  return (
    <span
      className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${STATE_STYLE[key]}`}
    >
      {copy(t, `sessions.states.${key}`)}
    </span>
  );
}

// Facts shared by the card and the detail page: audience, speaker, date, time, duration.
export function SessionFacts({ session, locale, t, className = "" }) {
  const date = formatSessionDate(session.startsAt, locale);
  const time = formatSessionTime(session.startsAt, locale);
  const rows = [
    session.audience && { icon: Users, label: copy(t, "sessions.audience"), value: session.audience },
    session.speaker && {
      icon: User,
      label: copy(t, "sessions.speaker"),
      value: [session.speaker, session.speakerTitle].filter(Boolean).join(", "),
    },
    date && { icon: CalendarDays, label: copy(t, "sessions.date"), value: date },
    time && { icon: Clock, label: copy(t, "sessions.time"), value: time },
    session.durationMinutes && {
      icon: Clock,
      label: copy(t, "sessions.duration"),
      value: copy(t, "sessions.minutes", { count: session.durationMinutes }),
    },
  ].filter(Boolean);
  if (!rows.length) return null;

  return (
    <dl className={`m-0 grid gap-2.5 text-sm ${className}`}>
      {rows.map(({ icon: RowIcon, label, value }) => (
        <div key={label} className="flex items-start gap-2.5">
          <RowIcon className="mt-0.5 size-4 shrink-0 text-[#1f5d57]" aria-hidden="true" />
          <div className="min-w-0">
            <dt className="sr-only">{label}</dt>
            <dd className="m-0 text-slate-700">{value}</dd>
          </div>
        </div>
      ))}
    </dl>
  );
}

// Card for the list of sessions. What the card offers follows `session.state`:
//   upcoming  -> registration button (or "Registration opens soon")
//   closed    -> "Registration closed" badge, nothing to join
//   recording -> link to watch the recording
export function SessionCard({ session, locale = "en", t }) {
  const state = effectiveState(session);
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-[#e8ede6] bg-white shadow-sm">
      {session.image && (
        <div className="relative aspect-[16/9] w-full bg-[#e8efec]">
          <Image
            src={session.image}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <SessionStateBadge state={state} t={t} />
        <div>
          {session.topic && (
            <p className="m-0 mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]">{session.topic}</p>
          )}
          <h3 className="m-0 text-xl font-semibold leading-snug text-[#09263e]">
            <Link href={session.href} className="hover:underline focus-visible:underline">
              {session.title}
            </Link>
          </h3>
        </div>
        <SessionFacts session={session} locale={locale} t={t} />
        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
          {state === "upcoming" && (
            <SessionRegistration
              startsAt={session.startsAt}
              registrationUrl={session.registrationUrl}
              labels={sessionLabels(t)}
            />
          )}
          {state === "recording" && isWebUrl(session.recordingUrl) && (
            <a
              href={session.recordingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#eaff6b] px-5 py-2 text-sm font-semibold text-[#09263e] transition-colors hover:bg-[#dcf24f]"
            >
              <PlayCircle className="size-4" aria-hidden="true" />
              {copy(t, "sessions.watch")}
            </a>
          )}
          <Link href={session.href} className="text-sm font-medium text-[#1f5d57] underline underline-offset-2">
            {copy(t, "sessions.viewDetails")}
            <span className="sr-only">: {session.title}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
