import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { cn } from "@/lib/utils";

const initialsOf = (name = "") =>
  String(name)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join("")
    .toUpperCase();

// Thumbnail of a person: their photo, or their initials on the quiet
// placeholder tile (never a stock portrait).
export function PersonAvatar({ person, className }) {
  return (
    <span
      aria-hidden="true"
      data-slot="person-avatar"
      className={cn(
        "relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#09263e]/15 bg-[#e8efec] text-base font-semibold tracking-wide text-[#1f5d57]",
        className,
      )}
    >
      {person.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={person.photo} alt="" loading="lazy" className="size-full object-cover" />
      ) : (
        initialsOf(person.name)
      )}
    </span>
  );
}

// The one name card used wherever a person appears as an author or reviewer
// (article and scheme heroes, References & review, case studies...). The whole
// card is the link to the person's profile page.
//
//   person: { name, designation, photo, placeholder, href }  (see adapters.personRef)
//   role:   "Reviewed by" / "Written by" ...
//   note:   a short line under the role, e.g. "Reviewed on 3 October 2026"
export function PersonCard({
  person,
  role,
  note,
  placeholderLabel = "Placeholder profile",
  className,
  headingLevel: Heading = "span",
}) {
  if (!person) return null;

  const body = (
    <>
      <PersonAvatar person={person} />
      <span className="min-w-0 flex-1">
        {role && (
          <span className="mb-0.5 block text-[11px] font-bold uppercase tracking-[0.14em] text-[#922e0c]">{role}</span>
        )}
        <Heading className="block text-[15px] font-semibold leading-snug text-[#09263e]">{person.name}</Heading>
        {person.designation && (
          <span className="block text-[13px] leading-snug text-slate-600">{person.designation}</span>
        )}
        {note && <span className="mt-1 block text-xs text-slate-600">{note}</span>}
        {person.placeholder && (
          <span className="mt-1 block text-[11px] font-medium text-slate-500">{placeholderLabel}</span>
        )}
      </span>
    </>
  );

  const shell = cn(
    "group flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-3.5 text-left no-underline transition-colors",
    className,
  );

  if (!person.href) {
    return (
      <div className={shell} data-component="PersonCard">
        {body}
      </div>
    );
  }

  return (
    <Link
      href={person.href}
      data-component="PersonCard"
      className={cn(
        shell,
        "hover:border-[#09263e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1f5d57] focus-visible:ring-offset-2",
      )}
    >
      {body}
      <span
        aria-hidden="true"
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#eaff6b] text-[#09263e] transition-transform group-hover:translate-x-0.5"
      >
        <ArrowUpRight className="size-4" />
      </span>
    </Link>
  );
}
