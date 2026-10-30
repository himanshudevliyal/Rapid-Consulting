import { getTranslations } from "next-intl/server";

import { WhatsAppMark } from "@/components/contact/whatsapp";
import { loadCommunityGroups } from "@/lib/content/site-data";
import { copy } from "@/lib/pages/w4-copy";
import { WHATSAPP_NUMBER } from "@/lib/site";

const JOIN =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#eaff6b] px-5 py-2 text-sm font-semibold text-[#09263e] transition-colors hover:bg-[#dcf24f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#09263e] [&_svg]:size-4";
const PENDING =
  "inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-500 [&_svg]:size-4";

const isWebUrl = (value) => /^https?:\/\//i.test(String(value ?? "").trim());

function JoinAction({ group, t }) {
  if (isWebUrl(group.joinUrl)) {
    return (
      <a
        href={group.joinUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={JOIN}
        aria-label={copy(t, "community.groupLabel", { name: group.name })}
      >
        <WhatsAppMark />
        {copy(t, "community.join")}
      </a>
    );
  }
  // No invite link yet: a visibly unavailable control, never a dead link.
  return (
    <button type="button" disabled aria-disabled="true" className={PENDING}>
      <WhatsAppMark />
      {copy(t, "community.pending")}
    </button>
  );
}

function GroupCard({ group, t, full }) {
  return (
    <article className="flex h-full flex-col gap-3 rounded-xl border border-[#e0e7dc] bg-white p-4 sm:p-5">
      <h3 className={`m-0 font-semibold leading-snug text-[#09263e] ${full ? "text-xl" : "text-base"}`}>{group.name}</h3>
      {group.audience && (
        <p className="m-0 text-sm text-slate-700">
          <span className="font-semibold text-[#1f5d57]">{copy(t, "community.audience")}: </span>
          {group.audience}
        </p>
      )}
      {group.updates.length > 0 && (
        <div>
          <p className="m-0 mb-1 text-sm font-semibold text-[#1f5d57]">{copy(t, "community.updates")}</p>
          <ul className="m-0 grid list-disc gap-1 pl-5 text-sm text-slate-700">
            {group.updates.map((update) => (
              <li key={update}>{update}</li>
            ))}
          </ul>
        </div>
      )}
      {group.cadence && <p className="m-0 text-sm text-slate-600">{copy(t, "community.cadence", { cadence: group.cadence })}</p>}
      <div className="mt-auto pt-2">
        <JoinAction group={group} t={t} />
      </div>
    </article>
  );
}

// Invitation to a Rapid WhatsApp group, for one part of the site.
//   <CommunityInvite placement="industries" />                 // loads the groups itself
//   <CommunityInvite placement="resources" layout="full" />
//   <CommunityInvite groups={groups} />                        // already loaded
// Renders nothing when there is no group for the placement.
export async function CommunityInvite({ placement, groups, layout = "compact", locale, className = "" }) {
  const items = groups ?? (await loadCommunityGroups({ placement }));
  if (!items.length) return null;

  const t = await getTranslations(locale ? { locale } : undefined);
  const full = layout === "full";

  return (
    <aside
      aria-labelledby={`community-invite-${placement ?? "all"}`}
      className={`rounded-2xl bg-[#f1f5ee] ${full ? "p-6 sm:p-8 lg:p-10" : "p-4 sm:p-6"} ${className}`}
    >
      <p className="m-0 mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1f5d57]">
        {copy(t, "community.eyebrow")}
      </p>
      <h2
        id={`community-invite-${placement ?? "all"}`}
        className={`m-0 font-bold leading-tight text-[#09263e] ${full ? "text-3xl lg:text-4xl" : "text-xl"}`}
      >
        {copy(t, "community.heading")}
      </h2>
      <p className={`mt-2 mb-0 max-w-2xl text-slate-700 ${full ? "text-base" : "text-sm"}`}>
        {copy(t, "community.intro")}
      </p>

      <div className={`mt-5 grid gap-4 ${items.length > 1 ? "md:grid-cols-2" : ""} ${full && items.length > 2 ? "xl:grid-cols-3" : ""}`}>
        {items.map((group) => (
          <GroupCard key={group.id ?? group.name} group={group} t={t} full={full} />
        ))}
      </div>

      <p className="mt-5 mb-0 text-sm text-slate-700">
        {copy(t, "community.separate")}{" "}
        <a
          href={`https://wa.me/${WHATSAPP_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#1f5d57] underline underline-offset-2 hover:text-[#09263e]"
        >
          {copy(t, "community.whatsapp")}
        </a>
        .
      </p>
      <div className="mt-3 rounded-lg border border-[#dfe7da] bg-white/70 p-3 text-xs text-slate-600">
        <p className="m-0 font-semibold text-[#09263e]">{copy(t, "community.usefulHeading")}</p>
        <p className="m-0 mt-0.5">{copy(t, "community.usefulText")}</p>
      </div>
    </aside>
  );
}

export default CommunityInvite;
