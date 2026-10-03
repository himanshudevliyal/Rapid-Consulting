export function languageHref(page) {
    const locale = page.locale === 'hi' ? 'en' : 'hi';
    const path = page.id === 'H01' ? '' : `/p/${page.id}`;
    return locale === 'hi' && !page.hasHindi ? `/en${path}?language=hi-unavailable` : `/${locale}${path}`;
}
const synonyms = [
    ['cte', 'consent to establish', 'स्थापना सहमति'],
    ['cto', 'consent to operate', 'संचालन सहमति'],
    ['pollution', 'environment', 'प्रदूषण', 'पर्यावरण'],
    ['subsidy', 'subsidies', 'incentives', 'अनुदान', 'सब्सिडी'],
    ['loan', 'finance', 'ऋण', 'लोन', 'वित्त'],
    ['license', 'licence', 'licences', 'licenses', 'लाइसेंस'],
    ['fire', 'अग्नि', 'फायर'],
    ['factory', 'manufacturing', 'फैक्ट्री', 'कारखाना', 'विनिर्माण'],
    ['udyam', 'msme', 'उद्यम', 'एमएसएमई'],
];
const normalize = (value) => value.normalize('NFKC').toLowerCase().replace(/[&/(),:–—-]/g, ' ').replace(/\s+/g, ' ').trim();
export function matchesSearch(page, query) {
    const q = normalize(query);
    if (!q)
        return true;
    const haystack = normalize([page.id, page.title, page.h1, page.description, page.type, page.group, ...(page.aliases ?? [])].join(' '));
    if (haystack.includes(q))
        return true;
    const phrase = synonyms.find(words => words.some(term => normalize(term) === q));
    if (phrase?.some(term => haystack.includes(normalize(term))))
        return true;
    return q.split(' ').every(word => {
        if (haystack.includes(word))
            return true;
        const group = synonyms.find(words => words.some(term => normalize(term) === word));
        return !!group?.some(term => haystack.includes(normalize(term)));
    });
}
export function pageLabel(page, locale) {
    return `${page.h1 || page.title}${locale === 'hi' && page.locale === 'en' ? ' (English)' : ''}`;
}
export function formatLabel(type, locale = 'en') {
    const labels = {
        article: ['Article', 'लेख'], guide: ['Guide', 'गाइड'], service: ['Service', 'सेवा'],
        'service-family': ['Service family', 'सेवा समूह'], scheme: ['Scheme', 'योजना'],
        industry: ['Industry', 'उद्योग'], 'case-study': ['Case study', 'केस स्टडी'],
        'article-index': ['Guides & articles', 'गाइड और लेख'], 'scheme-index': ['Scheme directory', 'योजना निर्देशिका'],
        'service-index': ['All services', 'सभी सेवाएँ'], 'case-index': ['Case studies', 'केस स्टडी'],
    };
    return labels[type]?.[locale === 'hi' ? 1 : 0] ?? type.replaceAll('-', ' ');
}
export function filterDirectory(items, query, format, family) {
    return items.filter(item => matchesSearch(item, query) && (!format || item.type === format) && (!family || (item.family || item.group) === family));
}
export function familyLabel(family, fallback, locale) {
    const labels = { S01: ['Subsidies & Incentives', 'सब्सिडी और प्रोत्साहन'], S02: ['Statutory Approvals', 'वैधानिक अनुमतियाँ'], S03: ['Licences & Certifications', 'लाइसेंस और प्रमाणन'], S04: ['Industrial Insurance', 'औद्योगिक बीमा'], S05: ['Finance & Other Services', 'वित्त और अन्य सेवाएँ'] };
    return labels[family]?.[locale === 'hi' ? 1 : 0] || fallback || family;
}
export function schemeTopic(page) {
    const text = `${page.title} ${(page.aliases || []).join(' ')}`.toLowerCase();
    if (/export|freight|apeda|market|trade|fair/.test(text))
        return 'Exports & market access';
    if (/energy|solar|water|environment|pollution|waste|green|efficien/.test(text))
        return 'Energy & environment';
    if (/quality|patent|testing|certif|technology|research|intellectual/.test(text))
        return 'Quality, technology & research';
    if (/employ|skill|training|apprentice/.test(text))
        return 'Skills & employment';
    if (/cluster|infrastructure|park|cold|logistic/.test(text))
        return 'Infrastructure & clusters';
    if (/capital|investment|interest|loan|credit|finance|sgst|stamp/.test(text))
        return 'Investment & finance';
    return 'Other programme support';
}
