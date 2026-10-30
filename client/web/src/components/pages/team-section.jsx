import Image from 'next/image';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { getPage } from '@/lib/pages/content';
import { ImagePlaceholder } from '@/components/ui/image-placeholder';
import { copy } from '@/lib/pages/w4-copy';
import { linkedContentIds } from '@/lib/pages/card-copy';
import { b2eText } from '@/lib/pages/b2e-copy';
import { Html, Icon } from './content-primitives';
const leadershipIds = new Set(['leadership', 'लीडरशिप']);
export function isTeamSection(section) { return ['the-rapid-team', 'रैपिड-की-टीम'].includes(section.id); }
function TeamCards({ html, locale, leadership, t }) {
    // The source list owns membership and order; there is no fixed display limit.
    const people = linkedContentIds(html).map(id => getPage(id, locale) || getPage(id, 'en')).filter(person => person?.type === 'person');
    return <div className={`team-grid ${leadership ? 'team-leadership' : ''}`}>{people.map(person => {
            if (!person)
                return null;
            const founder = person.id === 'P01';
            const placeholder = /Profile placeholder|प्रोफ़ाइल के लिए स्थान/.test(person.title);
            const name = placeholder ? t('site.team.nameToBeAdded') : person.h1;
            return <a className="team-person-card" href={person.href} key={person.id} data-person-id={person.id}>
   <div className="team-portrait"><Icon name="users-three"/><span>{t('site.team.photo')}</span></div>
   <div className="team-person-copy"><p className="eyebrow">{founder ? t('site.team.founder') : person.title.split(' · ')[0]}</p><h4>{name}</h4><p>{founder ? t('site.team.founderText') : t('site.team.placeholderText')}</p><span className="team-profile-link">{t('site.team.viewProfile')}{locale === 'hi' && person.locale === 'en' ? t('common.englishSuffix') : ''} <span aria-hidden="true">↗</span></span></div>
  </a>;
        })}</div>;
}
export function TeamSection({ section, locale, t }) {
    const blocks = section.html.split(/(?=<h3\b)/);
    const groups = blocks.filter(block => block.startsWith('<h3'));
    if (!groups.length)
        return <div data-component="TeamSection"><TeamCards html={section.html} locale={locale} t={t} leadership={leadershipIds.has(section.id)}/></div>;
    return <div className="team-section-groups" data-component="TeamSection">
  {blocks.filter(block => !block.startsWith('<h3')).map((html, i) => <Html html={html} key={i}/>)}
  {groups.map(block => {
            const heading = block.match(/^<h3\b[^>]*>[\s\S]*?<\/h3>/)?.[0] || '';
            const id = heading.match(/id="([^"]+)"/)?.[1] || '';
            return <div className="team-group" key={id} data-team-group={id}><Html html={heading} className="team-group-heading"/><TeamCards html={block.slice(heading.length)} locale={locale} t={t} leadership={leadershipIds.has(id)}/></div>;
        })}
 </div>;
}

// ── Team of the About page: Leadership / Experts / The Wider Team ───────────
// Groups come from the Advisers in the admin panel (loadTeam()). The first two
// groups keep their place and the latter two grow without redesign: the grids
// below take any number of cards.
const GROUP_KINDS = [
    { key: 'leadership', pattern: /leader|लीडर/i },
    { key: 'experts', pattern: /expert|विशेषज्ञ/i },
    { key: 'wider', pattern: /wider|other|अन्य|^(the )?team$/i },
];
const kindOf = (title = '') => GROUP_KINDS.find(kind => kind.pattern.test(title.trim()))?.key;

// Known groups first, in the agreed order (named case-insensitively and from
// legacy names too); any other group follows in the order it first appeared.
export function normalizeTeamGroups(groups = [], t) {
    const known = new Map();
    const others = [];
    for (const group of groups) {
        if (!group?.members?.length) continue;
        const key = kindOf(group.title);
        if (!key) {
            others.push({ key: `other-${group.title}`, kind: 'other', title: group.title, members: group.members });
            continue;
        }
        if (!known.has(key))
            known.set(key, { key, kind: key, title: copy(t, `aboutUs.team.groups.${key}`), members: [] });
        known.get(key).members.push(...group.members);
    }
    return [...GROUP_KINDS.map(kind => known.get(kind.key)).filter(Boolean), ...others];
}

// Same shape from the About manuscript (used only when the API has no team yet).
export function groupsFromSection(section, locale) {
    if (!section) return [];
    return section.html.split(/(?=<h3\b)/).filter(block => block.startsWith('<h3')).map(block => {
        const title = (block.match(/^<h3\b[^>]*>([\s\S]*?)<\/h3>/)?.[1] || '').replace(/<[^>]+>/g, '').trim();
        const members = linkedContentIds(block).map(id => getPage(id, locale) || getPage(id, 'en')).filter(person => person?.type === 'person').map(person => {
            const placeholder = /Profile placeholder|प्रोफ़ाइल के लिए स्थान/.test(person.title);
            return {
                id: person.id,
                name: placeholder ? person.title.split(' · ')[0] : person.h1,
                designation: placeholder ? '' : (person.introHtml.match(/<strong>([^<]+)<\/strong>/)?.[1] || ''),
                placeholder,
                href: person.href,
            };
        });
        return { title, members };
    });
}

const initialsOf = name => String(name || '').split(/\s+/).filter(Boolean).slice(0, 2).map(word => Array.from(word)[0].toUpperCase()).join('');

// The first real (not placeholder) leader who has a profile page: "Meet <name>".
export function leaderOf(groups = []) {
    const leadership = groups.find(group => group.kind === 'leadership');
    return leadership?.members.find(member => member.href && !member.placeholder) ?? null;
}

// Figma person card: photo / initials tile, name, role, one credential chip and
// "View profile". A profile that is not published yet shows as a clearly labelled
// placeholder (name and role to be added), never as a made-up person.
function TeamPersonCard({ member, locale, t }) {
    const text = b2eText(t);
    const hasDesignation = member.designation && !/to be confirmed/i.test(member.designation);
    const credential = member.expertise?.[0];
    const profileLabel = copy(t, 'aboutUs.team.viewProfile') + (locale === 'hi' ? t('common.englishSuffix') : '');
    const body = <>
   <div className="relative aspect-[4/3.4] w-full overflow-hidden bg-[#e8efec]">
    {member.photo && !member.placeholder
        ? <Image src={member.photo} alt="" fill unoptimized sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"/>
        : member.placeholder
            ? <ImagePlaceholder className="absolute inset-0 rounded-none border-0" icon={Users} label={copy(t, 'aboutUs.team.photoPlaceholder')}/>
            : <div className="flex size-full items-center justify-center text-5xl font-semibold tracking-wide text-[#1f5d57]/70" aria-hidden="true">{initialsOf(member.name)}</div>}
   </div>
   <div className="flex flex-1 flex-col gap-1.5 px-5 py-5">
    <p className="m-0 text-lg font-bold leading-snug text-[#09263e]">{member.name}</p>
    {hasDesignation
        ? <p className="m-0 text-sm font-medium leading-5 text-slate-700">{member.designation}</p>
        : member.placeholder && <p className="m-0 text-sm italic leading-5 text-slate-600">{text('about.people.roleTbc')}</p>}
    {credential && !member.placeholder && <p className="m-0 mt-1 w-fit max-w-full rounded-full border border-[#09263e]/15 bg-[#f4f7f5] px-3 py-1 text-xs font-medium leading-4 text-[#09263e]">{credential}</p>}
    {member.placeholder && <p className="m-0 mt-1 w-fit rounded-full border border-dashed border-[#922e0c]/50 bg-[#fff6f1] px-2.5 py-0.5 text-xs font-semibold text-[#922e0c]">{copy(t, 'aboutUs.team.placeholder')}</p>}
    {member.href && <span className="mt-auto pt-4 text-sm font-semibold text-[#1f5d57] underline-offset-2 group-hover:underline">{profileLabel} <span aria-hidden="true">↗</span></span>}
   </div>
  </>;
    const shell = 'group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm';
    // No profile page yet (no slug): a plain card, never a dead "#" link.
    return member.href
        ? <Link href={member.href} className={`${shell} text-[#09263e] no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-[#09263e]/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#09263e] focus-visible:ring-offset-2`} data-person-id={member.id}>{body}</Link>
        : <div className={shell} data-person-id={member.id}>{body}</div>;
}

// groups: result of normalizeTeamGroups(). Leadership is 3-up; the other
// groups are 4-up on wide screens, 2-up on tablets and 1-up on phones.
export function TeamDirectory({ groups, locale, t }) {
    return <div className="grid gap-12">{groups.map(group => {
            const gridClass = group.kind === 'leadership'
                ? 'sm:grid-cols-2 lg:grid-cols-3'
                : 'sm:grid-cols-2 xl:grid-cols-4';
            return <div key={group.key} data-team-group={group.key}>
    {group.title && <h3 className="mb-5! mt-0! text-xl! font-semibold! tracking-tight! text-[#09263e]!">{group.title}</h3>}
    <ul className={`m-0 grid list-none grid-cols-1 gap-6 p-0 ${gridClass}`}>{group.members.map(member => <li key={member.id ?? member.slug ?? member.name} className="min-w-0"><TeamPersonCard member={member} locale={locale} t={t}/></li>)}</ul>
   </div>;
        })}</div>;
}
