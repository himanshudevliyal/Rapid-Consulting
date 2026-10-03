import { linkedContentIds } from './card-copy';
const serviceSections = {
    I01: ['connect-the-relevant-services', 'आपके-प्रोजेक्ट-से-जुड़ी-सेवाएँ'],
    I02: ['workstreams-that-fit-together', 'आपके-निवेश-से-जुड़ी-सेवाएँ'],
    I03: ['services-to-explore', 'संबंधित-सेवाएँ'],
    I04: ['where-we-can-help', 'कहाँ-सहायता-मिल-सकती-है'],
    S02: ['choose-the-approval-you-need', 'अपनी-ज़रूरत-की-सेवा-चुनें'],
    S03: ['choose-the-document-or-programme', 'सही-सेवा-चुनें'],
    S04: ['choose-the-support-you-need', 'अपनी-ज़रूरत-चुनें'],
    S05: ['choose-the-funding-or-advisory-requirement', 'सही-सेवा-चुनें'],
};
export function isIndustryServiceSection(page, section) {
    return ['industry', 'service-family'].includes(page.type) && !!serviceSections[page.id]?.includes(section.id);
}
// Preserve every source block. Only actual service destinations become cards;
// directory links and unlinked project guidance remain editorial content.
export function industryServiceBlocks(section, isService) {
    return section.html.split(/(<p\b[^>]*>[\s\S]*?<\/p>)/g).filter(html => html.trim()).map(html => ({
        html, serviceIds: html.startsWith('<p') ? linkedContentIds(html).filter(isService) : [],
    }));
}
export function unwrapServiceLink(html, id) {
    return html.replace(/<a href="\/(?:en|hi)\/p\/([^"#?]+)[^"]*"[^>]*>([\s\S]*?)<\/a>/g, (link, linkedId, label) => linkedId === id ? label : link);
}
