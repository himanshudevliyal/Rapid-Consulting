"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";

import { hasStarted, isWebUrl } from "@/lib/pages/session-format";

const LINK =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#eaff6b] px-5 py-2 text-sm font-semibold text-[#09263e] transition-colors hover:bg-[#dcf24f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#09263e]";

// The registration call to action of an upcoming session. Pages are cached, so
// the start time is checked again in the browser: once the session has begun
// the link is replaced by the "closed" note and never offered again.
export function SessionRegistration({ startsAt, registrationUrl, labels, className = "" }) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!startsAt) return undefined;
    const check = () => setStarted(hasStarted(startsAt));
    check();
    const timer = setInterval(check, 60000);
    return () => clearInterval(timer);
  }, [startsAt]);

  if (started) {
    return <p className={`m-0 text-sm font-medium text-slate-600 ${className}`}>{labels.closed}</p>;
  }

  if (!isWebUrl(registrationUrl)) {
    return <p className={`m-0 text-sm font-medium text-slate-600 ${className}`}>{labels.soon}</p>;
  }

  return (
    <a href={registrationUrl} target="_blank" rel="noopener noreferrer" className={`${LINK} ${className}`}>
      {labels.register}
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </a>
  );
}
