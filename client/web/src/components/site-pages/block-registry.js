import { mergeRegistry } from "@/lib/content/site-page-adapters";

import { CalloutBlock, calloutEmpty } from "./callout";
import { CardGridBlock, cardGridEmpty } from "./card-grid";
import { CaseTilesBlock, caseTilesEmpty } from "./case-tiles";
import { ClosingPanelBlock, closingPanelEmpty } from "./closing-panel-block";
import { ComparisonBlock, comparisonEmpty } from "./comparison";
import { CtaPanelBlock, ctaPanelEmpty } from "./cta-panel";
import { DocumentsChecklistBlock, documentsChecklistEmpty } from "./documents-checklist";
import { EnquiryFormBlock, enquiryFormEmpty } from "./enquiry-form";
import { FaqBlock, faqEmpty, faqEntries } from "./faq";
import { FaqHubBlock, faqHubEmpty, faqHubEntries } from "./faq-hub-block";
import {
  LinkedArticlesBlock,
  LinkedCasesBlock,
  LinkedSchemesBlock,
  LinkedServicesBlock,
  PeopleBlock,
  linkedEmpty,
} from "./linked";
import { LogoStripBlock, logoStripEmpty } from "./logo-strip-block";
import {
  BannerBlock,
  CaseCardsBlock,
  DataTableBlock,
  DirectoryBlock,
  FaqAccordionBlock,
  FeatureCardsBlock,
  InfoPanelBlock,
  PageHeroBlock,
  StatsStripBlock,
  TabsPanelBlock,
  TeamCardsBlock,
  bannerEmpty,
  caseCardsEmpty,
  dataTableEmpty,
  directoryEmpty,
  faqAccordionEmpty,
  faqAccordionEntries,
  featureCardsEmpty,
  infoPanelEmpty,
  pageHeroEmpty,
  statsStripEmpty,
  tabsPanelEmpty,
  teamCardsEmpty,
} from "./managed-blocks";
import { MastheadBlock, mastheadEmpty } from "./masthead";
import { MistakesClaimBlock, mistakesClaimEmpty } from "./mistakes-claim";
import { QaListBlock, qaListEmpty } from "./qa-list";
import { QuoteCardsBlock, quoteCardsEmpty } from "./quote-cards";
import { ReviewsBlock, reviewsEmpty } from "./reviews-block";
import { RichTextBlock, richTextEmpty } from "./rich-text";
import { RoadmapTimelineBlock, roadmapTimelineEmpty } from "./roadmap-timeline";
import { SchemeSearchBlock, schemeSearchEmpty } from "./scheme-search";
import { StageChooserBlock, stageChooserEmpty } from "./stage-chooser";
import { StageSectionBlock, stageSectionEmpty } from "./stage-section";
import { StepsBlock, stepsEmpty } from "./steps";
import { TimelineStepsBlock, timelineStepsEmpty } from "./timeline-steps";
import { VideoBlock, videoEmpty } from "./video";

/*
 * ONE PLACE for block types. To add a block type:
 *   1. write its component (components/site-pages/<name>.jsx) taking { section, ctx };
 *   2. add one entry to BLOCKS below.
 * The server's block registry (GET /site-pages/registry) stays the source of
 * truth for fields, variants and the rail flag; this file is the code-side half:
 *
 *   Component  renders the block. ctx = { page, locale, t, tx, has, records,
 *              topic, stages, inColumn, tone }; section = { id, type, variant,
 *              label, anchor, data }.
 *   rail       built-in copy of the registry's rail flag: true = sits inside
 *              the sticky-enquiry-rail column on rail templates, false = full
 *              width (and ends the rail). Used only when the registry call fails
 *              or does not mention the block - the API's value wins.
 *   records    the kind of record the block links (the renderer resolves the
 *              editor's picks to the public records before rendering).
 *   isEmpty    (section, ctx) => true when there is nothing to show; the whole
 *              section is then dropped: no gap, no jump link, no structured data.
 *   faq        (section) => [{ question, answerHtml }] for FAQPage structured data.
 *   selfTone   the block paints its own band (no alternating wash behind it).
 */
export const BLOCKS = {
  masthead: { label: "Masthead", Component: MastheadBlock, rail: false, selfTone: true, isEmpty: () => mastheadEmpty() },
  rich_text: { label: "Rich text", Component: RichTextBlock, rail: true, isEmpty: (s) => richTextEmpty(s.data) },
  steps: { label: "Steps", Component: StepsBlock, rail: true, isEmpty: (s) => stepsEmpty(s.data) },
  card_grid: { label: "Card grid", Component: CardGridBlock, rail: true, isEmpty: (s) => cardGridEmpty(s.data) },
  stage_chooser: {
    label: "Stage chooser",
    Component: StageChooserBlock,
    rail: false,
    isEmpty: (s) => stageChooserEmpty(s.data),
  },
  stage_section: {
    label: "Stage section",
    Component: StageSectionBlock,
    rail: false,
    isEmpty: (s) => stageSectionEmpty(s.data),
  },
  linked_schemes: { label: "Linked schemes", Component: LinkedSchemesBlock, rail: true, records: "scheme", isEmpty: linkedEmpty },
  linked_services: { label: "Linked services", Component: LinkedServicesBlock, rail: true, records: "service", isEmpty: linkedEmpty },
  linked_cases: { label: "Linked case studies", Component: LinkedCasesBlock, rail: true, records: "case_study", isEmpty: linkedEmpty },
  linked_articles: { label: "Linked articles", Component: LinkedArticlesBlock, rail: true, records: "article", isEmpty: linkedEmpty },
  people: { label: "People", Component: PeopleBlock, rail: true, records: "adviser", isEmpty: linkedEmpty },
  faq: { label: "FAQ", Component: FaqBlock, rail: true, isEmpty: (s) => faqEmpty(s.data), faq: (s) => faqEntries(s.data) },
  faq_hub: {
    label: "FAQ hub",
    Component: FaqHubBlock,
    rail: false,
    isEmpty: (s) => faqHubEmpty(s.data),
    faq: (s) => faqHubEntries(s.data),
  },
  video: { label: "Video", Component: VideoBlock, rail: true, isEmpty: () => videoEmpty() },
  comparison: { label: "Comparison", Component: ComparisonBlock, rail: true, isEmpty: (s) => comparisonEmpty(s.data) },
  callout: { label: "Callout", Component: CalloutBlock, rail: true, isEmpty: (s) => calloutEmpty(s.data) },
  documents_checklist: {
    label: "Documents checklist",
    Component: DocumentsChecklistBlock,
    rail: true,
    isEmpty: (s) => documentsChecklistEmpty(s.data),
  },
  cta_panel: { label: "Closing panel", Component: CtaPanelBlock, rail: false, selfTone: true, isEmpty: (s) => ctaPanelEmpty(s.data) },
  enquiry_form: {
    label: "Enquiry form",
    Component: EnquiryFormBlock,
    rail: false,
    selfTone: true,
    isEmpty: () => enquiryFormEmpty(),
  },
};

// Added with the Figma hubs and the situation page (batch 2, agent A).
Object.assign(BLOCKS, {
  logo_strip: { label: "Client logo strip", Component: LogoStripBlock, rail: false, selfTone: true, isEmpty: () => logoStripEmpty() },
  mistakes_claim: {
    label: "Mistakes and stuck claim",
    Component: MistakesClaimBlock,
    rail: false,
    selfTone: true,
    isEmpty: (s) => mistakesClaimEmpty(s.data),
  },
  timeline_steps: {
    label: "Timeline steps",
    Component: TimelineStepsBlock,
    rail: true,
    isEmpty: (s) => timelineStepsEmpty(s.data),
  },
  scheme_search: { label: "Scheme search", Component: SchemeSearchBlock, rail: false, isEmpty: () => schemeSearchEmpty() },
  reviews_carousel: {
    label: "Client reviews carousel",
    Component: ReviewsBlock,
    rail: false,
    selfTone: true,
    isEmpty: () => reviewsEmpty(),
  },
  closing_panel: {
    label: "Closing enquiry panel",
    Component: ClosingPanelBlock,
    rail: false,
    selfTone: true,
    isEmpty: (s) => closingPanelEmpty(s.data),
  },
  qa_list: { label: "Quick answers", Component: QaListBlock, rail: true, isEmpty: (s) => qaListEmpty(s.data) },
  case_tiles: { label: "Case tiles", Component: CaseTilesBlock, rail: true, isEmpty: (s) => caseTilesEmpty(s.data) },
  quote_cards: { label: "Quote cards", Component: QuoteCardsBlock, rail: true, isEmpty: (s) => quoteCardsEmpty(s.data) },
  roadmap_timeline: {
    label: "Route timeline",
    Component: RoadmapTimelineBlock,
    rail: true,
    isEmpty: (s) => roadmapTimelineEmpty(s.data),
  },
});

// Blocks of the Managed pages (About, Contact, Resources, Scheme directory, Case
// archive, How we work, Home). The website's own views draw those pages; these
// components are the generic rendering (editor preview).
Object.assign(BLOCKS, {
  page_hero: { label: "Page hero", Component: PageHeroBlock, rail: false, selfTone: true, isEmpty: (s) => pageHeroEmpty(s.data) },
  stats_strip: { label: "Numbers strip", Component: StatsStripBlock, rail: false, isEmpty: (s) => statsStripEmpty(s.data) },
  data_table: { label: "Table with links", Component: DataTableBlock, rail: true, isEmpty: (s) => dataTableEmpty(s.data) },
  feature_cards: { label: "Feature cards", Component: FeatureCardsBlock, rail: true, isEmpty: (s) => featureCardsEmpty(s.data) },
  team_cards: { label: "People cards", Component: TeamCardsBlock, rail: true, isEmpty: (s) => teamCardsEmpty(s.data) },
  case_cards: { label: "Case cards", Component: CaseCardsBlock, rail: true, isEmpty: (s) => caseCardsEmpty(s.data) },
  faq_accordion: {
    label: "Questions (accordion)",
    Component: FaqAccordionBlock,
    rail: true,
    isEmpty: (s) => faqAccordionEmpty(s.data),
    faq: (s) => faqAccordionEntries(s.data),
  },
  banner: { label: "Banner", Component: BannerBlock, rail: false, selfTone: true, isEmpty: (s) => bannerEmpty(s.data) },
  directory: { label: "Searchable list", Component: DirectoryBlock, rail: false, isEmpty: (s) => directoryEmpty(s.data) },
  tabs_panel: { label: "Tabbed panel", Component: TabsPanelBlock, rail: true, isEmpty: (s) => tabsPanelEmpty(s.data) },
  info_panel: { label: "Info and photo panel", Component: InfoPanelBlock, rail: false, isEmpty: (s) => infoPanelEmpty(s.data) },
});

export const blockFor = (type) => (Object.hasOwn(BLOCKS, type) ? BLOCKS[type] : null);

export const recordTypeOf = (type) => blockFor(type)?.records;

// ── built-in copy of the server registry (templates + block rail flags) ──

const ALL = Object.keys(BLOCKS);
const without = (list, ...types) => list.filter((type) => !types.includes(type));

const HUB_ALLOWED = [
  "masthead",
  "card_grid",
  "stage_chooser",
  "stage_section",
  "linked_schemes",
  "linked_services",
  "linked_cases",
  "linked_articles",
  "faq",
  "faq_hub",
  "rich_text",
  "callout",
  "cta_panel",
  "enquiry_form",
  "video",
  "comparison",
  "people",
  "logo_strip",
  "mistakes_claim",
  "timeline_steps",
  "scheme_search",
  "reviews_carousel",
  "closing_panel",
  "data_table",
  "feature_cards",
  "team_cards",
  "case_cards",
  "faq_accordion",
  "banner",
  "directory",
  "tabs_panel",
  "info_panel",
];
const CONTENT_ALLOWED = without(ALL, "stage_chooser", "stage_section", "faq_hub", "mistakes_claim", "scheme_search");
const PROFILE_ALLOWED = [
  "masthead",
  "rich_text",
  "steps",
  "linked_schemes",
  "linked_services",
  "linked_cases",
  "linked_articles",
  "faq",
  "documents_checklist",
  "callout",
  "video",
  "cta_panel",
  "enquiry_form",
];

const railTemplate = (label, allowed = CONTENT_ALLOWED) => ({
  label,
  layout: "rail",
  allowed,
  required: ["masthead"],
  first: "masthead",
});

export const FALLBACK_REGISTRY = {
  templates: {
    hub: { label: "Hub", layout: "full", allowed: HUB_ALLOWED, required: ["masthead"], first: "masthead" },
    situation: railTemplate("Situation"),
    campaign: railTemplate("Campaign"),
    resource: railTemplate("Resource"),
    service: railTemplate("Service"),
    scheme: railTemplate("Scheme"),
    profile: railTemplate("Profile", PROFILE_ALLOWED),
    managed: { label: "Managed", layout: "full", allowed: ALL, required: [], first: null },
  },
  blocks: Object.fromEntries(ALL.map((type) => [type, { label: BLOCKS[type].label, rail: BLOCKS[type].rail }])),
};

// The registry the renderer works with: what the API served over the built-in
// copy (a failed call, null, leaves the built-in copy as it is).
export const resolveRegistry = (fetched) => mergeRegistry(fetched, FALLBACK_REGISTRY);

// Does this block sit in the sticky-enquiry-rail column?
export const isRailBlock = (registry, type) => registry.blocks?.[type]?.rail === true;
