import { getPage } from '@/lib/pages/content';
import { linkedContentIds } from '@/lib/pages/card-copy';
import { adviserCommunity } from '@/lib/pages/adviser-community';
import { Html, Icon } from './content-primitives';
import { ContentCard } from './content-card';
import { ContactExperience } from '@/components/form/contact-experience';
import { WhatsAppMark } from '@/components/contact/whatsapp';
import { ClientTicker } from '@/components/common/client-ticker';
function EditorialCards({ section, kind }) {
    const [body, ...footnotes] = section.html.split(/<hr\s*\/?>/);
    const blocks = body.split(/(?=<h3\b)/);
    return <><div className="adviser-section-intro">{blocks.filter(b => !b.startsWith('<h3')).map((html, i) => <Html key={i} html={html}/>)}</div><div className={`adviser-cards adviser-cards-${kind}`}>{blocks.filter(b => b.startsWith('<h3')).map((html, i) => <article key={i}>{kind === 'process' ? <span className="adviser-step" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span> : <Icon name={['users-three', 'clipboard-text', 'target'][i % 3]}/>}<Html html={html}/></article>)}</div>{footnotes.map((html, i) => <Html html={html} className="adviser-section-footnote" key={i}/>)}</>;
}
function LinkedCards({ section, page, type, t, has }) {
    const records = linkedContentIds(section.html).map(id => getPage(id, page.locale) || getPage(id, 'en')).filter((p) => !!p && (type === 'cases' ? p.type === 'case-study' : p.type === 'service-family'));
    const ids = new Set(records.map(p => p.id));
    const rest = section.html.replace(/<p>\s*<a href="\/en\/p\/([A-Z0-9-]+)">[^<]+<\/a>\s*<\/p>/g, (whole, id) => ids.has(id) ? '' : whole);
    return <><Html html={rest}/><div className={`adviser-linked-grid adviser-linked-${type}`}>{records.map(p => <ContentCard key={p.id} page={p} locale={page.locale} t={t} has={has}/>)}</div></>;
}
function CommunityJoin({ t }) {
    return <div className="adviser-join-action">{adviserCommunity.inviteUrl ? <a className="whatsapp-button" href={adviserCommunity.inviteUrl} target="_blank" rel="noopener noreferrer"><WhatsAppMark />{t('site.adviser.joinCommunity')}</a> : <><button className="whatsapp-button" type="button" disabled><WhatsAppMark />{t('site.adviser.joinCommunity')}</button><p className="small">{t('site.adviser.invitePending')}</p></>}</div>;
}
export function AdviserPage({ page, breadcrumbs, t, has }) {
    const contact = page.sections.find(s => s.id === 'discuss-working-together');
    const roles = { 'more-value-for-the-people-who-trust-your-advice': 'audiences', 'a-preview-of-useful-updates': 'samples', 'how-a-client-introduction-becomes-an-assignment': 'process', 'explore-the-whatsapp-community': 'community', 'explore-a-partnership-with-rapid': 'partnership' };
    return <main id="main" className="container adviser-page">{breadcrumbs}<header className="page-hero adviser-hero"><p className="eyebrow">{page.title}</p><h1>{page.h1}</h1><Html html={page.introHtml} className="hero-copy"/><div className="actions"><a className="whatsapp-button" href="#explore-the-whatsapp-community"><WhatsAppMark />{t('site.adviser.exploreCommunity')}</a><a className="button button-secondary" href="#explore-a-partnership-with-rapid">{t('site.adviser.explorePartnership')} <span aria-hidden="true">↗</span></a></div><a className="adviser-tool-link" href="#start-with-a-useful-tool">{t('site.adviser.checklist')}</a></header>
  <ClientTicker />
  {page.sections.filter(s => s !== contact).map(section => {
            const role = roles[section.id];
            const toolkit = section.id === 'start-with-a-useful-tool';
            return <section className={`adviser-section ${role ? `adviser-${role}` : ''} ${toolkit ? 'adviser-toolkit' : ''}`} key={section.id} id={section.id}><div className="section-heading"><div>{role === 'samples' && <p className="eyebrow">{t('site.adviser.samples')}</p>}<h2>{section.title}</h2></div></div>
    {role ? <EditorialCards section={section} kind={role}/> : section.id === 'specialist-support-for-your-clients-next-step' ? <LinkedCards section={section} page={page} type="services" t={t} has={has}/> : section.id === 'see-the-work-and-meet-the-people' ? <LinkedCards section={section} page={page} type="cases" t={t} has={has}/> : <Html html={section.html}/>}
    {role === 'community' && <CommunityJoin t={t}/>}{role === 'partnership' && <a className="button" href="/contact">{t('site.adviser.discussWorking')} <span aria-hidden="true">↗</span></a>}
   </section>;
        })}
  <section className="adviser-contact" id={contact?.id}><div><p className="eyebrow">{t('site.adviser.partnershipEnquiry')}</p><h2>{contact?.title}</h2>{contact && <Html html={contact.html}/>}</div><ContactExperience pageTitle={page.h1} pageId={page.id} variant="section" heading={t('site.adviser.formHeading')} eyebrow={t('site.adviser.formEyebrow')} requirementHint={t('site.adviser.formHint')}/></section>
 </main>;
}
