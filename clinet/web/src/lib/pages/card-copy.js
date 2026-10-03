/** Contextual copy remains source-owned; card structure and its footer action are shared. */
import { toSlugHref } from '@/lib/page-routes';
export function cardCopy(html, href) {
    const heading = html.match(/^\s*<h3[^>]*>([\s\S]*?)<\/h3>/);
    const strong = html.match(/^\s*<p><strong>([\s\S]*?)<\/strong><br>/);
    const linked = html.match(/^\s*<p><a [^>]*>([\s\S]*?)<\/a>([.।])?\s*/);
    const clean = (value) => value.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
    let copy = { html };
    if (heading)
        copy = { title: clean(heading[1]), html: html.slice(heading[0].length), sectionId: heading[0].match(/id="([^"]+)"/)?.[1] };
    else if (strong)
        copy = { title: clean(strong[1]), html: '<p>' + html.slice(strong[0].length) };
    else if (linked)
        copy = { title: clean(linked[1]) + (linked[2] || ''), html: '<p>' + html.slice(linked[0].length) };
    // Move the final self-destination action into the existing footer, preserving other editorial links.
    const ending = copy.html?.match(/\s*<a href="([^"]+)">([^<]+)<\/a>[.।]?\s*<\/p>\s*$/);
    // Content links are /{locale}/p/{ID}; `href` may already be the slug URL.
    if (ending && (ending[1] === href || toSlugHref(ending[1]) === href)) {
        copy.linkLabel = clean(ending[2]);
        copy.html = copy.html.slice(0, ending.index) + '</p>';
        copy.html = copy.html.replace(/<p>\s*<\/p>\s*$/, '');
    }
    return copy;
}
export function linkedContentIds(html) { return [...new Set([...html.matchAll(/href="\/(?:en|hi)\/p\/([^"#?]+)(?:[^"]*)"/g)].map(m => m[1]))]; }
