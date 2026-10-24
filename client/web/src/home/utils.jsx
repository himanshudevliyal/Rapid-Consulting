export const paragraphs = (html) =>
  [...html.matchAll(/<p(?:\s[^>]*)?>[\s\S]*?<\/p>/g)].map((m) => m[0]);
