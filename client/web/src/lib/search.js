// Service search used by the header search dialog and the services directory.
// Synonyms let visitors search in English or Hindi terms.
const synonyms = [
  ["cte", "consent to establish", "स्थापना सहमति"],
  ["cto", "consent to operate", "संचालन सहमति"],
  ["pollution", "environment", "प्रदूषण", "पर्यावरण"],
  ["subsidy", "subsidies", "incentives", "अनुदान", "सब्सिडी"],
  ["loan", "finance", "ऋण", "लोन", "वित्त"],
  ["license", "licence", "licences", "licenses", "लाइसेंस"],
  ["fire", "अग्नि", "फायर"],
  ["factory", "manufacturing", "फैक्ट्री", "कारखाना", "विनिर्माण"],
  ["udyam", "msme", "उद्यम", "एमएसएमई"],
];

const normalize = (value) =>
  value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[&/(),:–—-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export function matchesSearch(service, query) {
  const q = normalize(query);
  if (!q) return true;
  const haystack = normalize(
    [service.code, service.title, service.h1, service.short_description, service.type].join(" "),
  );
  if (haystack.includes(q)) return true;
  const phrase = synonyms.find((words) => words.some((term) => normalize(term) === q));
  if (phrase?.some((term) => haystack.includes(normalize(term)))) return true;
  return q.split(" ").every((word) => {
    if (haystack.includes(word)) return true;
    const group = synonyms.find((words) => words.some((term) => normalize(term) === word));
    return !!group?.some((term) => haystack.includes(normalize(term)));
  });
}
