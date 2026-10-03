import { linkedContentIds } from './card-copy';
const homeRoles = {
    'expert-guidance-ownership-through-execution': 'approach', 'विशेषज्ञ-सलाह-काम-को-अंजाम-तक-पहुँचाने-की-ज़िम्मेदारी': 'approach',
    'what-are-you-planning': 'planning', 'आपकी-अगली-योजना-क्या-है': 'planning',
    'built-around-your-business': 'industries', 'आपके-व्यवसाय-के-अनुसार-सहायता': 'industries',
    'find-the-service-you-need': 'services', 'अपनी-ज़रूरत-की-सेवा-खोजें': 'services',
    'see-the-work-behind-the-promise': 'proof', 'हमने-किन-प्रोजेक्ट-पर-काम-किया-है': 'proof',
    'get-useful-answers-before-your-next-decision': 'resources', 'अगले-फैसले-से-पहले-उपयोगी-जानकारी': 'resources',
    'discuss-your-project': 'contact', 'अपने-प्रोजेक्ट-पर-बात-करें': 'contact',
};
export function homeSectionRole(section) { return homeRoles[section.id]; }
export function benefitSection(page) { return page.id === 'S01' ? page.sections.find(s => ['unlock-the-full-subsidy-potential-of-your-next-investment', 'अपने-अगले-निवेश-के-लिए-उपलब्ध-सब्सिडी-का-पूरा-लाभ-उठाएँ'].includes(s.id)) : undefined; }
export function contactFormSection(page) { return page.id === 'C01' ? page.sections.find(s => ['request-a-callback-from-an-expert-consultant', 'विशेषज्ञ-सलाहकार-से-बात-करने-के-लिए-अपना-नंबर-दें'].includes(s.id)) : undefined; }
// Reviewed presentation roles for the approved source sections. Copy order is not a selector.
const evidenceIds = new Set(['हमारे-काम-का-उदाहरण', 'experience-you-can-examine', 'experience-tied-to-a-specific-investment', 'see-a-manufacturing-assignment-in-context', 'see-the-work-in-a-project-context', 'उपकरण-निवेश-में-हमारे-काम-के-उदाहरण', 'मैन्युफैक्चरिंग-निवेश-में-हमारे-काम-का-उदाहरण', 'सब्सिडी-आवेदन-में-हमारे-काम-का-उदाहरण']);
export function evidenceCaseIds(section) { return evidenceIds.has(section.id) ? linkedContentIds(section.html).filter(id => id.startsWith('RC-CS')) : []; }
export function displayedEvidenceIds(page) { return [...new Set(page.sections.flatMap(evidenceCaseIds))]; }
export function contactPresentation(section) {
    const parts = [...section.html.matchAll(/<p[^>]*>[\s\S]*?<\/p>/g)].map(m => m[0]);
    const field = (p) => /^<p><strong>/.test(p) && (/<br>/.test(p) || /Button:|बटन:/.test(p));
    const requirement = parts.find(p => /<strong>(?:Your project|आपका प्रोजेक्ट)/.test(p));
    return { html: parts.filter(p => !field(p) && !/^<p><a href="https:\/\/wa.me/.test(p)).join('\n'), requirementHint: requirement?.replace(/^.*?<br>/, '').replace(/<[^>]+>/g, '') };
}
