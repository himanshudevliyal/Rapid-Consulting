const voidTags = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const visibleText = (html) => html.replace(/<[^>]*>/g, '').trim();
const questionText = (html) => /[?？]$/.test(visibleText(html)) && !/<(?:a|button|input)\b/i.test(html);
const idOf = (opening) => opening.match(/\bid="([^"]+)"/)?.[1];
// B006 composition reviewed on 15 September 2026: the first paragraph answers
// this question; the next paragraph is separate B019 reading guidance. This
// explicit boundary does not extend to unfamiliar multi-paragraph answers.
const reviewedSingleParagraphAnswers = new Set(['should-the-adviser-make-every-decision-for-me']);
// The compiler emits trusted, balanced HTML. Walk its top-level blocks so text
// inside tables, lists and quotations cannot accidentally become a disclosure.
function topLevelBlocks(html) {
    const blocks = [];
    const stack = [];
    let offset = 0;
    let start = 0;
    let rootTag = '';
    for (const match of html.matchAll(/<!--[\s\S]*?-->|<\/?([a-z][\w-]*)\b[^>]*>/gi)) {
        if (!match[1])
            continue;
        const tag = match[1].toLowerCase();
        const closing = match[0].startsWith('</');
        if (!stack.length) {
            if (match.index > offset)
                blocks.push({ tag: 'raw', html: html.slice(offset, match.index) });
            start = match.index;
            rootTag = tag;
        }
        if (closing) {
            if (stack.pop() !== tag)
                return [{ tag: 'raw', html }];
        }
        else if (!voidTags.has(tag) && !match[0].endsWith('/>'))
            stack.push(tag);
        if (!stack.length) {
            offset = match.index + match[0].length;
            blocks.push({ tag: rootTag, html: html.slice(start, offset) });
        }
    }
    if (stack.length)
        return [{ tag: 'raw', html }];
    if (offset < html.length)
        blocks.push({ tag: 'raw', html: html.slice(offset) });
    return blocks;
}
function boldQuestion(block) {
    if (block.tag !== 'p')
        return null;
    const match = block.html.match(/^<p(\s[^>]*)?>\s*<strong(?:\s[^>]*)?>([\s\S]*?)<\/strong>([\s\S]*?)<\/p>$/i);
    if (!match || !questionText(match[2]) || !visibleText(match[3]))
        return null;
    return { kind: 'question', questionHtml: match[2], answerHtml: `<p>${match[3]}</p>`, id: idOf(match[1] || '') };
}
const contactParagraph = (block) => block.tag === 'p' && /href="(?:https:\/\/wa\.me\/|\/(?:en|hi)\/p\/C01(?:["?#]))/i.test(block.html);
/** Preserve ambiguous question boundaries as visible prose and report them. */
export function parseFaqContent(html) {
    const source = topLevelBlocks(html);
    const blocks = [];
    const issues = [];
    const appendHtml = (value) => {
        const previous = blocks.at(-1);
        if (previous?.kind === 'html')
            previous.html += value;
        else
            blocks.push({ kind: 'html', html: value });
    };
    for (let index = 0; index < source.length; index++) {
        const block = source[index];
        const bold = boldQuestion(block);
        if (bold) {
            blocks.push(bold);
            continue;
        }
        const heading = block.tag === 'h3' ? block.html.match(/^<h3\b([^>]*)>([\s\S]*?)<\/h3>$/i) : null;
        if (!heading || !questionText(heading[2])) {
            appendHtml(block.html);
            continue;
        }
        let end = index + 1;
        while (end < source.length && !/^h[1-6]$/.test(source[end].tag) && !boldQuestion(source[end]))
            end++;
        const content = source.slice(index + 1, end).map((entry, offset) => ({ entry, index: index + 1 + offset })).filter(({ entry }) => entry.html.trim());
        const contactStart = content.findIndex(({ entry }) => contactParagraph(entry));
        const candidate = contactStart < 0 ? content : content.slice(0, contactStart);
        const answer = reviewedSingleParagraphAnswers.has(idOf(heading[1]) || '') ? candidate.slice(0, 1) : candidate;
        // A heading plus one paragraph is an unambiguous pair in these manuscripts.
        // Extra non-contact prose could be an answer continuation or closing guidance;
        // without a content boundary, leave that whole question visible.
        if (answer.length !== 1 || answer[0].entry.tag !== 'p') {
            if (answer.length)
                issues.push(`Ambiguous answer boundary: ${idOf(heading[1]) || visibleText(heading[2])}`);
            appendHtml(block.html);
            continue;
        }
        blocks.push({ kind: 'question', id: idOf(heading[1]), questionHtml: heading[2], answerHtml: answer[0].entry.html });
        index = answer[0].index;
    }
    return { blocks: blocks.length ? blocks : [{ kind: 'html', html }], issues };
}
export function hasFaqContent(html) {
    return parseFaqContent(html).blocks.some(block => block.kind === 'question');
}
