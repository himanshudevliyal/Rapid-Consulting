import { getPage } from '@/lib/pages/content';
import { linkedContentIds } from '@/lib/pages/card-copy';
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
