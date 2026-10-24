import { getFileUrl } from "@/utils/file-url";

// The API stores plain records (title, slug, HTML body, cover image, category).
// The page components read "page records" (h1, sections, introHtml, href,
// type…). These pure functions convert one into the other. Records from the
// API are English only.

const LOCALE = "en";

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'", "&nbsp;": " " };

export const stripTags = (html = "") =>
  String(html ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (match) => ENTITIES[match])
    .replace(/\s+/g, " ")
    .trim();

const excerptOf = (html, max = 180) => {
  const text = stripTags(html);
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
};

const slugify = (text) =>
  text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");

const escapeHtml = (text) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Splits editor HTML at its <h2> headings: { intro, sections: [{ id, title, html }] }.
// `intro` is whatever comes before the first heading.
export const splitSections = (html = "") => {
  const source = String(html ?? "");
  const marks = [...source.matchAll(/<h2([^>]*)>([\s\S]*?)<\/h2>/gi)];
  if (!marks.length) return { intro: source.trim(), sections: [] };

  const used = new Set();
  const sections = marks.map((mark, index) => {
    const title = stripTags(mark[2]);
    const wanted = mark[1].match(/\bid=["']([^"']+)["']/i)?.[1] || slugify(title) || `section-${index + 1}`;
    let id = wanted;
    for (let n = 2; used.has(id); n++) id = `${wanted}-${n}`;
    used.add(id);
    const end = marks[index + 1]?.index ?? source.length;
    return { id, title, html: source.slice(mark.index + mark[0].length, end).trim() };
  });
  return { intro: source.slice(0, marks[0].index).trim(), sections };
};

const slugOf = (record) => record.slug;
const withImage = (record) => ({ image: getFileUrl(record.cover_image) ?? undefined });

// Fields every record has in both shapes.
const common = (record, { type, segment, icon, group }) => ({
  id: slugOf(record),
  slug: slugOf(record),
  locale: LOCALE,
  type,
  title: record.title,
  h1: record.title,
  href: `/${LOCALE}/${segment}/${slugOf(record)}`,
  icon,
  group: record.category?.title || group,
  family: record.category?.slug || "",
  hasHindi: false,
  status: "published",
  aliases: [],
  tags: record.tags ?? [],
  publishedAt: record.published_at ?? record.created_at ?? null,
  ...withImage(record),
});

// ── Articles ────────────────────────────────────────────────────────────────

const ARTICLE = { type: "article", segment: "articles", icon: "file-text", group: "Articles & guides" };
const GUIDE = { type: "guide", segment: "guides", icon: "book-open", group: "Articles & guides" };

// An article record is a guide when its type says so (own section and URLs).
const writingKind = (record) => (record.type === "guide" ? GUIDE : ARTICLE);

export const articleToSummary = (article) => ({
  ...common(article, writingKind(article)),
  description: article.meta_description || article.excerpt || excerptOf(article.content),
});

export const articleToPage = (article) => {
  const { intro, sections } = splitSections(article.content);
  const lead = article.excerpt ? `<p>${escapeHtml(article.excerpt)}</p>` : "";
  return {
    ...articleToSummary(article),
    metaTitle: article.meta_title || undefined,
    // Without headings the whole body is the page's opening copy.
    introHtml: intro || lead,
    sections,
    sourceUrls: [],
    relatedIds: [],
    // "Draft" is the page template's marker for "no editorial review banner".
    reviewLabel: "Draft",
  };
};

// ── Case studies ─────────────────────────────────────────────────────────────

const CASE = { type: "case-study", segment: "case-studies", icon: "hand-coins", group: "Case studies" };

// "Approximately ₹30 lakh in recorded new safety-equipment expenditure"
//   -> { metric: "Approximately ₹30 lakh", metricLabel: "recorded new safety-equipment expenditure" }
const METRIC = /^((?:Approximately\s+)?₹\s?[\d,.]+(?:\s?(?:lakh|crore|cr|million))?)(?:\s+in\s+(.+))?$/i;

const readMetric = (introHtml) => {
  for (const [, inner] of introHtml.matchAll(/<p[^>]*>\s*<strong>([\s\S]*?)<\/strong>\s*<\/p>/gi)) {
    const match = stripTags(inner).match(METRIC);
    if (match) return { metric: match[1].replace(/\s+/g, " "), metricLabel: match[2] ?? "" };
  }
  return {};
};

const CASE_PARTS = [
  ["challenge", "The challenge"],
  ["solution", "What Rapid did"],
  ["result", "The result"],
];

// challenge + solution + result -> opening copy + headed sections. A part
// without its own headings becomes one section named after the part.
const caseBody = (record) => {
  let introHtml = "";
  const sections = [];
  const used = new Set();
  const add = (section) => {
    let id = section.id;
    for (let n = 2; used.has(id); n++) id = `${section.id}-${n}`;
    used.add(id);
    sections.push({ ...section, id });
  };

  CASE_PARTS.forEach(([field, fallbackTitle]) => {
    const html = (record[field] ?? "").trim();
    if (!html) return;
    const { intro, sections: headed } = splitSections(html);
    if (!headed.length) return add({ id: field, title: fallbackTitle, html: intro });
    if (intro) {
      if (field === "challenge" && !introHtml) introHtml = intro;
      else add({ id: field, title: fallbackTitle, html: intro });
    }
    headed.forEach(add);
  });

  if (!introHtml) {
    const facts = [record.client_name, record.industry].filter(Boolean).join(" · ");
    introHtml = facts ? `<p><strong>${escapeHtml(facts)}</strong></p>` : "";
  }
  return { introHtml, sections };
};

const caseDescription = (record) => {
  const { introHtml, sections } = caseBody(record);
  const paragraphs = [...introHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)]
    .filter(([, inner]) => !/^\s*<strong>/i.test(inner))
    .map(([, inner]) => inner);
  return excerptOf(paragraphs[0] || sections[0]?.html || introHtml);
};

export const caseStudyToSummary = (record) => {
  const { introHtml } = caseBody(record);
  return {
    ...common(record, CASE),
    description: caseDescription(record),
    ...readMetric(introHtml),
    // Industry is shown as the filter group on the index page.
    industry: record.industry ?? "",
    client: record.client_name ?? "",
  };
};

export const caseStudyToPage = (record) => {
  const { introHtml, sections } = caseBody(record);
  return {
    ...caseStudyToSummary(record),
    metaTitle: undefined,
    introHtml,
    sections,
    sourceUrls: [],
    relatedIds: [],
    reviewLabel: "Published",
  };
};

// ── Schemes ──────────────────────────────────────────────────────────────────

const SCHEME = { type: "scheme", segment: "schemes", icon: "hand-coins", group: "Schemes" };

// The topic a scheme is filed under is its first tag that is not a service
// family code (S01…): editors set it in the admin panel as a tag.
export const schemeTopic = (scheme) =>
  (scheme.tags ?? []).find((tag) => tag && !/^S\d{2}$/.test(tag)) || "Other programme support";

export const schemeToSummary = (scheme) => ({
  ...common(scheme, SCHEME),
  description: stripTags(scheme.description) ? excerptOf(scheme.description) : "",
  ministry: scheme.ministry ?? "",
  topic: schemeTopic(scheme),
  featured: !!scheme.is_featured,
});

const schemeSection = (id, title, html) => (html?.trim() ? [{ id, title, html }] : []);

export const schemeToPage = (scheme) => ({
  ...schemeToSummary(scheme),
  metaTitle: undefined,
  introHtml: scheme.description || "",
  sections: [
    ...schemeSection("eligibility", "Eligibility", scheme.eligibility),
    ...schemeSection("benefits", "Benefits", scheme.benefits),
    ...schemeSection("how-to-apply", "How to apply", scheme.application_process),
  ],
  sourceUrls: scheme.official_url ? [scheme.official_url] : [],
  relatedIds: [],
  reviewLabel: "Draft",
});

// ── Industries ───────────────────────────────────────────────────────────────

const INDUSTRY = { type: "industry", segment: "industries", icon: "factory", group: "Industries" };

export const industryToSummary = (industry) => ({
  id: industry.slug,
  slug: industry.slug,
  locale: LOCALE,
  type: INDUSTRY.type,
  title: industry.name,
  h1: industry.h1 || industry.name,
  href: `/${LOCALE}/${INDUSTRY.segment}/${industry.slug}`,
  icon: industry.icon || INDUSTRY.icon,
  group: INDUSTRY.group,
  family: "",
  hasHindi: false,
  status: "published",
  aliases: [],
  tags: [],
  description: industry.description || excerptOf(industry.intro),
  image: getFileUrl(industry.image) ?? undefined,
  serviceSlugs: industry.service_slugs ?? [],
  schemeSlugs: industry.scheme_slugs ?? [],
});

// The industry page: opening copy, the body split at its <h2> headings, and
// (from the single-industry endpoint) the services and schemes chosen for it.
export const industryToPage = (industry) => {
  const { intro, sections } = splitSections(industry.content);
  const lead = industry.description ? `<p>${escapeHtml(industry.description)}</p>` : "";
  return {
    ...industryToSummary(industry),
    metaTitle: industry.meta_title || undefined,
    description: industry.meta_description || industry.description || excerptOf(industry.intro),
    introHtml: industry.intro || intro || lead,
    sections,
    sourceUrls: [],
    relatedIds: [],
    reviewLabel: "Draft",
    discovery: {
      services: industry.services ?? [],
      schemes: (industry.schemes ?? []).map(schemeToSummary),
      note: industry.note || "",
    },
  };
};

// ── Careers ──────────────────────────────────────────────────────────────────

const JOB_TYPES = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship",
  remote: "Remote",
};

// Card in the list of open roles.
export const jobToSummary = (job) => ({
  id: job.slug,
  slug: job.slug,
  locale: LOCALE,
  type: "job",
  title: job.title,
  h1: job.title,
  href: `/${LOCALE}/careers/${job.slug}`,
  description: excerptOf(job.description || job.responsibilities, 200),
  location: job.location ?? "",
  jobType: JOB_TYPES[job.job_type] ?? "",
  experience: job.experience ?? "",
  closingDate: job.closing_date ?? "",
});

// The job page: the three text blocks of the record, each its own section.
export const jobToPage = (job) => ({
  ...jobToSummary(job),
  introHtml: job.description || "",
  sections: [
    ...(job.responsibilities?.trim() ? [{ id: "the-work", title: "The work", html: job.responsibilities }] : []),
    ...(job.requirements?.trim() ? [{ id: "relevant-skills", title: "Relevant skills", html: job.requirements }] : []),
  ],
});

// ── Team (advisers) ──────────────────────────────────────────────────────────

export const adviserToMember = (adviser) => ({
  id: adviser.id,
  name: adviser.name,
  designation: adviser.designation ?? "",
  group: adviser.team_group ?? "",
  bio: adviser.bio ?? "",
  photo: getFileUrl(adviser.photo) ?? undefined,
  linkedin: adviser.linkedin_url ?? "",
});

// Members under their group heading, in the order the admin panel lists them
// (groups appear in the order their first member does).
export const groupMembers = (members) => {
  const groups = [];
  for (const member of members) {
    let group = groups.find((entry) => entry.title === member.group);
    if (!group) groups.push((group = { title: member.group, members: [] }));
    group.members.push(member);
  }
  return groups;
};
