import records from '@/lib/data/industry-catalogue.json';
import { toSlugHref } from '@/lib/page-routes';
export const industryCatalogue = records.industries;
export function normalizeIndustry(value) {
    return typeof value === 'string' && industryCatalogue.some(r => r.id === value) ? value : '';
}
export function industryItems(items, industry, kind) {
    const record = industryCatalogue.find(r => r.id === industry);
    if (!record)
        return items;
    const byId = new Map(items.map(p => [p.id, p]));
    return record[kind].map(id => byId.get(id)).filter((p) => !!p);
}
export function industryArchiveHref(industry, kind, locale) {
    return `${toSlugHref(records.archives[locale][kind])}?industry=${encodeURIComponent(industry)}`;
}
export function industryOptions(locale) {
    return industryCatalogue.map(r => ({ id: r.id, label: r.labels[locale] }));
}
