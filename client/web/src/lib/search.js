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

// ── Ranking ─────────────────────────────────────────────────────────────────
// A specific search must put the exact service first ("CTE" -> the CTE
// consent service, not the "Statutory Approvals" family that merely mentions
// it). Lower score = better. Families / categories never outrank an exact or
// prefix title match of a real service.
const TYPE_RANK = { service: 0, "additional-service": 1, "service-family": 2, "service-index": 3 };

function scoreService(service, q, index) {
  const titles = [service.h1, service.title].filter(Boolean).map(normalize);
  const code = normalize(service.code ?? "");
  let score = 8;

  if (code && code === q) score = 0;
  for (const title of titles) {
    if (title === q) score = Math.min(score, 0);
    else if (title.startsWith(`${q} `) || title.startsWith(q)) score = Math.min(score, 1);
    else if (` ${title}`.includes(` ${q}`)) score = Math.min(score, 2);
    else if (title.includes(q)) score = Math.min(score, 3);
    else if (q.split(" ").every((word) => ` ${title}`.includes(` ${word}`))) score = Math.min(score, 4);
  }
  if (score === 8) {
    const haystack = normalize([service.short_description, service.type].join(" "));
    score = haystack.includes(q) ? 6 : 7; // description or synonym match only
  }
  return [score, TYPE_RANK[service.type] ?? 4, titles[0]?.length ?? 0, index];
}

// Services that match `query`, best match first. Without a query the list is
// returned unchanged (browse mode).
export function searchServices(services = [], query = "") {
  const q = normalize(query);
  if (!q) return services;
  return services
    .filter((service) => matchesSearch(service, query))
    .map((service, index) => ({ service, key: scoreService(service, q, index) }))
    .sort((a, b) => {
      for (let i = 0; i < a.key.length; i++) if (a.key[i] !== b.key[i]) return a.key[i] - b.key[i];
      return 0;
    })
    .map((entry) => entry.service);
}
