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

// An optional attribute of a heading, e.g. data-eyebrow="WHERE INDUSTRY IS ALLOWED".
const headingAttr = (attributes, name) => {
  const found = attributes.match(new RegExp(`\\bdata-${name}=["']([^"']*)["']`, "i"));
  return found ? found[1].replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, (match) => ENTITIES[match]) : undefined;
};

// Splits editor HTML at its <h2> headings: { intro, sections: [{ id, title, html, eyebrow?, nav?, tone? }] }.
// `intro` is whatever comes before the first heading. A heading can carry
//   data-eyebrow  the small label above the heading,
//   data-nav      the label in the "On this page" menu ("" = not in the menu),
//   data-tone     "navy" or "grey": the section is drawn as a panel.
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
    const eyebrow = headingAttr(mark[1], "eyebrow");
    const nav = headingAttr(mark[1], "nav");
    const tone = headingAttr(mark[1], "tone");
    return {
      id,
      title,
      html: source.slice(mark.index + mark[0].length, end).trim(),
      ...(eyebrow ? { eyebrow } : {}),
      ...(nav !== undefined ? { nav } : {}),
      ...(tone ? { tone } : {}),
    };
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

// ── People (authors, reviewers, team) ───────────────────────────────────────

// Team profile address. Profiles are English only, like the other API records.
export const personHref = (slug) => `/${LOCALE}/team/${slug}`;

// An author / reviewer embedded in an article, scheme or case study:
// { id, slug, name, designation, photo, placeholder, href } or null.
export const personRef = (person) =>
  person && person.slug
    ? {
        id: person.id,
        slug: person.slug,
        name: person.name,
        designation: person.designation ?? "",
        photo: getFileUrl(person.photo) ?? undefined,
        placeholder: !!person.is_placeholder,
        href: personHref(person.slug),
      }
    : null;

// Author and reviewer are separate roles of one content item. A reviewer
// credit is public only when the review is completed (review_status "completed",
// or no status recorded at all, as on older rows); "assigned", "pending" and
// "none" keep the reviewer hidden. A review date is only shown once a reviewer
// is shown and the date has been confirmed.
const reviewIsPublic = (record) => record.review_status == null || record.review_status === "completed";

export const editorial = (record) => {
  const reviewer = reviewIsPublic(record) ? personRef(record.reviewer) : null;
  return {
    author: personRef(record.author),
    reviewer,
    reviewedAt: reviewer && record.reviewed_at ? record.reviewed_at : null,
  };
};

// ── Articles ────────────────────────────────────────────────────────────────

const ARTICLE = { type: "article", segment: "articles", icon: "file-text", group: "Articles & guides" };
const GUIDE = { type: "guide", segment: "guides", icon: "file-text", group: "Articles & guides" };

// An article record is a guide when its type says so (own section and URLs).
const writingKind = (record) => (record.type === "guide" ? GUIDE : ARTICLE);

export const articleToSummary = (article) => ({
  ...common(article, writingKind(article)),
  description: article.meta_description || article.excerpt || excerptOf(article.content),
  ...editorial(article),
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
    pdfUrl: getFileUrl(article.pdf_url) ?? undefined,
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
const METRIC = /^((?:(?:Approximately|About)\s+)?₹\s?[\d,.]+(?:\s?(?:lakh|crore|cr|million))?)(?:\s+in\s+(.+))?$/i;

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
    // `part` says which field a section came from (challenge | solution | result).
    if (!headed.length) return add({ id: field, title: fallbackTitle, html: intro, part: field });
    if (intro) {
      if (field === "challenge" && !introHtml) introHtml = intro;
      else add({ id: field, title: fallbackTitle, html: intro, part: field });
    }
    headed.forEach((section) => add({ ...section, part: field }));
  });

  if (!introHtml) {
    // The client name stays private: industry and place only.
    const facts = [record.industry, record.location].filter(Boolean).join(" · ");
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

// Redacted document, dated milestone and approved quote: each part optional.
const caseProof = (record) => {
  const proof = {
    image: getFileUrl(record.proof_image) ?? undefined,
    caption: record.proof_caption ?? "",
    milestoneLabel: record.milestone_label ?? "",
    milestoneDate: record.milestone_date ?? "",
    quote: record.quote_text ?? "",
    quoteBy: record.quote_attribution ?? "",
  };
  return proof.image || proof.milestoneLabel || proof.milestoneDate || proof.quote ? proof : null;
};

// A tag written "key:Value" (e.g. "scheme:Testing equipment subsidy") gives its value.
const taggedValue = (tags = [], key) => {
  const prefix = `${key}:`;
  const found = (tags ?? []).find((tag) => String(tag).toLowerCase().startsWith(prefix));
  return found ? String(found).slice(prefix.length).trim() : "";
};

// A name the API may send either flat (`scheme_name`) or as a linked record
// (`scheme: { title | name }`). Empty when the record has neither.
const nameOf = (record, flat, nested) => {
  const linked = record[nested];
  return String(record[flat] || linked?.title || linked?.name || "").trim();
};

// A case marked as a draft or a sample (tag "Draft" / "Sample", or a flag /
// status the API may send). Shown as "DRAFT CASE" on the case page.
const isDraftCase = (record) =>
  record.is_draft === true ||
  record.is_sample === true ||
  /^(?:draft|sample)$/i.test(String(record.status ?? "")) ||
  (record.tags ?? []).some((tag) => /^(?:draft|sample)(?:\b|[\s_-])/i.test(String(tag).trim()));

export const caseStudyToSummary = (record) => {
  const { introHtml } = caseBody(record);
  return {
    ...common(record, CASE),
    description: caseDescription(record),
    ...readMetric(introHtml),
    // Industry is shown as the filter group on the index page.
    industry: record.industry ?? "",
    client: record.client_name ?? "",
    // Project context shown on the case card (the client's name stays private).
    location: record.location ?? "",
    sector: record.sector || record.industry || "",
    rapidRole: record.rapid_role ?? "",
    // Optional rows of the case card / "At a glance" box: present only when the
    // API record carries them (nothing is guessed from the text).
    // The scheme row: a linked record when the API sends one, else a tag written as "scheme:Name".
    schemeName: nameOf(record, "scheme_name", "scheme") || taggedValue(record.tags, "scheme"),
    serviceName: nameOf(record, "service_name", "service"),
    industryName: nameOf(record, "industry_name", "industry_record") || (typeof record.industry === "object" ? nameOf(record, "", "industry") : ""),
    isDraft: isDraftCase(record),
    ...editorial(record),
    // Evidence of the outcome, only when Rapid supplied approved assets.
    proof: caseProof(record),
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

// "open" | "upcoming" | "closed" | "historical" | "unspecified"
export const SCHEME_STATUSES = ["open", "upcoming", "closed", "historical", "unspecified"];

// The quick-assessment panel: what the scheme gives, for which activity, who
// administers it, and where it stands in time (policy period, application
// window and review date are three different things).
export const schemeFacts = (scheme) => ({
  assistanceType: scheme.assistance_type ?? "",
  activity: scheme.relevant_activity ?? "",
  authority: scheme.ministry ?? "",
  policyPeriod: scheme.policy_period ?? "",
  applicationWindow: scheme.application_window ?? "",
  status: SCHEME_STATUSES.includes(scheme.status) ? scheme.status : "unspecified",
  // The "at a glance" rows written in the admin panel (label, text, bold); empty = the fixed facts above.
  rows: (Array.isArray(scheme.quick_facts) ? scheme.quick_facts : [])
    .map((row) => ({ label: String(row?.label ?? "").trim(), value: String(row?.value ?? "").trim(), bold: !!row?.bold }))
    .filter((row) => row.label),
});

// Extra sections of a scheme page: the same shape a service's sections have.
const schemeExtraSections = (scheme) =>
  (Array.isArray(scheme.sections) ? scheme.sections : [])
    .filter((section) => section && section.title)
    .map((section, index) => ({
      key: section.key || `section-${index + 1}`,
      id: section.key || `section-${index + 1}`,
      title: section.title,
      nav_label: section.nav_label || "",
      eyebrow: section.eyebrow || "",
      role: section.role || "content",
      html: section.html || "",
      intro_html: section.intro_html || "",
      outro_html: section.outro_html || "",
      items: (section.items ?? []).filter((item) => item?.title).map((item) => ({ key: item.key || "", title: item.title, html: item.html || "" })),
    }));

export const schemeToSummary = (scheme) => ({
  ...common(scheme, SCHEME),
  description: stripTags(scheme.description) ? excerptOf(scheme.description) : "",
  ministry: scheme.ministry ?? "",
  topic: schemeTopic(scheme),
  featured: !!scheme.is_featured,
  ...editorial(scheme),
  facts: schemeFacts(scheme),
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
  pdfUrl: getFileUrl(scheme.pdf_url) ?? undefined,
  extraSections: schemeExtraSections(scheme),
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
    // Optional structured content the industry page uses when the record carries it.
    projectTypes: Array.isArray(industry.projectTypes) ? industry.projectTypes : undefined,
    watchOuts: Array.isArray(industry.watchOuts) ? industry.watchOuts : undefined,
    claims: Array.isArray(industry.claims) ? industry.claims : undefined,
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
  slug: adviser.slug ?? "",
  name: adviser.name,
  designation: adviser.designation ?? "",
  group: adviser.team_group ?? "",
  bio: adviser.bio ?? "",
  photo: getFileUrl(adviser.photo) ?? undefined,
  linkedin: adviser.linkedin_url ?? "",
  expertise: String(adviser.expertise ?? "")
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean),
  // A labelled stand-in until the real photo and biography arrive.
  placeholder: !!adviser.is_placeholder,
  href: adviser.slug ? personHref(adviser.slug) : "",
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

// ── Sessions (webinars) ──────────────────────────────────────────────────────

// "Title | https://…" per line -> [{ title, href }]
const resourceLines = (text = "") =>
  String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title, href] = line.split("|").map((part) => part.trim());
      return href ? { title, href } : { title: line, href: "" };
    });

export const SESSION_STATES = ["upcoming", "closed", "recording"];

// Card in the list of sessions. `state` is worked out by the API:
//   upcoming  - in the future and registration open
//   closed    - over (or registration shut) and no recording yet
//   recording - a recording is available
export const sessionToSummary = (session) => ({
  id: session.slug,
  slug: session.slug,
  locale: LOCALE,
  type: "session",
  title: session.title,
  h1: session.title,
  href: `/${LOCALE}/sessions/${session.slug}`,
  topic: session.topic ?? "",
  audience: session.audience ?? "",
  speaker: session.speaker_name ?? "",
  speakerTitle: session.speaker_title ?? "",
  startsAt: session.starts_at ?? "",
  durationMinutes: session.duration_minutes ?? null,
  state: SESSION_STATES.includes(session.state) ? session.state : "closed",
  registrationUrl: session.state === "upcoming" ? (session.registration_url ?? "") : "",
  recordingUrl: session.recording_url ?? "",
  image: getFileUrl(session.cover_image) ?? undefined,
  description: excerptOf(session.summary, 200),
});

export const sessionToPage = (session) => ({
  ...sessionToSummary(session),
  introHtml: session.summary || "",
  related: resourceLines(session.related_resources),
  sections: [],
});

// ── Community groups ─────────────────────────────────────────────────────────

export const communityGroupToItem = (group) => ({
  id: group.id,
  name: group.name,
  audience: group.audience ?? "",
  updates: String(group.updates ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean),
  cadence: group.cadence ?? "",
  // No invite link yet: shown as "coming soon", never as a dead button.
  joinUrl: group.join_url ?? "",
  placements: group.placements ?? [],
});

// ── Team profile page ────────────────────────────────────────────────────────

export const adviserToProfile = (adviser) => ({
  ...adviserToMember(adviser),
  id: adviser.slug,
  uuid: adviser.id,
  type: "person",
  locale: LOCALE,
  title: adviser.name,
  h1: adviser.name,
  href: personHref(adviser.slug),
});
